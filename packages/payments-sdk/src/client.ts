import { HttpClient } from './http/http-client';
import { CheckoutResource } from './resources/checkout';
import { PaymentResource } from './resources/payment';
import { WebhookResource } from './resources/webhook';

export type BloqueConfig = {
  mode: 'sandbox' | 'production';
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
  webhookSecret?: string;
};

export class Bloque {
  #httpClient: HttpClient;
  #config: BloqueConfig;

  public checkout!: CheckoutResource;
  public payments!: PaymentResource;
  public webhooks!: WebhookResource;

  constructor(config: BloqueConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.#config = config;

    this.#httpClient = new HttpClient({
      baseURL:
        this.#config.mode === 'sandbox'
          ? 'https://dev.bloque.app/api/payments'
          : 'https://api.bloque.app/api/payments',
      apiKey: this.#config.apiKey,
      timeout: this.#config.timeout,
      maxRetries: this.#config.maxRetries,
    });

    this.initializeResources();
  }

  private initializeResources(): void {
    this.checkout = new CheckoutResource(this.#httpClient);
    this.payments = new PaymentResource(this.#httpClient);
    this.webhooks = new WebhookResource(this.#config.webhookSecret);
  }
}
