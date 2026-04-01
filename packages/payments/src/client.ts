import { HttpClient } from './http/http-client';
import { CheckoutResource } from './resources/checkout';
import { PaymentResource } from './resources/payment';
import { WebhookResource } from './resources/webhook';

export type BloqueConfig = {
  mode: 'sandbox' | 'production';
  secretKey: string;
  timeout?: number;
  maxRetries?: number;
  webhookSecret?: string;
};

/** @deprecated Use BloqueConfig with secretKey instead */
export type BloqueConfigLegacy = {
  mode: 'sandbox' | 'production';
  accessToken: string;
  timeout?: number;
  maxRetries?: number;
  webhookSecret?: string;
};

export class Bloque {
  #httpClient: HttpClient;
  #config: BloqueConfig | BloqueConfigLegacy;

  public checkout!: CheckoutResource;
  public payments!: PaymentResource;
  public webhooks!: WebhookResource;

  constructor(config: BloqueConfig | BloqueConfigLegacy) {
    const hasSecretKey = 'secretKey' in config && !!config.secretKey;
    const hasAccessToken = 'accessToken' in config && !!config.accessToken;

    if (!hasSecretKey && !hasAccessToken) {
      throw new Error(
        'Either secretKey (sk_live_... / sk_test_...) or accessToken is required',
      );
    }

    this.#config = config;

    const apiRoot =
      config.mode === 'sandbox'
        ? 'https://dev.bloque.app/api'
        : 'https://api.bloque.app/api';
    const baseURL = `${apiRoot}/payments`;

    if (hasSecretKey) {
      this.#httpClient = new HttpClient({
        baseURL,
        exchangeBaseURL: apiRoot,
        secretKey: (config as BloqueConfig).secretKey,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
      });
    } else {
      this.#httpClient = new HttpClient({
        baseURL,
        accessToken: (config as BloqueConfigLegacy).accessToken,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
      });
    }

    this.initializeResources();
  }

  private initializeResources(): void {
    this.checkout = new CheckoutResource(this.#httpClient);
    this.payments = new PaymentResource(this.#httpClient);
    this.webhooks = new WebhookResource(this.#config.webhookSecret);
  }
}
