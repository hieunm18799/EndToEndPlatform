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

import { GenericApiResponse } from './genericApiResponse';
import { GetOrganizationPortalResponseAllOf } from './getOrganizationPortalResponseAllOf';

export class GetOrganizationPortalResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    /**
    * Portal ID for the new upload portal
    */
    'id': number;
    /**
    * The name of the upload portal.
    */
    'name': string;
    /**
    * The purpose and description of the upload portal.
    */
    'description'?: string;
    /**
    * The url postfix of the upload portal.
    */
    'url': string;
    /**
    * The token used to validate access to the upload portal.
    */
    'token': string;
    /**
    * The S3 bucket name to store the uploaded data.
    */
    'bucketName': string;
    /**
    * S3 bucket ID. If missing, then this is using the Edge Impulse hosted bucket.
    */
    'bucketId'?: number;
    /**
    * The S3 bucket path where uploaded data is stored.
    */
    'bucketPath': string;
    /**
    * The full S3 bucket path where uploaded data is stored.
    */
    'bucketUrl'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "success",
            "baseName": "success",
            "type": "boolean"
        },
        {
            "name": "error",
            "baseName": "error",
            "type": "string"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "url",
            "baseName": "url",
            "type": "string"
        },
        {
            "name": "token",
            "baseName": "token",
            "type": "string"
        },
        {
            "name": "bucketName",
            "baseName": "bucketName",
            "type": "string"
        },
        {
            "name": "bucketId",
            "baseName": "bucketId",
            "type": "number"
        },
        {
            "name": "bucketPath",
            "baseName": "bucketPath",
            "type": "string"
        },
        {
            "name": "bucketUrl",
            "baseName": "bucketUrl",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return GetOrganizationPortalResponse.attributeTypeMap;
    }
}

