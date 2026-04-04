import type {
  Checkout,
  CheckoutParams,
  CreateCheckoutPayload,
  CreateCheckoutResponse,
  ListCheckoutParams,
} from '../types/checkout';
import { BaseResource } from './base';

export class CheckoutResource extends BaseResource {
  /**
   * Create a new checkout session (payment link).
   * @param params - Checkout creation parameters.
   * @returns The newly created checkout.
   */
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
      cancel_url: params.cancel_url,
      webhook_url: params.webhook_url,
      expires_at: params.expires_at,
      metadata: params.metadata,
      payout_route: params.payout_route,
    };

    const response = await this.http.post<CreateCheckoutResponse>('/', payload);

    return {
      id: response.url_id,
      urn: response.payment.urn,
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
      client_secret: response.client_secret,
    };
  }

  /**
   * Retrieve a checkout by its link UUID.
   * Maps to `GET /link/:url_id` on the server (JWT-authed).
   *
   * @param checkoutId - The link UUID (url_id) returned when the checkout was created.
   */
  async retrieve(checkoutId: string): Promise<Checkout> {
    return this.http.get<Checkout>(`/link/${checkoutId}`);
  }

  /**
   * Cancel a checkout by setting its status to `cancelled`.
   * Maps to `PATCH /:payment_urn/status` on the server.
   *
   * @param paymentUrn - The payment URN (`did:bloque:payments:...`).
   */
  async cancel(paymentUrn: string): Promise<Checkout> {
    return this.http.patch<Checkout>(`/${paymentUrn}/status`, {
      status: 'cancelled',
    });
  }

  /**
   * List checkouts owned by the authenticated user.
   * Maps to `GET /` on the server with optional query filters.
   *
   * @param params - Optional filtering and pagination parameters.
   */
  async list(params?: ListCheckoutParams): Promise<Checkout[]> {
    return this.http.get<Checkout[]>(
      '/',
      params as Record<string, unknown> | undefined,
    );
  }
}
