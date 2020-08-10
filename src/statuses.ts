import type { API } from "./api";

export class Statuses {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }

    public async update(status: string) {
        return await this.api.request(
            "https://api.twitter.com/1.1/statuses/update.json", "POST", { status }
        );
    }
}
