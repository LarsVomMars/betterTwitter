import type { API } from "./api";

export class Account {
    private api: API;

    constructor(api: API) {
        this.api = api;
    }

    public async verifyCredentials() {
        return await this.api.request("https://api.twitter.com/1.1/account/verify_credentials.json", "GET");
    }

}
