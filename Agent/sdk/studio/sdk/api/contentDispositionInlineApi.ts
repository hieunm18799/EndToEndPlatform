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

export enum ContentDispositionInlineApiApiKeys {
    ApiKeyAuthentication,
    JWTAuthentication,
    JWTHttpHeaderAuthentication,
}

type previewOrganizationDataFileQueryParams = {
    fileName: string,
};


export type ContentDispositionInlineApiOpts = {
    extraHeaders?: {
        [name: string]: string
    },
};

export class ContentDispositionInlineApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders : any = {};
    protected _useQuerystring : boolean = false;
    protected _opts : ContentDispositionInlineApiOpts = { };

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
        'ApiKeyAuthentication': new ApiKeyAuth('header', 'x-api-key'),
        'JWTAuthentication': new ApiKeyAuth('cookie', 'jwt'),
        'JWTHttpHeaderAuthentication': new ApiKeyAuth('header', 'x-jwt-token'),
    }

    constructor(basePath?: string, opts?: ContentDispositionInlineApiOpts);
    constructor(basePathOrUsername: string, opts?: ContentDispositionInlineApiOpts, password?: string, basePath?: string) {
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

    set opts(opts: ContentDispositionInlineApiOpts) {
        this._opts = opts;
    }

    get opts() {
        return this._opts;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: ContentDispositionInlineApiApiKeys, value: string | undefined) {
        (this.authentications as any)[ContentDispositionInlineApiApiKeys[key]].apiKey = value;
    }


    /**
     * Preview a single file from a data item (same as downloadOrganizationDataFile but w/ content-disposition inline).
     * @summary Preview file
     * @param organizationId Organization ID
     * @param dataId Data ID
     * @param fileName File name
     */
    public async previewOrganizationDataFile (organizationId: number, dataId: number, queryParams: previewOrganizationDataFileQueryParams, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<Buffer> {
        const localVarPath = this.basePath + '/api/organizations/{organizationId}/data/{dataId}/files/preview'
            .replace('{' + 'organizationId' + '}', encodeURIComponent(String(organizationId)))
            .replace('{' + 'dataId' + '}', encodeURIComponent(String(dataId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({
            'User-Agent': 'edgeimpulse-api nodejs'
        }, this.defaultHeaders);
        const produces = ['application/octet-stream'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'organizationId' is not null or undefined


        if (organizationId === null || organizationId === undefined) {
            throw new Error('Required parameter organizationId was null or undefined when calling previewOrganizationDataFile.');
        }

        // verify required parameter 'dataId' is not null or undefined


        if (dataId === null || dataId === undefined) {
            throw new Error('Required parameter dataId was null or undefined when calling previewOrganizationDataFile.');
        }

        // verify required parameter 'fileName' is not null or undefined

        if (queryParams.fileName === null || queryParams.fileName === undefined) {
            throw new Error('Required parameter queryParams.fileName was null or undefined when calling previewOrganizationDataFile.');
        }


        if (queryParams.fileName !== undefined) {
            localVarQueryParameters['fileName'] = ObjectSerializer.serialize(queryParams.fileName, "string");
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
