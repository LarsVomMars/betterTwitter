import { createHmac } from "crypto";
import { OutgoingHttpHeaders } from "http";
import {
    encodeData,
    sortObject,
    getTimestamp,
    buildParameterString,
    buildDataString,
    base64,
    createNonce,
} from "./helper";
import type { KeyValuePair } from "./helper";
import { makeRequest } from "./request";
import type { GenericResponse, RequestMethods } from "./request";

export class OAuthHandler {
    private readonly handler: OAuth1 | OAuth2;

    constructor(oauth: OAuthData) {
        if ("token" in oauth) {
            this.handler = new OAuth1(oauth);
        } else {
            this.handler = new OAuth2(oauth);
        }
    }

    public request(url: string, method: RequestMethods, data?: any, pag = true): AsyncGenerator<any> {
        return this.handler.request(url, method, data, pag);
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

    public async *request(url: string, method: RequestMethods, data?: any, pag = true): AsyncGenerator<any> {
        const encodedData = buildDataString(data);
        const headers: OutgoingHttpHeaders = { "Content-Length": Buffer.byteLength(encodedData) };
        // TODO: Don't paginate everything
        if (pag) {
            const resurl = `${url}${url.includes("?") ? "&" : "?"}max_results=100`;
            headers.Authorization = this.getHeader(method, resurl, data);
            let resp = (await makeRequest(resurl, method, headers, encodedData)) as GenericResponse;
            while (resp.meta.next_token) {
                for (const element of resp.data) {
                    yield element;
                }
                const pgurl = `${resurl}&pagination_token=${resp.meta.next_token}`;
                headers.Authorization = this.getHeader(method, pgurl, data);
                resp = (await makeRequest(pgurl, method, headers, encodedData)) as GenericResponse;
            }
            for (const element of resp.data) {
                yield element;
            }
        } else {
            headers.Authorization = this.getHeader(method, url, data);
            const resp = (await makeRequest(url, method, headers, encodedData)) as GenericResponse;
            for (const element of resp.data) {
                yield element;
            }
        }
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
            oauth_nonce: createNonce(),
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

    public async *request(url: string, method: RequestMethods, data?: any, pag = true): AsyncGenerator<any> {
        if (!this.bearerToken) this.bearerToken = await this.refreshToken(); // Will request twice if called directly after init

        const encodedData = buildDataString(data);
        const Authorization = `Bearer ${this.bearerToken}`;

        const headers: OutgoingHttpHeaders = {
            "Content-Length": Buffer.byteLength(encodedData),
            Authorization,
        };

        if (pag) {
            const resurl = `${url}${url.includes("?") ? "&" : "?"}max_results=100`;
            let resp = (await makeRequest(resurl, method, headers, encodedData)) as GenericResponse;
            while (resp.meta.next_token) {
                for (const element of resp.data) {
                    yield element;
                }
                const pgurl = `${resurl}&pagination_token=${resp.meta.next_token}`;
                resp = (await makeRequest(pgurl, method, headers, encodedData)) as GenericResponse;
            }
            for (const element of resp.data) {
                yield element;
            }
        } else {
            const resp = (await makeRequest(url, method, headers, encodedData)) as GenericResponse;
            for (const element of resp.data) {
                yield element;
            }
        }
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
