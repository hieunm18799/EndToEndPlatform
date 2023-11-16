// tslint:disable: no-unsafe-any

// tslint:disable-next-line
const { SerialPort } = require('serialport');
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { ISerialConnector, SERIAL_STATE } from '../shared/daemon/iserialconnector';

// Don't open same port twice
let serialPorts: { [index: string]: { message: typeof SerialPort } } = { };

interface SerialPortListItem {
    path: string;
    manufacturer: string;
    serialNumber: string;
    pnpId: string;
    locationId: string;
    vendorId: string;
    productId: string;
}

export class SerialConnector extends (EventEmitter as new () => TypedEmitter<{
    connected: () => void;
    data: (buffer: Buffer) => void;
    error: (err: any) => void;
    close: () => void;
}>) implements ISerialConnector {
    static async list() {
        return (await SerialPort.list()) as SerialPortListItem[];
    }

    private _connected: boolean;
    private _echoSerial: boolean;
    private _path: string;
    private _baudrate: number;
    private _serial: typeof SerialPort;
    private _state: SERIAL_STATE;
    private _dataHandler: (a: Buffer) => void;

    constructor(path: string, baudrate: number, echoSerial: boolean = false) {
        super();
        this._state = SERIAL_STATE.NONE;
        this._echoSerial = echoSerial;
        this._path = path;
        this._baudrate = baudrate;
        this._dataHandler = (d: Buffer) => {
            if (this._echoSerial) {
                const CON_PREFIX = '\x1b[36m[Rx ]\x1b[0m';
                console.log(CON_PREFIX, d.toString('ascii'));
            }
            this.emit('data', d);
        };
        this._connected = false;
    }

    getPath() {
        return this._path;
    }

    isConnected() {
        return this._connected;
    }

    async connect() {
        this._state = SERIAL_STATE.INIT;
        console.log('init');
        
        if (serialPorts[this._path]) {
            this._serial = serialPorts[this._path];
            this._state = SERIAL_STATE.CONNECT;
        }
        else {
            this._serial = new SerialPort({ path: this._path, baudRate: this._baudrate, autoOpen: true });
            // this._parser = this._serial.pipe(new ReadlineParser({ delimiter: '\r\n', includeDelimiter: false }));
            
            this._serial.on('open', () => {
                this._serial.set({ brk: false, cts: false, dtr: false, rts: false });
                // Skip some unable to read data
                this._serial.flush(function(err: Error){});
            })
            console.log('done init');
            
            serialPorts[this._path] = this._serial;
            
            this._serial.on('close', () => {
                this._serial = null;
                delete serialPorts[this._path];
                this._connected = false;
                this.emit('close');
            });
            this._state = SERIAL_STATE.CONNECT
        }
        
        this._serial.on('data', this._dataHandler);
        
        if (this._state == SERIAL_STATE.CONNECT) {
            return;
        }
        
        // otherwise wait for either error or open event
        return new Promise<void>((resolve, reject) => {
            this._serial.once('error', (ex: any) => {
                this._serial = null;
                delete serialPorts[this._path];
                reject(ex);
            });
            this._serial.once('open', () => {
                this._connected = true;


                this.emit('connected');

                this._serial.on('error', (ex: any) => this.emit('error', ex));

                resolve();
            });
        });
    }

    async disconnect() {
        this._state = SERIAL_STATE.DISCONNECT;
        return await this._serial.close();
    }

    async write(buffer: Buffer) {
        return new Promise<void>((res, rej) => {
            if (!this._serial) return rej('Serial is null');
            if (this._echoSerial) {
                const CON_PREFIX = '\x1b[35m[Tx ]\x1b[0m';
                console.log(CON_PREFIX, buffer.toString('ascii'));
            }
            this._serial.write(buffer, (err: any) => {
                if (err) return rej(err);
                res();
            });
        });
    }

    async setBaudRate(baudRate: number) {
        await this._serial.update({
            baudRate: baudRate
        });
        this._baudrate = baudRate;
    }

    getBaudRate() {
        return this._baudrate;
    }

    // async disconnect() {
    //     this._serial.off('data', this._dataHandler);
    //     return true;
    // }

    async getMACAddress() {
        let list = await SerialConnector.list();
        let l = list.find(j => j.path === this._path);
        return l ? l.serialNumber : null;
    }

    async hasSerial() {
        return !!this._serial;
    }

    canSwitchBaudRate() {
        return true;
    }
    
    getState() {
        return this._state;
    }
}
