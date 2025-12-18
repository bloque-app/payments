import type { CardPaymentFormData } from './card-payment';
import type { CashPaymentFormData } from './cash-payment';
import type { PSEPaymentFormData } from './pse-payment';

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
