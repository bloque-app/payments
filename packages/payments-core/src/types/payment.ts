/**
 * Internal reference types. NOT exported from the @bloque/payments-core barrel.
 * The canonical versions live in @bloque/payments.
 */
import type { PaymentSubmitPayload } from './payment-submit';

export type PaymentMethodType = 'card' | 'pse' | 'cash';

export interface CreatePaymentParams {
  paymentUrn: string;
  payment: PaymentSubmitPayload;
}

export interface PaymentResponse {
  id: string;
  object: 'payment';
  status: 'approved' | 'rejected' | 'pending';
  message: string;
  amount: number;
  currency: string;
  created_at: string;
}
