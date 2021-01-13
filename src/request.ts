import { request, RequestOptions } from "https";
import { OutgoingHttpHeaders } from "http";
import { mergeObjects } from "./helper";

export type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";

export const DefaultHeaders: OutgoingHttpHeaders = {
    "User-Agent": "NodeJS Twitter-Client",
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    Accept: "*/*",
    Connection: "close",
};

export function makeRequest(
    url: string,
    method: RequestMethods,
    headers: OutgoingHttpHeaders,
    data?: string,
): Promise<any> {
    return new Promise((resolve, reject) => {
        const options: RequestOptions = {
            method,
            headers: mergeObjects(DefaultHeaders, headers),
        };
        const req = request(url, options, (res) => {
            res.setEncoding("utf8");
            let resData = "";
            res.on("data", (chunk) => (resData += chunk));
            res.on("end", () => {
                try {
                    const jsonData = JSON.parse(resData);
                    if (res.statusCode !== 200) reject(jsonData);
                    // TODO: Error handling and types
                    else if (Object.keys(resData).includes("errors")) reject(jsonData);
                    else resolve(jsonData);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on("error", reject);
        if (data) req.write(data);
        req.end();
    });
}

export interface GenericResponse {
    data: any; // TODO: Consider response data
    meta: ResponseMetaData;
}

export interface ResponseMetaData {
    oldest_id: string;
    newest_id: string;
    result_count: number;
    next_token?: string; // Not present on last "page"
    previous_token?: string; // Not present on first "page"
}
