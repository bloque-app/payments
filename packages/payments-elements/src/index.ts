import { BloqueCheckout } from './bloque-checkout';
import { CardPaymentForm } from './card-payment-form';
import { CashPaymentForm } from './cash-payment-form';
import { PaymentMethodSelector } from './payment-method-selector';
import { PSEPaymentForm } from './pse-payment-form';

customElements.define('bloque-checkout', BloqueCheckout);
customElements.define('payment-method-selector', PaymentMethodSelector);
customElements.define('card-payment-form', CardPaymentForm);
customElements.define('pse-payment-form', PSEPaymentForm);
customElements.define('cash-payment-form', CashPaymentForm);

export { BloqueCheckout } from './bloque-checkout';
export { PAYMENT_METHODS } from './types';
export type {
  AppearanceConfig,
  CheckoutConfig,
  PaymentData,
  PaymentFormData,
  PaymentMethod,
  PaymentMethodType,
  PaymentResponse,
} from './types';
