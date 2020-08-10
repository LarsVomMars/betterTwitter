import type { API } from "./api";

export class Lists {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }
}
