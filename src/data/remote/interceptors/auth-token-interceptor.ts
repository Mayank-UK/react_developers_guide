import type { AxiosInstance } from 'axios';

/**
 * AuthTokenInterceptor — attaches an auth token to every outgoing request.
 * Mirrors the Flutter guide's `AuthTokenInterceptor`. Here it reads from a
 * pluggable token provider so it stays decoupled from any specific auth store
 * (a real app would back it with Firebase Auth / cookie / etc.).
 */
export class AuthTokenInterceptor {
  private readonly getToken: () => string | null;

  constructor(getToken: () => string | null) {
    this.getToken = getToken;
  }

  attach(instance: AxiosInstance): void {
    instance.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
}
