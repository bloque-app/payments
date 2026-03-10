import type { ASSETS, Metadata, PayoutRoute } from './common';
import type { Customer } from './customer';

export interface CreateCheckoutPayload {
  name: string;
  description?: string;
  image_url?: string;
  asset: ASSETS;
  payment_type: 'shopping_cart';
  items: {
    name: string;
    amount: string;
    quantity: number;
    image_url?: string;
  }[];
  redirect_url: string;
  expires_at?: string;
  metadata?: Metadata;
  payout_route?: PayoutRoute[];
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
   * @default 'dUSD/6'
   */
  asset?: ASSETS;

  /**
   * URL the customer will be redirected to after a successful payment.
   */
  success_url: string;

  /**
   * URL the customer will be redirected to if the payment is canceled.
   */
  cancel_url: string;

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
   *
   * @default ['card', 'pse', 'cash']
   */
  payment_methods?: ('card' | 'pse' | 'cash')[];

  /**
   * Payout routes for distributing funds after payment.
   * Each route specifies a destination network and the amount or percentage to send.
   */
  payout_route?: PayoutRoute[];
}

/**
 * Possible states of a checkout.
 */
export type CheckoutStatus =
  | 'pending' // Created and waiting for payment
  | 'completed' // Successfully paid
  | 'expired' // Expired without payment
  | 'canceled'; // Manually or user canceled

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
}
