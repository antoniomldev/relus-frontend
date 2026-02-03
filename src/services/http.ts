import axios, { type AxiosInstance } from 'axios';

const API_URL = "" //importar API Do ENV 

export const httpClient: AxiosInstance = axios.create({
    baseURL: API_URL,
})

