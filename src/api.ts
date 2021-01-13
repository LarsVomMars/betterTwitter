import { OAuthHandler } from "./OAuthHandler";
import type { OAuthData } from "./OAuthHandler";
import type { RequestMethods } from "./request";

export class API {
    private readonly baseUrl: string = "https://api.twitter.com";
    private readonly apiVersion: string = "2";
    private readonly handler: OAuthHandler;

    constructor(auth: OAuthData) {
        this.handler = new OAuthHandler(auth);
    }

    public request(path: string, method: RequestMethods, data?: any): AsyncGenerator<any> {
        const url = this.genUrl(path);
        return this.handler.request(url, method, data);
    }

    private genUrl(extension: string): string {
        return `${this.baseUrl}/${this.apiVersion}/${extension}`;
    }
}
