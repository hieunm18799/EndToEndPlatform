import { Sensor } from "./interface/sensor";

export class Sensor_CAM_OV2640 implements Sensor {
    name: string;
    sampleSpeed: number;
    frequencies: number[];

    constructor({name = "CAMERA OV2640", sampleSpeed = 1, frequencies = [1]}
    : {name?: string, sampleSpeed?: number, frequencies?: number[]}){
        this.name = name;
        this.sampleSpeed = sampleSpeed;
        this.frequencies = frequencies;
    }
}

