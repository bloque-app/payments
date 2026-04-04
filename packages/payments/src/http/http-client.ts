import pkg from '../../package.json';
import {
  APIError,
  AuthenticationError,
  BloqueError,
  KeyRevokedError,
  RateLimitError,
} from '../errors/bloque-error';

const SDK_NAME = pkg.name;
const SDK_VERSION = pkg.version;

const JWT_REFRESH_BUFFER_MS = 60_000; // refresh 1 min before expiry

export interface HttpClientConfig {
  baseURL: string;
  exchangeBaseURL?: string;
  accessToken?: string;
  secretKey?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  idempotencyKey?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly exchangeBaseURL: string;
  private readonly secretKey?: string;
  private readonly staticAccessToken?: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly userAgent: string;

  private cachedToken: CachedToken | null = null;
  private exchangePromise: Promise<CachedToken> | null = null;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.exchangeBaseURL = config.exchangeBaseURL ?? config.baseURL;
    this.secretKey = config.secretKey;
    this.staticAccessToken = config.accessToken;
    this.timeout = config.timeout ?? 10_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.userAgent = `${SDK_NAME}/${SDK_VERSION}`;
  }

  private async getAccessToken(): Promise<string> {
    if (this.staticAccessToken) {
      return this.staticAccessToken;
    }

    if (!this.secretKey) {
      throw new AuthenticationError('No secretKey or accessToken configured');
    }

    if (
      this.cachedToken &&
      Date.now() < this.cachedToken.expiresAt - JWT_REFRESH_BUFFER_MS
    ) {
      return this.cachedToken.accessToken;
    }

    if (!this.exchangePromise) {
      this.exchangePromise = this.exchangeKey().finally(() => {
        this.exchangePromise = null;
      });
    }

    const token = await this.exchangePromise;
    this.cachedToken = token;
    return token.accessToken;
  }

  private async exchangeKey(): Promise<CachedToken> {
    const url = `${this.exchangeBaseURL}/api-keys/exchange`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
        },
        body: JSON.stringify({ key: this.secretKey }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const code = (payload as any).code;
        const message = (payload as any).message || 'Exchange failed';

        if (
          response.status === 401 &&
          (code === 'E_KEY_REVOKED' || code === 'E_INVALID_KEY')
        ) {
          const keyId = this.secretKey
            ? this.secretKey.slice(0, 20)
            : undefined;
          throw new KeyRevokedError(message, keyId);
        }

        throw new AuthenticationError(message, code);
      }

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
      };

      return {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (
        error instanceof KeyRevokedError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      throw new BloqueError(
        `Key exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildURL(options.path, options.params);
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const token = await this.getAccessToken();
        const headers = this.buildHeaders(
          token,
          options.headers,
          options.idempotencyKey,
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await this.parseError(response);

          if (response.status === 401 && this.secretKey && attempt === 0) {
            this.cachedToken = null;
            continue;
          }

          if (!this.isRetryableHttpStatus(response.status)) {
            throw error;
          }

          throw error;
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error;

        if (!this.isRetryableError(error)) {
          throw error;
        }

        if (attempt === this.maxRetries) {
          break;
        }

        await this.sleep(this.backoff(attempt));
      }
    }

    throw lastError ?? new BloqueError('Request failed after retries');
  }

  private buildURL(path: string, params?: Record<string, unknown>): string {
    const url = `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
    const urlObj = new URL(url);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      }
    }

    return urlObj.toString();
  }

  private buildHeaders(
    accessToken: string,
    customHeaders?: Record<string, string>,
    idempotencyKey?: string,
  ): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': this.userAgent,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...customHeaders,
    };
  }

  private async parseError(response: Response): Promise<Error> {
    let payload: any;

    try {
      payload = await response.json();
    } catch {
      payload = { message: response.statusText };
    }

    const message = payload.message || 'Request failed';
    const code = payload.code;

    switch (response.status) {
      case 401:
        if (code === 'E_KEY_REVOKED') {
          return new KeyRevokedError(message, payload.key_id);
        }
        return new AuthenticationError(message, code);
      case 429:
        return new RateLimitError(message, code);
      case 400:
      case 404:
      case 409:
      case 422:
        return new APIError(message, response.status, code);
      default:
        return new APIError(message, response.status, code);
    }
  }

  private isRetryableHttpStatus(status: number): boolean {
    return status >= 500 || status === 429;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof KeyRevokedError) {
      return false;
    }

    if (
      error instanceof AuthenticationError ||
      error instanceof APIError ||
      error instanceof BloqueError
    ) {
      return false;
    }

    if (error instanceof RateLimitError) {
      return true;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    return true;
  }

  private backoff(attempt: number): number {
    const base = 300;
    const max = 5_000;
    return Math.min(base * 2 ** attempt, max);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get<T>(path: string, params?: Record<string, unknown>) {
    return this.request<T>({ method: 'GET', path, params });
  }

  post<T>(path: string, body?: unknown, options?: Partial<RequestOptions>) {
    return this.request<T>({
      method: 'POST',
      path,
      body,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  delete<T>(path: string) {
    return this.request<T>({ method: 'DELETE', path });
  }
}
