import { OAuth, OAuth2 } from "oauth";
import axios from "axios";

export class API {
    private readonly baseUrl: string = "https://api.twitter.com/";
    private readonly apiVersion: string = "1.1";
    private readonly oauth?: OAuth;
    private readonly oauth2?: OAuth2;
    private readonly tokens?: Resource$OAuth$Tokens;
    private token?: string;

    constructor(auth: Resource$OAuth) {
        if ("tokenSecret" in auth) {
            this.oauth = new OAuth(
                "https://api.twitter.com/oauth/request_token",
                "https://api.twitter.com/oauth/access_token",
                auth.consumerKey,
                auth.consumerSecret,
                '1.0A',
                null,
                'HMAC-SHA1',
            );
            this.tokens = { token: auth.token, tokenSecret: auth.tokenSecret }
        } else {
            this.oauth2 = new OAuth2(
                auth.consumerKey,
                auth.consumerSecret,
                'https://api.twitter.com/',
                undefined,
                'oauth2/token',
                undefined
            );

        }
    }

    public request(path: string, method: Resource$Request$Method, data?: any): Promise<any> {  // TODO: Resolve any type
        const url = this.genUrl(path);
        return new Promise(async (resolve, reject) => {
            if (!this.oauth) {
                if (!this.token) {
                    try {
                        this.token = await this.generateBearerToken();
                    } catch (e) {
                        return reject(e);
                    }
                }
                return axios.request({ url, method, data, headers: { Authorization: `Bearer ${this.token}` } })
                    .then(resolve)
                    .catch(err => reject(err.toJSON()))
            }

            if (method === "GET") {
                const getUrl = API.genGetUrl(url, data);
                this.oauth.get(
                    getUrl, this.tokens!.token, this.tokens!.tokenSecret,
                    (err, result) => {
                        if (err) return reject(err);
                        if (result instanceof Buffer) return resolve(result.toJSON());
                        return resolve(JSON.parse(result!));
                    },
                )
            } else {
                this.oauth.post(
                    url, this.tokens!.token, this.tokens!.tokenSecret, data, "application/json",
                    (err, result) => {
                        if (err) return reject(err);
                        if (result instanceof Buffer) return resolve(result.toJSON());
                        return resolve(JSON.parse(result!));
                    }
                )
            }
        });
    }

    private generateBearerToken(): Promise<any> {  // TODO: Resolve any type
        return new Promise((resolve, reject) => {
            if (!this.oauth2) return reject(new Error("Oauth2 not loaded!"));
            this.oauth2.getOAuthAccessToken(
                "",
                { grant_type: "client_credentials" },
                (e, access_token, refresh_token, result) => {
                    if (e) return reject(e);
                    return resolve(access_token);
                }
            )
        })
    }

    private genUrl(extension: string): string {
        return `${this.baseUrl}${this.apiVersion}/${extension}.json`;
    }

    private static genGetUrl(url: string, data?: any): string {
        if (!data) return url;
        let gp = "";
        for (const did in data) gp += `${gp.length > 0 ? '&' : '?'}${did}=${data[did]}`;
        return url + gp;
    }
}

export interface Resource$OAuth1a {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
}

export interface Resource$OAuth$Tokens {
    token: string;
    tokenSecret: string;
}

export interface Resource$OAuth2 {
    consumerKey: string;
    consumerSecret: string;
}

export type Resource$OAuth = Resource$OAuth1a | Resource$OAuth2;
export type Resource$Request$Method = "GET" | "POST";
