import { createHmac } from "crypto";
import { OutgoingHttpHeaders } from "http";
import {
    encodeData,
    sortObject,
    getTimestamp,
    buildParameterString,
    buildDataString,
    base64,
    KeyValuePair,
} from "./helper";
import { makeRequest, RequestMethods } from "./request";

export class OAuthHandler {
    private readonly handler: OAuth1 | OAuth2;

    constructor(oauth: OAuthData) {
        if ("token" in oauth) {
            this.handler = new OAuth1(oauth);
        } else {
            this.handler = new OAuth2(oauth);
        }
    }

    public async request(url: string, method: RequestMethods, data?: any): Promise<any> {
        return this.handler.request(url, method, data);
    }
}

export class OAuth1 {
    private readonly auth: OAuth1Data;
    private readonly nonceSize: number;
    private readonly oauthSeparator: string;
    private readonly oauthVersion: string;
    private readonly oauthSignatureMethod: string;

    constructor(auth: OAuth1Data) {
        this.auth = auth;
        this.nonceSize = 32;
        this.oauthVersion = "1.0";
        this.oauthSignatureMethod = "HMAC-SHA1";
        this.oauthSeparator = ",";
    }

    public async request(url: string, method: RequestMethods, data?: any): Promise<any> {
        const encodedData = buildDataString(data);

        const headers: OutgoingHttpHeaders = {
            "Content-Length": Buffer.byteLength(encodedData),
            Authorization: this.getHeader(method, url, data),
        };

        return await makeRequest(url, method, headers, encodedData);
    }

    private getHeader(method: RequestMethods, url: string, data?: any): string {
        const oauth = this.authorize(method, url, data);
        const sortedOauth = sortObject(oauth);
        let oauthHeader = "OAuth ";
        for (const param of sortedOauth) {
            if (param.name.startsWith("oauth_")) {
                oauthHeader += `${encodeData(param.name)}="${encodeData(param.value)}"${this.oauthSeparator}`;
            }
        }
        return oauthHeader.substring(0, oauthHeader.length - this.oauthSeparator.length);
    }

    private authorize(method: RequestMethods, url: string, data?: any): KeyValuePair {
        const oauthParameters: KeyValuePair = {
            oauth_consumer_key: this.auth.consumerKey,
            oauth_nonce: this.createNonce(),
            oauth_signature_method: this.oauthSignatureMethod,
            oauth_timestamp: getTimestamp(),
            oauth_version: this.oauthVersion,
            oauth_token: this.auth.token,
        };
        oauthParameters.oauth_signature = this.getSignature(method, url, oauthParameters, data);
        return oauthParameters;
    }

    private getSignature(method: RequestMethods, url: string, oauth: KeyValuePair, data?: any): string {
        const base = `${method}&${encodeData(url.split("?")[0])}&${encodeData(buildParameterString(url, oauth, data))}`;
        const key = `${encodeData(this.auth.consumerSecret)}&${encodeData(this.auth.tokenSecret)}`;
        return createHmac("sha1", key).update(base).digest("base64");
    }

    private createNonce(): string {
        const nonceChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let nonce = "";
        for (let i = 0; i < this.nonceSize; i++) {
            const randNum = Math.floor(Math.random() * nonceChars.length);
            nonce += nonceChars[randNum];
        }
        return nonce;
    }
}

export class OAuth2 {
    private readonly auth: OAuth2Data;
    private bearerToken?: string;

    constructor(auth: OAuth2Data) {
        this.auth = auth;
        this.refreshToken().then((token) => (this.bearerToken = token));
    }

    public async refreshToken(): Promise<string> {
        const url = "https://api.twitter.com/oauth2/token";
        const method: RequestMethods = "POST";
        const data = "grant_type=client_credentials";
        const credentials = `${encodeData(this.auth.consumerKey)}:${encodeData(this.auth.consumerSecret)}`;
        const Authorization = `Basic ${base64(credentials)}`;
        const headers = { "Content-Length": 29, Authorization };
        const token = await makeRequest(url, method, headers, data);
        return token.access_token;
    }

    public async request(url: string, method: RequestMethods, data?: any): Promise<any> {
        if (!this.bearerToken) this.bearerToken = await this.refreshToken(); // Will request twice if called directly after init

        const encodedData = buildDataString(data);
        const Authorization = `Bearer ${this.bearerToken}`;

        const headers: OutgoingHttpHeaders = {
            "Content-Length": Buffer.byteLength(encodedData),
            Authorization,
        };

        return await makeRequest(url, method, headers, encodedData);
    }
}

export interface OAuth1Data {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
}

export interface OAuth2Data {
    consumerKey: string;
    consumerSecret: string;
}

export type OAuthData = OAuth1Data | OAuth2Data;
