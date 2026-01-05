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

export interface CardFormLabels {
  cardNumber?: string;
  cardNumberPlaceholder?: string;
  cardholderName?: string;
  cardholderNamePlaceholder?: string;
  expiryDate?: string;
  expiryDatePlaceholder?: string;
  cvv?: string;
  cvvPlaceholder?: string;
  email?: string;
  emailPlaceholder?: string;
  submitButton?: string;
}

export interface PSEFormLabels {
  personType?: string;
  documentType?: string;
  documentNumber?: string;
  documentNumberPlaceholder?: string;
  bank?: string;
  bankPlaceholder?: string;
  email?: string;
  emailPlaceholder?: string;
  submitButton?: string;
}

export interface CashFormLabels {
  fullName?: string;
  fullNamePlaceholder?: string;
  documentType?: string;
  documentNumber?: string;
  documentNumberPlaceholder?: string;
  email?: string;
  emailPlaceholder?: string;
  submitButton?: string;
}

export interface CheckoutLabels {
  card?: CardFormLabels;
  pse?: PSEFormLabels;
  cash?: CashFormLabels;
}

export interface CheckoutConfig {
  payment_methods?: PaymentMethodType[];
  amount: number;
  currency?: 'USD';
  labels?: CheckoutLabels;
  webhookUrl?: string;
}

export interface AppearanceConfig {
  primaryColor?: string;
  borderRadius?: string;
  fontFamily?: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
}
