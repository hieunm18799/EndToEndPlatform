import crypto from 'crypto';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { EdgeImpulseConfig } from './config';
import http from 'http';
import https from 'https';
import encodeLabel from '../shared/encoding';
import Path from 'path';
import { ExportInputBoundingBox, ExportUploaderInfoFileCategory } from '../shared/bounding-box-file-types';

const keepAliveAgentHttp = new http.Agent({ keepAlive: true });
const keepAliveAgentHttps = new https.Agent({ keepAlive: true });

export const EXTENSION_MAPPING: { [k: string]: string } = {
    '.wav': 'audio/wav',
    '.cbor': 'application/cbor',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.avi': 'video/avi',
};

export const VALID_EXTENSIONS = Object.keys(EXTENSION_MAPPING);

export async function upload(opts: {
    name: string,
    buffer: Buffer,
    label: string,
    devKey: string,
    type: 'test' | 'validate' | 'training',
}) {
    if (opts.buffer.length > 100 * 1024 * 1024) {
        throw new Error('File too large, max. size is 100MB');
    }
    console.log(opts.buffer.length);

    let ext = Path.extname(opts.name).toLowerCase();

    let headers: { [k: string]: string} = {
        'x-jwt-project': opts.devKey,
        'x-upload-source': 'AGENT_CLI_UPLOADER',
        'Connection': 'keep-alive',
    };

    // if (opts.label === 'label') {
    headers['x-label'] = opts.label;
    headers['x-type'] = opts.type;
    // }
    // else if (opts.label.type === 'unlabeled') {
    //     headers['x-label'] = encodeLabel('');
    //     headers['x-no-label'] = '1';
    // }

    // if (!opts.allowDuplicates) {
    //     headers['x-disallow-duplicates'] = '1';
    // }
    // if (opts.boundingBoxes) {
    //     headers['x-bounding-boxes'] = JSON.stringify(opts.boundingBoxes);
    // }
    // if (opts.metadata) {
    //     headers['x-metadata'] = JSON.stringify(opts.metadata);
    // }
    // if (opts.addDateId) {
    //     headers['x-add-date-id'] = '1';
    // }

    headers['x-device-type'] = 'AGENT_CLI';

    let agent = 'http://localhost:4800'.indexOf('https:') === 0 ? keepAliveAgentHttps : keepAliveAgentHttp;

    const form = new FormData();
    form.append('data', opts.buffer, {
        filename: opts.name,
        contentType: EXTENSION_MAPPING[ext] || 'application/octet-stream',
    });

    let res = await fetch('http://localhost:4800' + '/api/data', {
        method: 'POST',
        headers: headers,
        body: form,
        agent: agent,
        compress: true,
    });

    if (res.status < 200 || res.status > 299) throw new Error( await res.text());

    return JSON.parse(await res.text()).dataId;
}
