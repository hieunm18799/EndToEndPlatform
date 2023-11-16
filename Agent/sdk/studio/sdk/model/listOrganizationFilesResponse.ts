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
import { ListOrganizationFilesResponseAllOf } from './listOrganizationFilesResponseAllOf';
import { OrganizationDataItem } from './organizationDataItem';

export class ListOrganizationFilesResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    'filterParseError'?: string;
    'totalFileSize': number;
    'totalFileCount': number;
    'totalDataItemCount': number;
    'data': Array<OrganizationDataItem>;

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
            "name": "filterParseError",
            "baseName": "filterParseError",
            "type": "string"
        },
        {
            "name": "totalFileSize",
            "baseName": "totalFileSize",
            "type": "number"
        },
        {
            "name": "totalFileCount",
            "baseName": "totalFileCount",
            "type": "number"
        },
        {
            "name": "totalDataItemCount",
            "baseName": "totalDataItemCount",
            "type": "number"
        },
        {
            "name": "data",
            "baseName": "data",
            "type": "Array<OrganizationDataItem>"
        }    ];

    static getAttributeTypeMap() {
        return ListOrganizationFilesResponse.attributeTypeMap;
    }
}

