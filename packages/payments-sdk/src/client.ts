import { HttpClient } from './http/http-client';
import { CheckoutResource } from './resources/checkout';
import { PaymentResource } from './resources/payment';

export type BloqueConfig = {
  server: 'sandbox' | 'production';
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
};

export class Bloque {
  #httpClient: HttpClient;
  #config: BloqueConfig;

  public checkout!: CheckoutResource;
  public payments!: PaymentResource;

  constructor(config: BloqueConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    this.#config = config;

    this.#httpClient = new HttpClient({
      baseURL: 'https: //api.bloque.app/api/payments',
      apiKey: this.#config.apiKey,
      timeout: this.#config.timeout,
      maxRetries: this.#config.maxRetries,
    });

    this.initializeResources();
  }

  private initializeResources(): void {
    this.checkout = new CheckoutResource(this.#httpClient);
    this.payments = new PaymentResource(this.#httpClient);
  }
}
