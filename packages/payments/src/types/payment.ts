export interface CardPaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
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
}
