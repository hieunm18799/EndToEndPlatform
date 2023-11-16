import { Data } from "./data";


export class Project {
    id: string;
    name: string;
    datas: Data[];
    sensorName: string;
    deviceName: string;
    userEmail: string;

    constructor({name, datas = [], sensorName = "", deviceName = "", userEmail}
    : {name: string, datas: Data[], sensorName: string, deviceName: string, userEmail: string}){
        this.id = crypto.randomUUID();
        this.name = name;
        this.datas = datas;
        this.sensorName = sensorName;
        this.deviceName = deviceName;
        this.userEmail = userEmail;
    }
}

