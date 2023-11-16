// tslint:disable: unified-signatures
// tslint:disable: no-console

import TypedEmitter from "typed-emitter";
import {
    MgmtInterfaceHelloResponse, MgmtInterfaceHelloV3, MgmtInterfaceSampleFinishedResponse,
    MgmtInterfaceSampleProcessingResponse,
    MgmtInterfaceSampleReadingResponse, MgmtInterfaceSampleRequest,
    MgmtInterfaceSampleRequestSample,
    MgmtInterfaceSampleResponse,
    MgmtInterfaceSampleStartedResponse,
    MgmtInterfaceSampleUploadingResponse,
    MgmtInterfaceSnapshotFailedResponse,
    MgmtInterfaceSnapshotResponse,
    MgmtInterfaceSnapshotStartedResponse,
    MgmtInterfaceSnapshotStoppedResponse,
    MgmtInterfaceStartSnapshotRequest,
    MgmtInterfaceStopSnapshotRequest
} from "../MgmtInterfaceTypes";
import { IWebsocket } from "./iwebsocket";

import { EventEmitter } from './events';

import decompress from 'decompress';
import { ArduinoCLI, CODE_FOLDER } from "../../Adapter-MC/arduino-cli-exec-function";

const TCP_PREFIX = '\x1b[32m[WS ]\x1b[0m';

export type RemoteMgmtDeviceSampleEmitter = TypedEmitter<{
    started: () => void;
    uploading: () => void;
    reading: (progressPercentage: number) => void;
    processing: () => void;
}>;

export interface RemoteMgmtDevice extends TypedEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void;
}>  {
    connected: () => boolean;
    getDeviceId: () => Promise<string> | undefined;
    getDeviceType: () => string | undefined;
    getSensors: () => {
        name: string;
        maxSampleLengthS: number;
        frequencies: number[];
    }[] | undefined;
    serialDisconnect: () => Promise<void>;
    serialConnect: () => Promise<void>;
    sampleRequest: (data: MgmtInterfaceSampleRequestSample, ee: RemoteMgmtDeviceSampleEmitter) => Promise<string>;
    supportsSnapshotStreaming: () => boolean;
    supportsSnapshotStreamingWhileCapturing: () => boolean;
    startSnapshotStreaming: (resolution: 'high' | 'low') => Promise<void>;
    stopSnapshotStreaming: () => Promise<void>;
    beforeConnect: () => Promise<void>;
}

export interface RemoteMgmtConfig {
    command: 'edge-impulse-linux' | 'edge-impulse-daemon';
    endpoints: {
        internal: {
            ws: string;
            api: string;
            ingestion: string;
        };
    };
    api: {
        apiKey: string,
        projects: {
            // tslint:disable-next-line: max-line-length
            getProjectInfo(projectId: string, options: {headers:{}}): Promise<{ "id": string,
            "name": string,
            "sensorName": string,
            "deviceName": string,
            "userEmail": string }>;
        };
        devices: {
            // tslint:disable-next-line: max-line-length
            renameDevice(projectId: string, deviceId: string, opts: { name: string }): Promise<{ success: boolean, error?: string }>;
            // tslint:disable-next-line: max-line-length
            createDevice(projectId: string, opts: { deviceId: string, deviceType: string, ifNotExists: boolean }): Promise<{ success: boolean, error?: string }>;
            // tslint:disable-next-line: max-line-length
            getDevice(projectId: string, deviceId: string): Promise<{ success: boolean, error?: string, device?: { name: string; } }>;
        };
        whitelabels: {
            // tslint:disable-next-line: max-line-length
            getWhitelabelDomain(whitelabelId: number | null): Promise<{ success: boolean, domain?: string }>;
        }
    };
}

type RemoteMgmtState = 'snapshot-stream-requested' | 'snapshot-stream-started' |
                       'snapshot-stream-stopping' | 'sampling' | 'idle';

export class RemoteMgmt extends (EventEmitter as new () => TypedEmitter<{
    authenticationFailed: () => void,
}>) {
    private _ws: IWebsocket | undefined;
    private _projectId: string;
    private _devKeys: { apiKey: string, hmacKey: string };
    private _eiConfig: RemoteMgmtConfig;
    private _device: RemoteMgmtDevice;
    private _state: RemoteMgmtState = 'idle';
    private _snapshotStreamResolution: 'low' | 'high' = 'low';
    private _createWebsocket: (url: string) => IWebsocket;

    constructor(projectId: string,
                devKeys: { apiKey: string, hmacKey: string },
                eiConfig: RemoteMgmtConfig,
                device: RemoteMgmtDevice,
                createWebsocket: (url: string) => IWebsocket) {

        super();

        this._projectId = projectId;
        this._devKeys = devKeys;
        this._eiConfig = eiConfig;
        this._device = device;
        this._createWebsocket = createWebsocket;

        this.registerPingPong();

        this._device.on('snapshot', (buffer, filename) => {
            if (this._state === 'snapshot-stream-started' ||
                (this._state === 'sampling' && this._device.supportsSnapshotStreamingWhileCapturing()) && this._ws) {

                let res: MgmtInterfaceSnapshotResponse = {
                    snapshotFrame: buffer.toString('base64'),
                    fileName: filename,
                };
                if (this._ws) {
                    this._ws.send(JSON.stringify(res));
                }
            }
        });
    }

    async connect(reconnectOnFailure = true) {
        // await this._device.beforeConnect();

        console.log(TCP_PREFIX, `Connecting to ${this._eiConfig.endpoints.internal.ws}`);
        try {
            // @todo handle reconnect?
            this._ws = this._createWebsocket(this._eiConfig.endpoints.internal.ws);
            await this.attachWsHandlers();
        }
        catch (ex) {
            console.error(TCP_PREFIX, 'Failed to connect to', this._eiConfig.endpoints.internal.ws, ex);
            if (reconnectOnFailure) {
                setTimeout(() => {
                    // tslint:disable-next-line: no-floating-promises
                    this.connect();
                }, 1000);
            }
            else {
                throw ex;
            }
        }
    }

    disconnect() {
        if (this._ws) this._ws.terminate();
    }

    private registerPingPong() {
        setInterval(() => {
            let myws = this._ws;
            if (myws) {
                let received = false;
                myws.ping();
                myws.once('pong', () => {
                    received = true;
                });
                setTimeout(() => {
                    if (!received && this._ws && this._ws === myws) {
                        console.log(TCP_PREFIX, 'Not received pong from server within six seconds, re-connecting');
                        this._ws.terminate();
                    }
                }, 6000);
            }
        }, 30000);
    }

    private async attachWsHandlers() {
        if (!this._ws) {
            return console.log(TCP_PREFIX, 'attachWsHandlers called without ws instance!');
        }

        this._ws.on('message', async (data: Buffer | string) => {
            let d;
            try {
                if (typeof data === 'string') {
                    d = JSON.parse(data);
                }
                else {
                    d = JSON.parse(data.toString('utf-8'));
                }
            }
            catch (ex) {
                return;
            }
            // hello messages are handled in sendHello()
            if (typeof (<any>d).hello !== 'undefined') return;

            if (typeof (<any>d).sample !== 'undefined') {
                let s = (<MgmtInterfaceSampleRequest>d).sample;

                console.log(TCP_PREFIX, 'Incoming sampling request', s);

                let sampleHadError = false;
                let restartSnapshotOnFinished = false;
                let resetStateToSnapshotStreaming = false;

                try {
                    let ee = new EventEmitter() as TypedEmitter<{
                        started: () => void,
                        reading: (progressPercentage: number) => void,
                        uploading: () => void,
                        processing: () => void,
                    }>;

                    ee.on('started', () => {
                        let res2: MgmtInterfaceSampleStartedResponse = {
                            sampleStarted: true
                        };
                        if (this._ws) {
                            this._ws.send(JSON.stringify(res2));
                        }
                    });

                    ee.on('reading', (progressPercentage) => {
                        let res5: MgmtInterfaceSampleReadingResponse = {
                            sampleReading: true,
                            progressPercentage: progressPercentage
                        };
                        if (this._ws) {
                            this._ws.send(JSON.stringify(res5));
                        }
                    });

                    ee.on('uploading', () => {
                        let res5: MgmtInterfaceSampleUploadingResponse = {
                            sampleUploading: true
                        };
                        if (this._ws) {
                            this._ws.send(JSON.stringify(res5));
                        }
                    });

                    ee.on('processing', () => {
                        let res5: MgmtInterfaceSampleProcessingResponse = {
                            sampleProcessing: true
                        };
                        if (this._ws) {
                            this._ws.send(JSON.stringify(res5));
                        }
                    });

                    // wait 1 tick, if not have thrown any error yet then everything is OK
                    // and we have received the sample request
                    setTimeout(() => {
                        if (!sampleHadError) {
                            let res: MgmtInterfaceSampleResponse = {
                                sample: true
                            };
                            if (this._ws) {
                                this._ws.send(JSON.stringify(res));
                            }
                        }
                    }, 1);

                    restartSnapshotOnFinished = (this._state === 'snapshot-stream-started' || this._state === 'snapshot-stream-requested') && !this._device.supportsSnapshotStreamingWhileCapturing();

                    resetStateToSnapshotStreaming = (this._state === 'snapshot-stream-started' || this._state === 'snapshot-stream-requested');

                    if (restartSnapshotOnFinished) {
                        // wait until snapshot stream
                        if (this._state === 'snapshot-stream-requested') {
                            await this.waitForSnapshotStartedOrIdle();
                        }
                        if (this._state === 'snapshot-stream-started') {
                            this._state = 'snapshot-stream-stopping';
                            await this._device.stopSnapshotStreaming();
                            this._state = 'idle';
                        }
                    }

                    if (this._state === 'snapshot-stream-stopping') {
                        await this.waitForSnapshotStartedOrIdle();
                    }

                    this._state = 'sampling';

                    const sampleId = await this._device.sampleRequest(s, <RemoteMgmtDeviceSampleEmitter><unknown>ee);

                    sampleHadError = true; // if finished already stop it early

                    let res3: MgmtInterfaceSampleFinishedResponse = {
                        sampleFinished: true,
                        sampleId: sampleId,                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res3));
                    }
                }
                catch (ex2) {
                    sampleHadError = true;

                    let ex = <Error>ex2;
                    console.error(TCP_PREFIX, 'Failed to sample data', ex);
                    let res5: MgmtInterfaceSampleResponse = {
                        sample: false,
                        error: ex.message || ex.toString()
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res5));
                    }
                }
                finally {
                    this._state = 'idle';
                }

                if (restartSnapshotOnFinished) {
                    try {
                        this._state = 'snapshot-stream-requested';
                        await this._device.startSnapshotStreaming(this._snapshotStreamResolution);
                        this._state = 'snapshot-stream-started';
                    }
                    catch (ex2) {
                        if (<RemoteMgmtState>this._state === 'sampling') {
                            this._state = 'idle';
                        }
                    }
                }
                else if (resetStateToSnapshotStreaming) {
                    this._state = 'snapshot-stream-started';
                }
                return;
            }

            if (typeof (<MgmtInterfaceStartSnapshotRequest>d).startSnapshot !== 'undefined') {
                let req = <MgmtInterfaceStartSnapshotRequest>d;
                if (!req.resolution) {
                    req.resolution = 'low';
                }

                if (!this._device.supportsSnapshotStreaming()) {
                    let res1: MgmtInterfaceSnapshotFailedResponse = {
                        snapshotFailed: true,
                        error: 'Device does not support snapshot streaming'
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res1));
                    }
                    return;
                }

                if (this._state === 'sampling') {
                    let res1: MgmtInterfaceSnapshotFailedResponse = {
                        snapshotFailed: true,
                        error: 'Device is sampling, cannot start snapshot stream'
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res1));
                    }
                    return;
                }

                // already requested, skip this
                if (this._state === 'snapshot-stream-requested' ||
                    this._state === 'snapshot-stream-stopping') {
                    return;
                }

                // already started? then send the OK message nonetheless
                if (this._state === 'snapshot-stream-started') {
                    // already in snapshot mode...
                    let res3: MgmtInterfaceSnapshotStartedResponse = {
                        snapshotStarted: true
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res3));
                    }
                    return;
                }

                try {
                    this._state = 'snapshot-stream-requested';
                    await this._device.startSnapshotStreaming(req.resolution);
                    this._state = 'snapshot-stream-started';
                    this._snapshotStreamResolution = req.resolution;
                    let res2: MgmtInterfaceSnapshotStartedResponse = {
                        snapshotStarted: true
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res2));
                    }
                }
                catch (ex2) {
                    let ex = <Error>ex2;
                    let res1: MgmtInterfaceSnapshotFailedResponse = {
                        snapshotFailed: true,
                        error: ex.message || ex.toString()
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res1));
                    }
                    if (<RemoteMgmtState>this._state !== 'sampling') {
                        this._state = 'idle';
                    }
                }

                return;
            }

            if (typeof (<MgmtInterfaceStopSnapshotRequest>d).stopSnapshot !== 'undefined') {
                if (!this._device.supportsSnapshotStreaming()) {
                    let res1: MgmtInterfaceSnapshotFailedResponse = {
                        snapshotFailed: true,
                        error: 'Device does not support snapshot streaming'
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res1));
                    }
                    return;
                }

                if (this._state === 'snapshot-stream-requested') {
                    await this.waitForSnapshotStartedOrIdle();
                }

                if (this._state !== 'snapshot-stream-started') {
                    return;
                }

                try {
                    this._state = 'snapshot-stream-stopping';
                    await this._device.stopSnapshotStreaming();
                    this._state = 'idle';
                    let res2: MgmtInterfaceSnapshotStoppedResponse = {
                        snapshotStopped: true
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res2));
                    }
                }
                catch (ex2) {
                    let ex = <Error>ex2;
                    let res1: MgmtInterfaceSnapshotFailedResponse = {
                        snapshotFailed: true,
                        error: ex.message || ex.toString()
                    };
                    if (this._ws) {
                        this._ws.send(JSON.stringify(res1));
                    }
                }
                finally {
                    this._state = 'idle';
                }

                return;
            }

            if (typeof (<any>d).connect !== 'undefined') {
                try {
                    // const body = d.connect;
                    // const res = await fetch(`http://localhost:4800/api/device/flash/firmware`, {
                    //     headers: {"Content-type": "application/json; charset=UTF-8", 'x-jwt-project': this._devKeys.apiKey},
                    //     method: 'POST',
                    //     body: JSON.stringify({
                    //         device: body.device,
                    //         sensor: body.sensor,
                    //     }),
                    // });
                    // const buffer = await res.arrayBuffer();
                    // const file_name = `${res.headers.get('x-filename')}`;
                    
                    // if (!fs.existsSync(`${CODE_FOLDER}/${file_name}`)) fs.mkdirSync(`${CODE_FOLDER}/${file_name}`); //Optional if you already have downloads directory
                    // fs.writeFileSync(`${CODE_FOLDER}/${file_name}/${file_name}.zip`, Buffer.from(buffer));
                    // // await unzipper.Open.file(`${CODE_FOLDER}/${file_name}/${file_name}.zip`).then((d: unzipper.CentralDirectory) => d.extract({ path: `${CODE_FOLDER}/${file_name}` }));
                    const file_name = 'esp32-cam-comm';
                    decompress(`${CODE_FOLDER}/${file_name}/${file_name}.zip`, `${CODE_FOLDER}/${file_name}`)
                        .then(async (files) => {
                            console.log("Files unzipped successfully");
                            var cli = new ArduinoCLI();
        
                            console.log(file_name);
                            await cli.compile(file_name);
                            await this._device.serialDisconnect();
                            await cli.upload(file_name);
                            await this._device.serialConnect();
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                } catch (error) {
                    console.error('Error extracting the directory:', error);
                }
                console.log(TCP_PREFIX, 'received message', d);
            }


            // // let d = data.toString('ascii');
            // if (d.indexOf('EI_PUBLIC_IP') > -1) {
            //     d = d.replace('EI_PUBLIC_IP', ips[0].address + ':4810');
            //     data = Buffer.from(d, 'ascii');
            // }

            // console.log(TCP_PREFIX, 'Received over TCP', data.toString('ascii'));
            // serial.write(data);
        });

        this._ws.on('error', err => {
            console.error(TCP_PREFIX,
                `Error connecting to ${this._eiConfig.endpoints.internal.ws}`,
                (<any>err).code || err);
        });

        this._ws.on('close', () => {
            console.log(TCP_PREFIX, 'Trying to connect in 1 second...');
            setTimeout(this.connect.bind(this), 1000);
            if (this._ws) {
                this._ws.removeAllListeners();
            }
            this._ws = undefined;
        });

        this._ws.on('open', async () => {
            console.log(TCP_PREFIX, `Connected to ${this._eiConfig.endpoints.internal.ws}`);
            try {
                await this.sendHello();
            }
            catch (ex2) {
                let ex = <Error>ex2;
                console.error(TCP_PREFIX,
                    'Failed to connect to remote management service', ex.message || ex.toString(),
                    'retrying in 5 seconds...');
                setTimeout(this.sendHello.bind(this), 5000);
            }
        });
    }

    private async sendHello() {
        if (!this._ws) return;

        let deviceId = await this._device.getDeviceId();

        let req: MgmtInterfaceHelloV3 = {
            hello: {
                version: 3,
                projectId: this._projectId,
                apiKey: this._devKeys.apiKey,
                deviceId: deviceId,
                deviceType: this._device.getDeviceType(),
                connection: 'daemon',
                sensors: this._device.getSensors(),
                supportsSnapshotStreaming: this._device.supportsSnapshotStreaming()
            }
        };
        this._ws.once('message', async (helloResponse: Buffer) => {
            let ret = <MgmtInterfaceHelloResponse>JSON.parse(helloResponse.toString('utf-8'));
            if (!ret.hello) {
                console.error(TCP_PREFIX, 'Failed to authenticate, API key not correct?', ret.err);
                this.emit('authenticationFailed');
                if (this._ws) {
                    this._ws.removeAllListeners();
                    this._ws.terminate();
                    this._ws = undefined;
                }
            }
            else {
                // if (!deviceId) {
                //     throw new Error('Could not read serial number for device');
                // }
                // let name = await this.checkName(deviceId);

                const projectInfo = await this.getProjectInfo();
                // const projectInfo = {
                //     name: "name",
                //     whitelabelId: 1,
                // }
                let studioUrl = this._eiConfig.endpoints.internal.api.replace('/v1', '');
                // if (projectInfo.whitelabelId) {
                //     const whitelabelRes = await this._eiConfig.api.whitelabels.getWhitelabelDomain(
                //         projectInfo.whitelabelId
                //     );
                //     if (whitelabelRes.domain) {
                //         const protocol = this._eiConfig.endpoints.internal.api.startsWith('https') ? 'https' : 'http';
                //         studioUrl = `${protocol}://${whitelabelRes.domain}`;
                //     }
                // }

                console.log(TCP_PREFIX, 'Device "' + projectInfo.name + '" is now connected to project "' + projectInfo.name + '". To connect to another project, run `' + this._eiConfig.command + ' --clean`.');
                console.log(TCP_PREFIX, `Go to ${studioUrl}/studio/${this._projectId}/acquisition/training to build your machine learning model!`);
            }
        });
        this._ws.send(JSON.stringify(req));
    }

    private async getProjectInfo() {
        try {
            let projectBody = (await this._eiConfig.api.projects.getProjectInfo(this._projectId, {headers: {'x-jwt-user': this._eiConfig.api.apiKey}}));
            return projectBody;
        }
        catch (ex2) {
            let ex = <Error>ex2;
            throw ex.message || ex;
        }
    }

    private async waitForSnapshotStartedOrIdle() {
        let max = Date.now() + (5 * 1000);
        while (1) {
            if (Date.now() > max) {
                throw new Error('Timeout when waiting for snapshot to be started or idle');
            }
            await this.sleep(200);
            if (this._state === 'snapshot-stream-started' || this._state === 'idle') {
                return;
            }
        }
    }

    private sleep(ms: number) {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
}
