export interface AppearanceConfig {
  /**
   * Primary color for buttons and accents
   * @example '#6366f1'
   */
  primaryColor?: string;

  /**
   * Border radius for form elements
   * @example '12px'
   */
  borderRadius?: string;

  /**
   * Font family for text
   * @example 'Inter, system-ui, sans-serif'
   */
  fontFamily?: string;
}

export interface BloqueInitOptions {
  /**
   * Your Bloque public API key
   */
  publicApiKey: string;

  /**
   * Operation mode
   * @default 'production'
   */
  mode?: 'production' | 'sandbox';

  /**
   * The URL of the hosted checkout page
   * @default 'https://payments.bloque.app/checkout'
   */
  checkoutUrl?: string;
}

export interface BloqueCheckoutOptions {
  /**
   * The checkout ID returned from your backend after creating a checkout session
   */
  checkoutId: string;

  /**
   * Your Bloque public API key (optional if you called BloqueCheckout.init())
   */
  publicApiKey?: string;

  /**
   * Operation mode (optional if you called BloqueCheckout.init())
   * @default 'production'
   */
  mode?: 'production' | 'sandbox';

  /**
   * The URL of the hosted checkout page
   * @default 'https://payments.bloque.app/checkout'
   */
  checkoutUrl?: string;

  /**
   * Appearance configuration for the checkout
   */
  appearance?: AppearanceConfig;

  /**
   * Whether to show installment options in the checkout
   * @default false
   */
  showInstallments?: boolean;

  /**
   * Callback fired when the checkout iframe is ready to receive the checkout ID
   */
  onReady?: () => void;

  /**
   * Callback fired when a payment is successfully approved
   */
  onSuccess?: (data: PaymentResult) => void;

  /**
   * Callback fired when a payment fails or an error occurs
   */
  onError?: (error: string) => void;

  /**
   * Callback fired when a payment is pending (e.g., waiting for bank confirmation)
   */
  onPending?: (data: PaymentResult) => void;

  /**
   * Custom CSS styles to apply to the iframe
   */
  iframeStyles?: Record<string, string>;
}

export interface PaymentResult {
  payment_id: string;
  status: 'approved' | 'pending' | 'rejected';
  message: string;
  amount: number;
  currency: string;
  reference: string;
  created_at: string;
}

export type CheckoutMessageType =
  | 'checkout-ready'
  | 'checkout-init'
  | 'payment-result'
  | 'payment-error';

export interface CheckoutMessage {
  type: CheckoutMessageType;
  checkoutId?: string;
  data?: PaymentResult;
  error?: string;
}
