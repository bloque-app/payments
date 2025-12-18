import type { Checkout } from './checkout';

/**
 * Card payment form data
 */
export interface CardPaymentFormData {
  /**
   * Card number (16 digits)
   */
  cardNumber: string;

  /**
   * Cardholder name as it appears on the card
   */
  cardholderName: string;

  /**
   * Expiration month (MM)
   */
  expiryMonth: string;

  /**
   * Expiration year (YY or YYYY)
   */
  expiryYear: string;

  /**
   * Card verification value (3-4 digits)
   */
  cvv: string;

  /**
   * Customer email address
   */
  email?: string;
}

/**
 * PSE payment form data (Colombian online banking)
 */
export interface PSEPaymentFormData {
  /**
   * Type of person making the payment
   */
  personType: 'natural' | 'juridica';

  /**
   * Type of identification document
   */
  documentType: string;

  /**
   * Identification document number
   */
  documentNumber: string;

  /**
   * Bank code for PSE payment
   */
  bankCode: string;

  /**
   * Customer email address
   */
  email: string;
}

/**
 * Cash payment form data
 */
export interface CashPaymentFormData {
  /**
   * Customer email address
   */
  email: string;

  /**
   * Type of identification document
   */
  documentType: string;

  /**
   * Identification document number
   */
  documentNumber: string;

  /**
   * Full name of the customer
   */
  fullName: string;
}

type PaymentFormDataMap = {
  card: CardPaymentFormData;
  pse: PSEPaymentFormData;
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
   * Checkout ID from an existing checkout session
   */
  checkoutId?: string;

  /**
   * Payment data with method type
   */
  payment: PaymentSubmitPayload;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  /**
   * Payment ID
   */
  id: string;

  /**
   * Object type
   */
  object: 'payment';

  /**
   * Payment status
   */
  status: 'pending' | 'processing' | 'completed' | 'failed';

  /**
   * Associated checkout
   */
  checkout: Checkout;

  /**
   * Payment method used
   */
  payment_method: PaymentMethodType;

  /**
   * Payment amount
   */
  amount: number;

  /**
   * Currency
   */
  currency: string;

  /**
   * Creation timestamp
   */
  created_at: string;

  /**
   * Last update timestamp
   */
  updated_at: string;
}
