import { execSync, spawn } from "child_process";
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const ARDUINO_FOLDER = `${process.cwd()}/Adapter-MC`
export const CODE_FOLDER = `${ARDUINO_FOLDER}/code`;
const DEFAULT_ARDUINO_CLI = `${ARDUINO_FOLDER}/arduino-cli`;
const BUILD_FOLDER = `build`
const ARDUINO_CLI_FILE = `${ARDUINO_FOLDER}/arduino-cli.yaml`;
const CONFIG_FILE_ACTIVE = [`--config-file`, ARDUINO_CLI_FILE];

interface ArduinoCLI_Oject extends Object {
    board_manager: {
        additional_urls: [string]
    },
    build_cache: {
        compilations_before_purge: number
        ttl: string
    },
    daemon: {
        port: string
    },
    directories:
    {
        data: string
        downloads: string
        user: string

    },
    library: {
        enable_unsafe_install: boolean
    }
    logging: {
        file: string
        format: string
        level: string
    },
    metrics: {
        addr: string
        enabled: boolean
    }
    output: {
        no_color: boolean
    }
    sketch: {
        always_export_binaries: boolean
    }
    updater: {
        enable_notification: boolean
    }
}

interface SketchObject extends Object {
    profiles: {
        [key: string]: {
            board_name: string
            board_option: string
            fqbn: string
            platforms: [
                {platform: string,
                    platform_index_url: string}
            ]
            libraries: [
                {[key: string]: string}
            ]
        }
    },

    default_profile: string,
    default_fqbn: string,
    default_protocol: string,
}

export class ArduinoCLI {
    constructor() {
        try {
            function changeAndWriteFile(doc: ArduinoCLI_Oject) {
                doc.directories.data = `${ARDUINO_FOLDER}/arduino/.arduino15`;
                doc.directories.downloads = `${ARDUINO_FOLDER}/arduino/.arduino15/staging`;
                doc.directories.user = `${ARDUINO_FOLDER}/arduino/Arduino`;

                doc.library.enable_unsafe_install = true;
                doc.sketch.always_export_binaries = true;
        
                fs.writeFile(ARDUINO_CLI_FILE, yaml.dump(doc, {'flowLevel': 2}), (err) => {
                    if (err) {
                        console.log(err);
                        return false
                    }
                });
            }
            if (!fs.existsSync(ARDUINO_CLI_FILE)) {
                let stdout = execSync(DEFAULT_ARDUINO_CLI + ` config dump`);
                console.log(stdout);
                const doc = yaml.load(stdout.toString()) as ArduinoCLI_Oject;
                changeAndWriteFile(doc);
                
            } else {
                const doc = yaml.load(fs.readFileSync(ARDUINO_CLI_FILE, 'utf8')) as ArduinoCLI_Oject;
                if (doc.directories?.data != `${ARDUINO_FOLDER}/arduino/.arduino15`) {
                    changeAndWriteFile(doc);    
                }
            }
        } catch (ex) {
            console.log(ex);
            throw(ex);
        }
    }

    async boards_list() {
        let data: string[][];
        //Board list return format: Port | Type | Board | Name | FQBN | Core
        let res = await this.run([`board`,`list`]);
        data = res.toString().split('\n').slice(1).map(s => {
            return s.trim().split(/\s+(?![^\(]*\))/);
            // if (match) return [match[1], match[2]];
        });
        console.log(data);
        return data;
    }

    async boards_list_all(boardname: string) {
        let data: string[][];
        //Board list return format: Board Name | FQBN
        let res = await this.run([`board`,`listall`, boardname]);
        data = res.toString().split('\n').slice(1).map(s => {
            const match = s.trim().match(/(\S.*?)\s{2,}(\S.+)/);
            if (match) return [match[1], match[2]];
        }) as string[][];
        console.log(data);
        return data;
    }
    
    async core_add(url: string) {
        //Add board to arduino.yaml file
        await this.run([`config`, `add`, `board_manager.additional_urls`, `${url}`]);
        //Updates the index of cores.
        await this.run([`core`, `update-index`]);
    }
    
    async core_install(core_name: string) {
        //Install core
        await this.run([`core`, `install`, `${core_name}`]);
    }
    
    async libraries_list() {
        let libs = await this.run([`lib`, `list`]) || ``;
        if (libs.includes(`No libraries installed.`) || libs.toString() == ``) return undefined;
        return libs;
    }
    
    async libraries_install_need(libs_need: string[]) {
        let libs = await this.libraries_list() || ``;
        let install_libs = libs_need.filter((lib: string) => {return libs.indexOf(lib)});
        if (install_libs.length) {
            install_libs.forEach(async (lib) => {
                await this.run([`lib`, `install`])
            });
        } else {
            console.log(`All needed libraries are already installed`);
        }
    }

    async compile(profile: string) {
        console.log(await this.run([`compile`, `${CODE_FOLDER}/${profile}`, `--build-path`, `${CODE_FOLDER}/${profile}/${BUILD_FOLDER}`]));
    }

    async compileAndUpload(profile: string, deviceName: string, coreUrl: string) {
        // Compile
        await this.core_install(coreUrl);
        const data = await this.boards_list_all(deviceName);
        if (!data) throw Error('Device not found!');
        console.log(await this.run([`compile`, `${CODE_FOLDER}/${profile}`, '-b', data[0][1]]));

        // Upload
        await this.upload(profile)
    }

    async upload(profile: string) {
        try {
            // await this.compile(profile);
            let ports = await this.boards_list();
            const doc = yaml.load(fs.readFileSync(`${CODE_FOLDER}/${profile}/sketch.yaml`, 'utf8')) as SketchObject;
            console.log(doc);
            let res = await this.run([`upload`, `${CODE_FOLDER}/${profile}`, `--port`, `${ports[0][0]}`, `--board-options`, `${doc.profiles[profile].board_option}`, `--input-dir`, `${CODE_FOLDER}/${profile}/${BUILD_FOLDER}`])
            // console.log(res.toString());
        } catch (e) {
            console.log(e);
            return false
        }
        return true;
    }

    async createSketch(object: SketchObject) {
        fs.writeFile(`${CODE_FOLDER}/${object?.profiles[0]}/sketch.yaml`, yaml.dump(object, {'flowLevel': 2}), (err) => {
            if (err) {
                console.log(err);
                return false
            }
        });
    }
    
    private async run(arg: string[]): Promise<Buffer> {
        console.log(arg);
        const childProcess = spawn(DEFAULT_ARDUINO_CLI, [...CONFIG_FILE_ACTIVE, ...arg]);
        return new Promise((resolve, reject) => {
            let stdoutBuffer = Buffer.from([]);
            let stderrBuffer = Buffer.from([]);

            // Stream the output of the command in real-time
            childProcess.stdout.on('data', (data) => {
                stdoutBuffer = Buffer.concat([stdoutBuffer, data]);
                console.log(`Output: ${data}`);
            });

            // Stream the error output, if any
            childProcess.stderr.on('data', (data) => {
                stderrBuffer = Buffer.concat([stderrBuffer, data]);
                console.error(`Error: ${data}`);
            });

            // Listen for the 'close' event to know when the command has completed
            childProcess.on('close', (code) => {
                console.log(`Command exited with code ${code}`);

                if (code === 0) {
                    resolve(stdoutBuffer);
                } else {
                    const errorMessage = `Command exited with code ${code}\n${stderrBuffer.toString()}`;
                    reject(new Error(errorMessage));
                }
            });

            childProcess.on('error', (err) => {
                console.error(`Error starting command: ${err}`);
                reject(err);
            });
          });
    }
}

// (async () => {
    // const cli = new ArduinoCLI();

    // cli.boards_list_all('esp32');
    // cli.compile('my_code');
    // cli.upload('my_code');
    // cli.upload('esp32-cam-comm')
// })