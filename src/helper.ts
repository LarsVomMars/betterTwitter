export function buildParameterString(url: string, oauth: KeyValuePair, data?: any): string {
    const base = encodeObject(mergeObjects(oauth, data, querystringToObject(url.split("?")[1])));
    return buildDataString(base);
}

export function sortObject(data?: any): ParameterPair[] {
    data = data || {};
    const res: ParameterPair[] = [];
    const keys = Object.keys(data);
    keys.sort();
    for (const key of keys) {
        res.push({ name: key, value: data[key] });
    }
    return res;
}

export function mergeObjects(obj1: any, ...objs: any[]): any {
    for (const obj of objs) {
        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
            obj1[key] = obj[key]; // Overwrites obj1 value if key is the same
        }
    }
    return obj1;
}

export function querystringToObject(qs: string): KeyValuePair {
    const urlsp = new URLSearchParams(qs);
    const data: KeyValuePair = {};
    for (const [key, value] of urlsp) {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]] as string[];
            }
            (data[key] as string[]).push(decodeURIComponent(value));
        } else {
            data[key] = decodeURIComponent(value);
        }
    }
    return data;
}

export function getTimestamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}

export function encodeData(data: string): string {
    return encodeURIComponent(data)
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");
}

export function encodeObject(data: any): any {
    const res: KeyValuePair = {};
    for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        let value = data[key];
        if (Array.isArray(value)) {
            value = value.map(encodeData);
        } else {
            value = encodeData(value);
        }
        res[encodeData(key)] = value;
    }
    return res;
}

export function buildDataString(data: any): string {
    let encodedData = "";
    for (const { name, value } of sortObject(data)) {
        if (Array.isArray(value)) {
            value.sort();
            let str = "";
            for (const item of value) {
                str += `${name}=${item}&`;
            }
            encodedData += str.slice(0, -1);
        } else {
            encodedData += `${name}=${value}&`;
        }
    }
    return encodedData.slice(0, -1);
}

export function createNonce(nonceSize = 32): string {
    const nonceChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let nonce = "";
    for (let i = 0; i < nonceSize; i++) {
        const randNum = Math.floor(Math.random() * nonceChars.length);
        nonce += nonceChars[randNum];
    }
    return nonce;
}

export function base64(str: string): string {
    return Buffer.from(str, "utf8").toString("base64");
}

export function getVariableName(variable: any): string {
    return Object.keys({ variable })[0];
}

export interface ParameterPair {
    name: string;
    value: string;
}

export interface KeyValuePair {
    [key: string]: string | number | string[] | number[];
}
