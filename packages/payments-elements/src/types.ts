export type PaymentMethodType = 'card' | 'pse' | 'cash';

export interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  description: string;
  icon?: string;
}

export const PAYMENT_METHODS: Record<PaymentMethodType, PaymentMethod> = {
  card: {
    type: 'card',
    label: 'Tarjeta de Crédito/Débito',
    description: 'Paga con tu tarjeta de crédito o débito',
  },
  pse: {
    type: 'pse',
    label: 'PSE',
    description: 'Pago seguro en línea con tu banco',
  },
  cash: {
    type: 'cash',
    label: 'Efectivo',
    description: 'Genera un recibo para pagar en efectivo',
  },
};

export interface CheckoutConfig {
  payment_methods?: PaymentMethodType[];
  amount?: number;
  currency?: string;
}

export interface AppearanceConfig {
  primaryColor?: string;
  borderRadius?: string;
  fontFamily?: string;
}

export type PaymentFormData = {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  email?: string;
  personType?: 'natural' | 'juridica';
  documentType?: string;
  documentNumber?: string;
  bankCode?: string;
  fullName?: string;
};

export type PaymentData = {
  customer_email?: string;
  number?: string;
  cvc?: string;
  exp_month?: string;
  exp_year?: string;
  card_holder?: string;
  person_type?: 'natural' | 'juridica';
  document_type?: string;
  document_number?: string;
  bank_code?: string;
  full_name?: string;
};

export interface PaymentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}
