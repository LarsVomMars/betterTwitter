import { API } from "./src/api";
import { OAuthData } from "./src/OAuthHandler";

export default class Twitter {
    constructor(auth: OAuthData) {
        const api = new API(auth);
    }
}
