import type { PaymentSubmitPayload } from './payment-submit';

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
}
