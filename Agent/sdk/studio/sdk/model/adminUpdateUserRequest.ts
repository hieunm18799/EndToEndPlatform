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


/**
* Only fields set in this object will be updated.
*/
export class AdminUpdateUserRequest {
    /**
    * New email. This will also update the forum\'s email address but the user may need to logout/login back
    */
    'email'?: string;
    /**
    * New user full name
    */
    'name'?: string;
    /**
    * Whether the user is active or not. Can only go from inactive to active.
    */
    'activated'?: boolean;
    /**
    * Whether the user is suspended or not.
    */
    'suspended'?: boolean;
    /**
    * New user job title
    */
    'jobTitle'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "activated",
            "baseName": "activated",
            "type": "boolean"
        },
        {
            "name": "suspended",
            "baseName": "suspended",
            "type": "boolean"
        },
        {
            "name": "jobTitle",
            "baseName": "jobTitle",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return AdminUpdateUserRequest.attributeTypeMap;
    }
}
