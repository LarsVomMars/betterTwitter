import { API } from "./api";

export default class Tweets {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }
}
