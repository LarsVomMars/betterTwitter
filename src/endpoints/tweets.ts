import type { API } from "../api";
import type { Tweets } from "../models";

export default class TweetsAPI {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }

    public getTweetsById(ids: string | string[]): AsyncGenerator<Tweets> {
        let url = "tweets";
        // TODO: "Paginate" if more then 100 ids are given
        if (Array.isArray(ids)) {
            url += `?ids=${ids.join()}`;
        } else {
            // Don't use /:id due to generic response
            url += `?ids=${ids}`;
        }
        return this.api.request(url, "GET", undefined, false);
    }
}
