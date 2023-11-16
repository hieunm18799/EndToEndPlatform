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

import { DspRunGraph } from './dspRunGraph';
import { DspRunResponseAllOfPerformance } from './dspRunResponseAllOfPerformance';
import { DspRunResponseWithSampleAllOf } from './dspRunResponseWithSampleAllOf';
import { GenericApiResponse } from './genericApiResponse';
import { RawSampleData } from './rawSampleData';

export class DspRunResponseWithSample {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    /**
    * Array of processed features. Laid out according to the names in \'labels\'
    */
    'features': Array<number>;
    /**
    * Graphs to plot to give an insight in how the DSP process ran
    */
    'graphs': Array<DspRunGraph>;
    /**
    * Labels of the feature axes
    */
    'labels'?: Array<string>;
    'sample': RawSampleData;
    'performance'?: DspRunResponseAllOfPerformance;
    'canProfilePerformance': boolean;

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
            "name": "features",
            "baseName": "features",
            "type": "Array<number>"
        },
        {
            "name": "graphs",
            "baseName": "graphs",
            "type": "Array<DspRunGraph>"
        },
        {
            "name": "labels",
            "baseName": "labels",
            "type": "Array<string>"
        },
        {
            "name": "sample",
            "baseName": "sample",
            "type": "RawSampleData"
        },
        {
            "name": "performance",
            "baseName": "performance",
            "type": "DspRunResponseAllOfPerformance"
        },
        {
            "name": "canProfilePerformance",
            "baseName": "canProfilePerformance",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return DspRunResponseWithSample.attributeTypeMap;
    }
}

