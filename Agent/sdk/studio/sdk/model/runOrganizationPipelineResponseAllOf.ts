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

import { OrganizationPipelineRun } from './organizationPipelineRun';

export class RunOrganizationPipelineResponseAllOf {
    'pipelineRun': OrganizationPipelineRun;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "pipelineRun",
            "baseName": "pipelineRun",
            "type": "OrganizationPipelineRun"
        }    ];

    static getAttributeTypeMap() {
        return RunOrganizationPipelineResponseAllOf.attributeTypeMap;
    }
}

