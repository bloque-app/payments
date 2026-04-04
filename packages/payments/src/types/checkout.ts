import type { ASSETS, Metadata, PayoutRoute } from './common';
import type { Customer } from './customer';

export type PaymentType = 'shopping_cart' | 'subscription';

export type SubscriptionStatus = 'active' | 'expired' | 'eliminated' | 'paid';

/**
 * Cron-based subscription schedule. Required when `payment_type` is `subscription`.
 */
export interface SubscriptionConfig {
  type: 'cron';
  /** Cron expression, e.g. `"0 0 1 * *"` for monthly. */
  cron: string;
  /** ISO 8601 start date. */
  startDate?: string;
  /** ISO 8601 end date. */
  endDate?: string;
  status?: SubscriptionStatus;
}

export interface TaxInfo {
  name: string;
  /** Tax rate as a decimal, e.g. `0.19` for 19%. */
  rate: number;
}

export type IdType = 'CC' | 'NIT' | 'RUT' | 'PASSPORT' | 'DRIVER_LICENSE';

export interface PayeerInfo {
  name: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  id_type?: IdType;
  id_number?: string;
}

export interface CreateCheckoutPayload {
  name: string;
  description?: string;
  image_url?: string;
  asset: ASSETS;
  payment_type: PaymentType;
  items: {
    name: string;
    amount: string;
    quantity: number;
    sku?: string;
    description?: string;
    image_url?: string;
  }[];
  subscription?: SubscriptionConfig;
  success_url?: string;
  redirect_url?: string;
  cancel_url?: string;
  webhook_url?: string;
  expires_at?: string;
  metadata?: Metadata;
  payout_route?: PayoutRoute[];
  tax?: TaxInfo[];
  discount_code?: string;
  payeer?: PayeerInfo;
}

export interface CreateCheckoutResponse {
  payment: {
    urn: string;
    url: string;
    asset: ASSETS;
    amount: number;
    image_url?: string | null;
    metadata?: Metadata | null;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
    summary: {
      status: CheckoutStatus;
    };
  };
  url_id: string;
  client_secret?: string;
}

/**
 * Represents a single item included in a checkout.
 */
export interface CheckoutItem {
  /**
   * Name of the product or service.
   */
  name: string;

  /**
   * Optional description of the item.
   */
  description?: string;

  /**
   * Unit price of the item, expressed in the checkout currency.
   * Usually represented in the smallest currency unit (e.g. cents).
   */
  amount: number;

  /**
   * Number of units for this item.
   */
  quantity: number;

  /**
   * URL of an image representing the item.
   */
  image_url?: string;
}

/**
 * Parameters used to create a checkout.
 */
export interface CheckoutParams {
  /**
   * Name of the checkout session.
   */
  name: string;

  /**
   * Optional description of the checkout.
   */
  description?: string;

  /**
   * URL of an image representing the checkout.
   */
  image_url?: string;

  /**
   * List of items to be charged.
   * Must contain at least one item.
   */
  items: CheckoutItem[];

  /**
   * Asset used for the checkout.
   *
   * @default 'DUSD/6'
   */
  asset?: ASSETS;

  /**
   * Checkout type. Use `subscription` for recurring payments.
   *
   * @default 'shopping_cart'
   */
  payment_type?: PaymentType;

  /**
   * Subscription schedule. Required when `payment_type` is `'subscription'`.
   */
  subscription?: SubscriptionConfig;

  /**
   * URL the customer will be redirected to after a successful payment.
   */
  success_url?: string;

  /**
   * URL the customer will be redirected to if the payment is canceled.
   */
  cancel_url?: string;

  /**
   * Redirect URL for subscription payments after checkout completion.
   */
  redirect_url?: string;

  /**
   * Arbitrary metadata attached to the checkout.
   * Useful for internal references or business logic.
   */
  metadata?: Metadata;

  /**
   * Checkout expiration date and time in ISO 8601 format.
   * If not provided, the checkout may not expire automatically.
   */
  expires_at?: string;

  /**
   * Payment methods enabled for this checkout.
   * Controls which payment tabs appear in the hosted checkout UI.
   * Not sent to the server — used only by the hosted checkout app.
   *
   * @default ['card', 'pse', 'cash']
   */
  payment_methods?: ('card' | 'pse' | 'cash')[];

  /**
   * Payout routes for distributing funds after payment.
   * Each route specifies a destination network and the amount or percentage to send.
   */
  payout_route?: PayoutRoute[];

  /**
   * Webhook URL for payment status change notifications.
   */
  webhook_url?: string;

  /**
   * Tax lines applied to the checkout total.
   */
  tax?: TaxInfo[];

  /**
   * Discount code to apply to the checkout.
   */
  discount_code?: string;

  /**
   * Pre-filled payeer (buyer) information.
   */
  payeer?: PayeerInfo;
}

/**
 * Parameters for listing checkouts with optional filtering and pagination.
 */
export interface ListCheckoutParams {
  status?: CheckoutStatus;
  payment_type?: 'shopping_cart' | 'subscription';
  payeer_search?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
}

/**
 * Possible states of a checkout.
 * Aligned with the server `Status` enum in the payments domain.
 */
export type CheckoutStatus =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'deposited'
  | 'cancelled';

/**
 * Represents a checkout object returned by the API.
 */
export interface Checkout {
  /**
   * Unique identifier of the checkout.
   */
  id: string;

  /**
   * URN identifier for the underlying payment entity.
   */
  urn: string;

  /**
   * Object type discriminator.
   */
  object: 'checkout';

  /**
   * Public URL where the customer can complete the payment.
   */
  url: string;

  /**
   * Current status of the checkout.
   */
  status: CheckoutStatus;

  /**
   * Checkout type — `shopping_cart` or `subscription`.
   */
  payment_type: PaymentType;

  /**
   * Total amount to be paid, including taxes, discounts,
   * or additional charges.
   */
  amount_total: number;

  /**
   * Subtotal amount before additional charges.
   */
  amount_subtotal: number;

  /**
   * Asset used for the checkout.
   */
  asset: ASSETS;

  /**
   * Customer associated with the checkout, if any.
   */
  customer?: Customer;

  /**
   * Items included in the checkout.
   */
  items: CheckoutItem[];

  /**
   * Subscription configuration, present when `payment_type` is `subscription`.
   */
  subscription?: SubscriptionConfig;

  /**
   * Metadata attached to the checkout.
   */
  metadata?: Metadata;

  /**
   * Checkout creation timestamp in ISO 8601 format.
   */
  created_at: string;

  /**
   * Last update timestamp in ISO 8601 format.
   */
  updated_at: string;

  /**
   * Checkout expiration timestamp in ISO 8601 format.
   */
  expires_at: string | null;

  /**
   * Checkout-scoped JWT for browser-side auth in the hosted checkout.
   * Present when using secretKey-based auth (v2 API keys).
   */
  client_secret?: string;
}
