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

import { TransformationBlockAdditionalMountPoint } from './transformationBlockAdditionalMountPoint';

export class AddOrganizationTransformationBlockRequest {
    'name': string;
    'dockerContainer': string;
    /**
    * Whether to pass the `--metadata` parameter to the container.
    */
    'indMetadata': boolean;
    'description': string;
    'cliArguments': string;
    'requestsCpu'?: number;
    'requestsMemory'?: number;
    'limitsCpu'?: number;
    'limitsMemory'?: number;
    'additionalMountPoints': Array<TransformationBlockAdditionalMountPoint>;
    'operatesOn': AddOrganizationTransformationBlockRequestOperatesOnEnum;
    'allowExtraCliArguments'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "dockerContainer",
            "baseName": "dockerContainer",
            "type": "string"
        },
        {
            "name": "indMetadata",
            "baseName": "indMetadata",
            "type": "boolean"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "cliArguments",
            "baseName": "cliArguments",
            "type": "string"
        },
        {
            "name": "requestsCpu",
            "baseName": "requestsCpu",
            "type": "number"
        },
        {
            "name": "requestsMemory",
            "baseName": "requestsMemory",
            "type": "number"
        },
        {
            "name": "limitsCpu",
            "baseName": "limitsCpu",
            "type": "number"
        },
        {
            "name": "limitsMemory",
            "baseName": "limitsMemory",
            "type": "number"
        },
        {
            "name": "additionalMountPoints",
            "baseName": "additionalMountPoints",
            "type": "Array<TransformationBlockAdditionalMountPoint>"
        },
        {
            "name": "operatesOn",
            "baseName": "operatesOn",
            "type": "AddOrganizationTransformationBlockRequestOperatesOnEnum"
        },
        {
            "name": "allowExtraCliArguments",
            "baseName": "allowExtraCliArguments",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return AddOrganizationTransformationBlockRequest.attributeTypeMap;
    }
}


export type AddOrganizationTransformationBlockRequestOperatesOnEnum = 'file' | 'dataitem' | 'standalone';
export const AddOrganizationTransformationBlockRequestOperatesOnEnumValues: string[] = ['file', 'dataitem', 'standalone'];