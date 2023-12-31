/**
 * Edge Impulse API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// tslint:disable-next-line: variable-name, no-var-requires
const PATH = require('path');
// tslint:disable-next-line: no-unsafe-any
module.paths.push(PATH.join(process.cwd(), 'node_modules'));

import localVarRequest = require('request');
import http = require('http');

/* tslint:disable:no-unused-locals */

import { ObjectSerializer, Authentication, VoidAuth } from '../model/models';
import { HttpBasicAuth, ApiKeyAuth, OAuth } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'https://studio.edgeimpulse.com';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum SupportsRangeApiApiKeys {
    ApiKeyAuthentication,
    JWTAuthentication,
    JWTHttpHeaderAuthentication,
}

type getSampleAsAudioQueryParams = {
    axisIx: number,
    sliceStart?: number,
    sliceEnd?: number,
};


export type SupportsRangeApiOpts = {
    extraHeaders?: {
        [name: string]: string
    },
};

export class SupportsRangeApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders : any = {};
    protected _useQuerystring : boolean = false;
    protected _opts : SupportsRangeApiOpts = { };

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
        'ApiKeyAuthentication': new ApiKeyAuth('header', 'x-api-key'),
        'JWTAuthentication': new ApiKeyAuth('cookie', 'jwt'),
        'JWTHttpHeaderAuthentication': new ApiKeyAuth('header', 'x-jwt-token'),
    }

    constructor(basePath?: string, opts?: SupportsRangeApiOpts);
    constructor(basePathOrUsername: string, opts?: SupportsRangeApiOpts, password?: string, basePath?: string) {
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        } else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername
            }
        }

        this.opts = opts ?? { };
    }

    set useQuerystring(value: boolean) {
        this._useQuerystring = value;
    }

    set basePath(basePath: string) {
        this._basePath = basePath;
    }

    get basePath() {
        return this._basePath;
    }

    set opts(opts: SupportsRangeApiOpts) {
        this._opts = opts;
    }

    get opts() {
        return this._opts;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: SupportsRangeApiApiKeys, value: string | undefined) {
        (this.authentications as any)[SupportsRangeApiApiKeys[key]].apiKey = value;
    }


    /**
     * Get a sample as a WAV file. This only applies to samples with an audio axis.
     * @summary Get WAV file
     * @param projectId Project ID
     * @param sampleId Sample ID
     * @param axisIx Axis index
     * @param sliceStart Begin index of the slice
     * @param sliceEnd End index of the slice
     */
    public async getSampleAsAudio (projectId: string, sampleId: number, queryParams: getSampleAsAudioQueryParams, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<Buffer> {
        const localVarPath = this.basePath + '/api/{projectId}/raw-data/{sampleId}/wav'
            .replace('{' + 'projectId' + '}', encodeURIComponent(String(projectId)))
            .replace('{' + 'sampleId' + '}', encodeURIComponent(String(sampleId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({
            'User-Agent': 'edgeimpulse-api nodejs'
        }, this.defaultHeaders);
        const produces = ['audio/wav'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'projectId' is not null or undefined


        if (projectId === null || projectId === undefined) {
            throw new Error('Required parameter projectId was null or undefined when calling getSampleAsAudio.');
        }

        // verify required parameter 'sampleId' is not null or undefined


        if (sampleId === null || sampleId === undefined) {
            throw new Error('Required parameter sampleId was null or undefined when calling getSampleAsAudio.');
        }

        // verify required parameter 'axisIx' is not null or undefined

        if (queryParams.axisIx === null || queryParams.axisIx === undefined) {
            throw new Error('Required parameter queryParams.axisIx was null or undefined when calling getSampleAsAudio.');
        }


        if (queryParams.axisIx !== undefined) {
            localVarQueryParameters['axisIx'] = ObjectSerializer.serialize(queryParams.axisIx, "number");
        }

        if (queryParams.sliceStart !== undefined) {
            localVarQueryParameters['sliceStart'] = ObjectSerializer.serialize(queryParams.sliceStart, "number");
        }

        if (queryParams.sliceEnd !== undefined) {
            localVarQueryParameters['sliceEnd'] = ObjectSerializer.serialize(queryParams.sliceEnd, "number");
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'GET',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            encoding: null,
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<Buffer>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Buffer");

                        const errString = `Failed to call "${localVarPath}", returned ${response.statusCode}: ` + response.body;

                        if (typeof body.success === 'boolean' && !body.success) {
                            reject(new Error(body.error || errString));
                        }
                        else if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve(body);
                        }
                        else {
                            reject(errString);
                        }
                    }
                });
            });
        });
    }

    /**
     * Get the synthetic sample as a WAV file
     * @summary Get WAV file
     * @param projectId Project ID
     */
    public async getWavFile (projectId: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<Buffer> {
        const localVarPath = this.basePath + '/api/{projectId}/performance-calibration/wav'
            .replace('{' + 'projectId' + '}', encodeURIComponent(String(projectId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({
            'User-Agent': 'edgeimpulse-api nodejs'
        }, this.defaultHeaders);
        const produces = ['audio/wav'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'projectId' is not null or undefined


        if (projectId === null || projectId === undefined) {
            throw new Error('Required parameter projectId was null or undefined when calling getWavFile.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'GET',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            encoding: null,
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<Buffer>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Buffer");

                        const errString = `Failed to call "${localVarPath}", returned ${response.statusCode}: ` + response.body;

                        if (typeof body.success === 'boolean' && !body.success) {
                            reject(new Error(body.error || errString));
                        }
                        else if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve(body);
                        }
                        else {
                            reject(errString);
                        }
                    }
                });
            });
        });
    }
}
