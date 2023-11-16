enum DataTypes {
    TRAINING = 'training',
    VALIDATE = 'validate',
    TESTING = 'testing',
}

export class Data {
    id: string;
    name: string;
    location: string;
    label: string;   
    type: string;
    projectId: string;

    constructor({name, location = "", label = "", type = DataTypes.TRAINING, projectId}
    : {name: string, location?: string, label?: string, type?: string, projectId: string}){
        this.id = crypto.randomUUID();
        this.name = name;
        this.location = location;
        this.label = label;
        this.type = Object.keys(DataTypes).includes(type) ? type : DataTypes.TRAINING;
        this.projectId = projectId;
    }
}

