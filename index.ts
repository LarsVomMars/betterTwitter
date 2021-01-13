import { API } from "./src/api";
import type { OAuthData } from "./src/OAuthHandler";
import Users from "./src/endpoints/users";
import Tweets from "./src/endpoints/tweets";

export default class Twitter {
    public readonly users: Users;
    public readonly tweets: Tweets;

    constructor(auth: OAuthData) {
        const api = new API(auth);
        this.tweets = new Tweets(api);
        this.users = new Users(api);
    }
}
