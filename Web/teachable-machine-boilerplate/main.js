// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "@babel/polyfill";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import 'ws';
// import jpegjs from 'jpeg-js';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam Image size. Must be 227. 
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

const device_array = ["AI Thinker ESP32-CAM", "ESP32 Wrover Module"];
const sensor_array = ["Camera OV2640 (160x120)"];

var get_data_time = Date.now()
const default_src = './default-img.png'
var img = default_src;
var uploaded_img = undefined;
var projectId = undefined;
var devKeys = undefined;

class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    this.form = document.createElement('div');

    var device_html = document.createElement('select')


    for (var i = 0; i < device_array.length; i++) {
        var option = document.createElement("option");
        option.value = device_array[i];
        option.text = device_array[i];
        device_html.appendChild(option);
    }
    device_html[0].selected = "selected";

    var sensor_html = document.createElement('select')


    for (var i = 0; i < sensor_array.length; i++) {
        var option = document.createElement("option");
        option.value = sensor_array[i];
        option.text = sensor_array[i];
        sensor_html.appendChild(option);
    }
    sensor_html[0].selected = "selected";

    const form_button = document.createElement('button')
    form_button.innerText = "Connect";
    
    // Listen for mouse events when clicking the form_button
    form_button.addEventListener('mousedown', async (e) => {
      console.log(device_html.value, sensor_html.value);
      this.ws.send(JSON.stringify({
        connect: {
          device: {
            name: device_html.value,
            platformUrl: "",
            config: {},
          },
          sensor: {
            name: sensor_html.value,
            sampleSpeed: 1,
            frequencies: [1],
          },
        }
      }));
    }, false);
    
    this.form.appendChild(device_html)
    this.form.appendChild(sensor_html)
    this.form.appendChild(form_button);

    document.body.appendChild(this.form);


    // Add video element to DOM
    this.img_ele = document.createElement('img');
    this.img_ele.style.width = "160px";
    this.img_ele.style.height = "120px";

    this.img_ele.src = img;
    // this.img_ele.setAttribute('name', 'image');
    document.body.appendChild(this.img_ele);

    // Create training buttons and info texts    
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      div.style.marginBottom = '10px';

      // Create training button
      const button = document.createElement('button')
      button.innerText = "Train " + i;
      div.appendChild(button);

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', (e) => {
        this.training = i;
        this.ws.send(JSON.stringify({
          "sample": {
              "label": "img",
              "length": 10000,
              "path": "/api/data",
              "hmacKey": "",
              "interval": 10,
              "sensor": "Camera (160x120)"
          }
        }));
        get_data_time = Date.now();

      }, false);
      // button.addEventListener('mouseup', (e) => this.training = -1, false);

      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = " No examples added";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }
  }
  
async bindPage() {
  this.knn = knnClassifier.create();
  this.mobilenet = await mobilenetModule.load();


  this.ws = new WebSocket('ws://localhost:4802');
  this.ws.onopen = async () => {
    await fetch('http://localhost:4800/auth/login', {
      headers: {"Content-type": "application/json; charset=UTF-8"},
      method: 'POST',
      agentOptions: {keepAlive: true},
      json: true,
      body: JSON.stringify({
        email: "admin@gmail.com",
        password: "admin"
      }),
    })
      .then((response)=>response.text())
      .then(async (user_jwt) => {
        await fetch('http://localhost:4800/api/project', {
        headers: {"Content-type": "application/json", "x-jwt-user": user_jwt},
        method: 'GET',
        agentOptions: {keepAlive: true},
        json: true,
      })
      .then((response)=>response.text())
      .then(async(text) => {
        const projects = JSON.parse(text);
        projectId = projects[0].id;
        await fetch(`http://localhost:4800/api/project/key/${projectId}`, {
          headers: {"Content-type": "application/json; charset=UTF-8", "x-jwt-user": user_jwt},
          method: 'GET',
          agentOptions: {keepAlive: true},
          json: true,
        })
        .then((response)=>response.text())
        .then(async(text) => {
          devKeys = text
          this.ws.send(JSON.stringify({
            hello: {
              apiKey: text,
              projectId: projectId,
              connection: 'web',
            }
          }))

        })
      })

    })
  }

  this.ws.onmessage = async (event) => {
    console.log('received: %s', event.data);
    const data = JSON.parse(event.data);
    if (data.sampleFinished) {
      await fetch(`http://localhost:4800/api/data/${data.sampleId}`, {
        headers: {'x-jwt-project': devKeys},
        method: 'GET',
      })
      .then(async (response) => {
        const myBlob = await response.blob();
        console.log(myBlob);
        const objectURL = URL.createObjectURL(myBlob);
        uploaded_img = objectURL;
        this.gotImg();
        console.log(Date.now() - get_data_time)
      });
      // this.ws.close();
    };
  };
}
    
  async gotImg() {
    if (uploaded_img != undefined) {
      this.img_ele.src = uploaded_img;
      // Get image data from video element
      const image = tf.fromPixels(this.img_ele);
      
      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');
      
      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();
        
        // Add current image to classifier
        this.knn.addExample(logits, this.training)
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          if (res.classIndex == i) {
            this.infoTexts[i].style.fontWeight = 'bold';
          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (exampleCount[i] > 0) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples - ${res.confidences[i] * 100}%`
          }
        }
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
      this.uploaded_img = undefined;
      this.training = -1;
    }
  }
}

window.addEventListener('load', () => new Main());