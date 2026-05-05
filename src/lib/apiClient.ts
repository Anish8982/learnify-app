import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://api.freeapi.app/api/v1';
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isRetryable(error: AxiosError): boolean {
    if (!error.response) return true; // network error
    return [408, 429, 500, 502, 503, 504].includes(error.response.status);
}

function createApiClient(): AxiosInstance {
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor — attach token if present
    client.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            try {
                const token = await AsyncStorage.getItem('auth_token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // Non-blocking — proceed without token
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    // Response interceptor — retry on transient failures
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

            if (!config || !isRetryable(error)) {
                return Promise.reject(error);
            }

            config._retryCount = (config._retryCount ?? 0) + 1;

            if (config._retryCount > MAX_RETRIES) {
                return Promise.reject(error);
            }

            await sleep(RETRY_DELAY_MS * config._retryCount);
            return client(config);
        },
    );

    return client;
}

export const apiClient = createApiClient();
