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

import { ObjectDetectionAutoLabelResponseAllOfResults } from './objectDetectionAutoLabelResponseAllOfResults';

export class ObjectDetectionAutoLabelResponseAllOf {
    'results': Array<ObjectDetectionAutoLabelResponseAllOfResults>;
    'allLabels': Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "results",
            "baseName": "results",
            "type": "Array<ObjectDetectionAutoLabelResponseAllOfResults>"
        },
        {
            "name": "allLabels",
            "baseName": "allLabels",
            "type": "Array<string>"
        }    ];

    static getAttributeTypeMap() {
        return ObjectDetectionAutoLabelResponseAllOf.attributeTypeMap;
    }
}
