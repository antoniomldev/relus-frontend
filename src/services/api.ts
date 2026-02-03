import type { AxiosRequestConfig } from "axios";
import { httpClient } from "./http";

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        httpClient.get<T>(url, config).then(res => res.data),

    post: <T, B = unknown>(
        url: string,
        body?: B,
        config?: AxiosRequestConfig
    ) =>
        httpClient.post<T>(url, body, config).then(res => res.data),
}