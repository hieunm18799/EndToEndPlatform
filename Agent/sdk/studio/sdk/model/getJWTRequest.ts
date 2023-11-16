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


export class GetJWTRequest {
    /**
    * Username or e-mail address
    */
    'email': string;
    /**
    * Password
    */
    'password': string;
    /**
    * Evaluation user UUID
    */
    'uuid'?: string;
    'ssoType'?: GetJWTRequestSsoTypeEnum;
    /**
    * Session ID
    */
    'sessionId'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "password",
            "baseName": "password",
            "type": "string"
        },
        {
            "name": "uuid",
            "baseName": "uuid",
            "type": "string"
        },
        {
            "name": "ssoType",
            "baseName": "ssoType",
            "type": "GetJWTRequestSsoTypeEnum"
        },
        {
            "name": "sessionId",
            "baseName": "sessionId",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return GetJWTRequest.attributeTypeMap;
    }
}


export type GetJWTRequestSsoTypeEnum = 'browser' | 'cli';
export const GetJWTRequestSsoTypeEnumValues: string[] = ['browser', 'cli'];
