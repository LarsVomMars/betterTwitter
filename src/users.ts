import type { API } from "./api";
import type { Tweets } from "./models";

export default class Users {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }

    public getUserTweets(userID: string): AsyncGenerator<Tweets> {
        const path = `users/${userID}/tweets`;
        return this.api.request(path, "GET");
    }

    public getUserMentions(userID: string): AsyncGenerator<Tweets> {
        const path = `users/${userID}/mentions`;
        return this.api.request(path, "GET");
    }
}
