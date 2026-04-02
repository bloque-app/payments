/**
 * Browser fingerprint fields for 3D Secure (Wompi / Bloque direct card API).
 * Field names match the payments service `CardPaymentInput.browser_info`.
 */
export interface BrowserInfo {
  browser_color_depth: string;
  browser_screen_height: string;
  browser_screen_width: string;
  browser_language: string;
  browser_user_agent: string;
  browser_tz: string;
}

export interface ThreeDSData {
  current_step: string;
  iframe: string;
}

export interface CardPaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
  /** When true, the payment may return `three_ds` for challenge rendering. */
  is_three_ds?: boolean;
  browser_info?: BrowserInfo;
  /** Sandbox-only Wompi 3DS scenario (e.g. challenge_v2). */
  three_ds_auth_type?: string;
}

export interface PsePaymentFormData {
  email: string;
  personType: 'natural' | 'juridica';
  documentType: string;
  documentNumber: string;
  bankCode: string;
}

export interface CashPaymentFormData {
  email: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
}

type PaymentFormDataMap = {
  card: CardPaymentFormData;
  pse: PsePaymentFormData;
  cash: CashPaymentFormData;
};

export type PaymentSubmitPayload = {
  [K in keyof PaymentFormDataMap]: {
    type: K;
    data: PaymentFormDataMap[K];
  };
}[keyof PaymentFormDataMap];

export type PaymentMethodType = 'card' | 'pse' | 'cash';

export interface CreatePaymentParams {
  /**
   * The payment URN (`did:bloque:payments:...`) to pay against.
   * Maps to `payment_urn` in the request body sent to the server.
   */
  paymentUrn: string;
  payment: PaymentSubmitPayload;
  /** @deprecated Use `paymentUrn` instead. Alias kept for backward compatibility. */
  checkoutId?: string;
}

export type DirectPaymentStatus = 'approved' | 'rejected' | 'pending';

/**
 * Response from a direct payment (card / PSE / cash).
 * Aligned with the server `DirectPaymentOutput` shape.
 */
export interface PaymentResponse {
  /** Payment URN returned by the server (`payment_id` on the wire). */
  id: string;
  object: 'payment';
  status: DirectPaymentStatus;
  message: string;
  amount: number;
  currency: string;
  reference?: string;
  /** PSE redirect URL. Present when `type` is `pse`. */
  checkout_url?: string;
  /** Cash payment code. Present when `type` is `cash`. */
  payment_code?: string;
  order_id?: string;
  order_status?: string;
  three_ds?: ThreeDSData;
  created_at: string;
}

/** JSON body for card payment requests (internal builder output). */
export interface CardPaymentPayload {
  payment_urn: string;
  customer_email: string;
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
  is_three_ds?: boolean;
  browser_info?: BrowserInfo;
  three_ds_auth_type?: string;
  webhook_url?: string;
  payee: {
    name: string;
    email: string;
  };
}

/** JSON body for PSE payment requests (internal builder output). */
export interface PsePaymentPayload {
  payment_urn: string;
  person_type: 'natural' | 'juridica';
  bank_code: string;
  webhook_url?: string;
  payee: {
    email: string;
    id_type: string;
    id_number: string;
  };
}

/** JSON body for cash payment requests (internal builder output). */
export interface CashPaymentPayload {
  payment_urn: string;
  webhook_url?: string;
  payee: {
    name: string;
    email: string;
    id_type: string;
    id_number: string;
  };
}
