import type { API } from "../api";
import type { Tweets, Users } from "../models";

export default class UsersAPI {
    private readonly api: API;

    constructor(api: API) {
        this.api = api;
    }

    // TODO: Consider moving to TweetsAPI (listed under tweets in Twitter Doc)
    public getUserTweets(userID: string): AsyncGenerator<Tweets> {
        const path = `users/${userID}/tweets`;
        return this.api.request(path, "GET");
    }

    public getUserMentions(userID: string): AsyncGenerator<Tweets> {
        const path = `users/${userID}/mentions`;
        return this.api.request(path, "GET");
    }

    public getUsersById(ids: string | string[]): AsyncGenerator<Users> {
        let path = `users`;
        // TODO: "Paginate" if more then 100 ids are given
        if (Array.isArray(ids)) {
            path += `?ids=${ids.join()}`;
        } else {
            // Don't use /:id due to generic response
            path += `?ids=${ids}`;
        }
        return this.api.request(path, "GET", undefined, false);
    }

    public getUsersByName(usernames: string | string[]): AsyncGenerator<Users> {
        let path = `users/by`;
        // TODO: "Paginate" if more then 100 ids are given
        if (Array.isArray(usernames)) {
            path += `?usernames=${usernames.join()}`;
        } else {
            // Don't use /:id due to generic response
            path += `?usernames=${usernames}`;
        }
        return this.api.request(path, "GET", undefined, false);
    }

    public getUserFollowers(id: string): AsyncGenerator<Users> {
        const path = `users/${id}/followers`;
        return this.api.request(path, "GET", undefined, false);
    }

    public getUserFollowing(id: string): AsyncGenerator<Users> {
        const path = `users/${id}/following`;
        return this.api.request(path, "GET", undefined, false);
    }
}
