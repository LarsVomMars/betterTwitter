import { API, Resource$OAuth } from "./api";
import { Lists } from "./lists";
import { Statuses } from "./statuses";
import { Account} from "./account";

export default class Twitter {
    public readonly lists: Lists;
    public readonly statuses: Statuses;
    public readonly account: Account;

    constructor(auth: Resource$OAuth) {
        const api = new API(auth);
        this.lists = new Lists(api);
        this.statuses = new Statuses(api);
        this.account = new Account(api);
    }
}
