import type {
  Checkout,
  CheckoutParams,
  CreateCheckoutPayload,
  CreateCheckoutResponse,
} from '../types/checkout';
import { BaseResource } from './base';

export class CheckoutResource extends BaseResource {
  async create(params: CheckoutParams): Promise<Checkout> {
    const items = params.items.map((item) => ({
      name: item.name,
      amount: item.amount.toString(),
      quantity: item.quantity,
      image_url: item.image_url,
    }));

    const payload: CreateCheckoutPayload = {
      name: params.name,
      description: params.description,
      asset: params.asset ?? 'DUSD/6',
      payment_type: 'shopping_cart',
      image_url: params.image_url,
      items: items,
      redirect_url: params.success_url,
      expires_at: params.expires_at,
      metadata: params.metadata,
    };

    const response = await this.http.post<CreateCheckoutResponse>('/', payload);

    return {
      id: response.payment.urn,
      object: 'checkout',
      url: response.payment.url,
      status: response.payment.summary.status,
      amount_total: response.payment.amount,
      amount_subtotal: response.payment.amount,
      asset: response.payment.asset,
      items: params.items,
      created_at: response.payment.created_at,
      updated_at: response.payment.updated_at,
      expires_at: response.payment.expires_at,
      metadata: response.payment.metadata ?? undefined,
    };
  }

  async retrieve(checkoutId: string): Promise<Checkout> {
    return this.http.get<Checkout>(`/checkout/${checkoutId}`);
  }

  async cancel(checkoutId: string): Promise<Checkout> {
    return this.http.post<Checkout>(`/checkout/${checkoutId}/cancel`);
  }
}
