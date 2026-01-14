import pkg from '../../package.json';
import {
  APIError,
  AuthenticationError,
  BloqueError,
  RateLimitError,
} from '../errors/bloque-error';

const SDK_NAME = pkg.name;
const SDK_VERSION = pkg.version;

export interface HttpClientConfig {
  baseURL: string;
  accessToken: string;
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

export class HttpClient {
  private readonly baseURL: string;
  private readonly accessToken: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly userAgent: string;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.accessToken = config.accessToken;
    this.timeout = config.timeout ?? 10_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.userAgent = `${SDK_NAME}/${SDK_VERSION}`;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildURL(options.path, options.params);
    const headers = this.buildHeaders(options.headers, options.idempotencyKey);

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
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
    const url = new URL(path, this.baseURL);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(
    customHeaders?: Record<string, string>,
    idempotencyKey?: string,
  ): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
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
