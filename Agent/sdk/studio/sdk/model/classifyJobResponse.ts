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

import { ClassifyJobResponseAllOf } from './classifyJobResponseAllOf';
import { ClassifyJobResponseAllOfAccuracy } from './classifyJobResponseAllOfAccuracy';
import { GenericApiResponse } from './genericApiResponse';
import { ModelPrediction } from './modelPrediction';
import { ModelResult } from './modelResult';

export class ClassifyJobResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    'result': Array<ModelResult>;
    'predictions': Array<ModelPrediction>;
    'accuracy': ClassifyJobResponseAllOfAccuracy;

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
            "name": "result",
            "baseName": "result",
            "type": "Array<ModelResult>"
        },
        {
            "name": "predictions",
            "baseName": "predictions",
            "type": "Array<ModelPrediction>"
        },
        {
            "name": "accuracy",
            "baseName": "accuracy",
            "type": "ClassifyJobResponseAllOfAccuracy"
        }    ];

    static getAttributeTypeMap() {
        return ClassifyJobResponse.attributeTypeMap;
    }
}

