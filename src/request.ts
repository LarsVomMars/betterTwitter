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

// export async function* paginationRequest(
//     url: string,
//     method: RequestMethods,
//     headers: OutgoingHttpHeaders,
//     dataStr?: string,
// ): AsyncGenerator<Promise<any>> {
//     const resurl = `${url}${url.includes("?") ? "&" : "?"}max_results=100`
//     let resp = (await makeRequest(resurl, method, headers, dataStr)) as GenericResponse;
//     while (resp.meta.next_token) {
//         yield resp.data;
//         const pgurl = `${resurl}&pagination_token=${resp.meta.next_token}`;
//         resp = (await makeRequest(pgurl, method, headers, dataStr)) as GenericResponse;
//     }
//     return resp.data;
// }

export async function paginationRequest(
    url: string,
    method: RequestMethods,
    headers: OutgoingHttpHeaders,
    dataStr?: string,
    ctr = 10,
): Promise<any> {
    const result = [];
    const resurl = `${url}${url.includes("?") ? "&" : "?"}max_results=100`;
    let resp = (await makeRequest(resurl, method, headers, dataStr)) as GenericResponse;
    result.push(resp.data);
    while (resp.meta.next_token && ctr !== 0) {
        const pgurl = `${resurl}&pagination_token=${resp.meta.next_token}`;
        resp = (await makeRequest(pgurl, method, headers, dataStr)) as GenericResponse;
        result.push(resp.data);
        ctr--;
    }
    return result;
}

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
