// TODO: Resolve any
export interface Tweet {
    id: string;
    text: string;
    attachments?: any;
    author_id?: string;
    context_annotations?: any[];
    conversation_id?: string;
    created_at?: string; // Might me date
    entities?: any;
    geo?: any;
    in_reply_to_user_id?: string;
    lang?: string;
    non_public_metrics?: any;
    organic_metrics?: any;
    possibly_sensitive?: boolean;
    promoted_metrics?: any;
    public_metrics?: any;
    referenced_tweets?: any[];
    reply_settings?: string;
    source?: string;
    withheld?: any;
}

export type Tweets = Tweet[];

export interface User {
    id: string;
    name: string;
    username: string;
    created_at?: string;
    description?: string;
    entities?: any;
    location?: string;
    pinned_tweet_id?: string;
    profile_image_url?: string;
    protected?: boolean;
    public_metrics?: any;
    url?: any;
    verified?: boolean;
    withheld?: any;
}

export type Users = User[];
