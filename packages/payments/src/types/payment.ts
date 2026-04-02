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

type PaymentFormDataMap = {
  card: CardPaymentFormData;
};

export type PaymentSubmitPayload = {
  [K in keyof PaymentFormDataMap]: {
    type: K;
    data: PaymentFormDataMap[K];
  };
}[keyof PaymentFormDataMap];

export type PaymentMethodType = 'card' | 'pse' | 'cash';

export interface CreatePaymentParams {
  checkoutId?: string;
  payment: PaymentSubmitPayload;
}

export interface PaymentResponse {
  id: string;
  object: 'payment';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  three_ds?: ThreeDSData;
}

/** JSON body for card payment requests (internal builder output). */
export interface CardPaymentPayload {
  customer_email: string;
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
  is_three_ds?: boolean;
  browser_info?: BrowserInfo;
  three_ds_auth_type?: string;
}
