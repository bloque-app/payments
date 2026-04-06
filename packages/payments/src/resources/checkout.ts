import type {
  Checkout,
  CheckoutParams,
  CheckoutStatus,
  CreateCheckoutPayload,
  CreateCheckoutResponse,
  ListCheckoutParams,
} from '../types/checkout';
import { BaseResource } from './base';

/**
 * Maps a raw API payment object (any endpoint shape) into the SDK `Checkout`
 * type. The API stores status inside `summary.status`; this helper hoists it
 * to the top-level `status` field that consumers expect.
 */
export function toCheckout(raw: Record<string, any>): Checkout {
  const summary = raw.summary as Record<string, any> | undefined;

  return {
    id: raw.url_id ?? raw.urn ?? '',
    urn: raw.urn ?? '',
    object: 'checkout',
    url: raw.url ?? '',
    status: (summary?.status ?? 'pending') as CheckoutStatus,
    payment_type: raw.payment_type ?? 'shopping_cart',
    amount_total: raw.amount ?? 0,
    amount_subtotal: raw.amount ?? 0,
    asset: raw.asset ?? raw.currency,
    customer: summary?.payeer,
    items: raw.items ?? [],
    subscription: raw.subscription,
    metadata: raw.metadata ?? undefined,
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
    expires_at: raw.expires_at ?? null,
    client_secret: raw.client_secret,
  };
}

export class CheckoutResource extends BaseResource {
  /**
   * Create a new checkout session (payment link).
   *
   * @param params - Checkout creation parameters.
   * @returns The newly created checkout.
   * @scope `payments.create`
   */
  async create(params: CheckoutParams): Promise<Checkout> {
    const paymentType = params.payment_type ?? 'shopping_cart';

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
      payment_type: paymentType,
      image_url: params.image_url,
      items,
      success_url: params.success_url,
      cancel_url: params.cancel_url,
      redirect_url: params.redirect_url,
      webhook_url: params.webhook_url,
      expires_at: params.expires_at,
      metadata: params.metadata,
      payout_route: params.payout_route,
      tax: params.tax,
      discount_code: params.discount_code,
      payeer: params.payeer,
    };

    if (paymentType === 'subscription' && params.subscription) {
      payload.subscription = params.subscription;
    }

    const response = await this.http.post<CreateCheckoutResponse>('/', payload);

    const checkout = toCheckout({
      ...response.payment,
      url_id: response.url_id,
      payment_type: paymentType,
    });

    return {
      ...checkout,
      items: params.items,
      client_secret: response.client_secret,
    };
  }

  /**
   * Retrieve a checkout by its public link UUID (no authentication required).
   * Maps to `GET /by-link/:url_id` on the server.
   *
   * @param urlId - The link UUID (url_id) returned when the checkout was created.
   */
  async retrievePublic(urlId: string): Promise<Checkout> {
    const raw = await this.http.get<Record<string, any>>(`/by-link/${urlId}`);
    return toCheckout(raw);
  }

  /**
   * Retrieve a checkout by its link UUID.
   * Maps to `GET /link/:url_id` on the server (JWT-authed).
   *
   * @param checkoutId - The link UUID (url_id) returned when the checkout was created.
   * @scope `payments.read`
   */
  async retrieve(checkoutId: string): Promise<Checkout> {
    const raw = await this.http.get<Record<string, any>>(`/link/${checkoutId}`);
    return toCheckout(raw);
  }

  /**
   * Cancel a checkout by setting its status to `cancelled`.
   * Maps to `PATCH /:payment_urn/status` on the server.
   *
   * @param paymentUrn - The payment URN (`did:bloque:payments:...`).
   * @scope `payments.update_status`
   */
  async cancel(paymentUrn: string): Promise<Checkout> {
    const raw = await this.http.patch<Record<string, any>>(
      `/${paymentUrn}/status`,
      { status: 'cancelled' },
    );
    return toCheckout(raw.payment ?? raw);
  }

  /**
   * List checkouts owned by the authenticated user.
   * Maps to `GET /` on the server with optional query filters.
   *
   * @param params - Optional filtering and pagination parameters.
   * @scope `payments.read`
   */
  async list(params?: ListCheckoutParams): Promise<Checkout[]> {
    const raw = await this.http.get<Record<string, any>[]>(
      '/',
      params as Record<string, unknown> | undefined,
    );
    return raw.map(toCheckout);
  }
}
