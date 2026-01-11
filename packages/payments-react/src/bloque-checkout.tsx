import { useCallback, useEffect, useMemo, useRef } from 'react';

const CHECKOUT_BASE_URL = 'https://payments.bloque.app';

export type CheckoutMode = 'sandbox' | 'production';
export type CheckoutLang = 'es' | 'en';

export interface SDKInitOptions {
  /**
   * Your Bloque public API key
   */
  publicApiKey: string;
  /**
   * Operation mode: 'sandbox' or 'production'. Default: 'production'
   */
  mode?: CheckoutMode;
  /**
   * Default language for all components
   */
  lang?: CheckoutLang;
}

let globalConfig: SDKInitOptions | null = null;

/**
 * Initialize the Bloque Payments SDK with global configuration.
 * This allows you to set the publicApiKey and mode once, instead of
 * passing them to every component.
 *
 * @example
 * ```tsx
 * import { init } from '@bloque/payments-react';
 *
 * init({
 *   publicApiKey: 'pk_test_xxx',
 *   mode: 'sandbox',
 * });
 * ```
 */
export function init(options: SDKInitOptions): void {
  globalConfig = options;
}

/**
 * Get the current global configuration.
 * Returns null if init() has not been called.
 */
export function getConfig(): SDKInitOptions | null {
  return globalConfig;
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

export interface PaymentError {
  message: string;
  data?: unknown;
  type: string;
}

export interface AppearanceConfig {
  /**
   * Primary color (hex). Example: '#4f46e5'
   */
  primaryColor?: string;
  /**
   * Border radius. Example: '8px'
   */
  borderRadius?: string;

  /**
   * Font family. Example: 'Inter, system-ui, sans-serif'
   */
  fontFamily?: string;
}

export interface CheckoutConfig {
  /**
   * The payment amount in USD (required)
   */
  amount: number;
  webhookUrl?: string;
  /**
   * Require email in the card form. Default: true
   */
  requireEmail?: boolean;
}

export interface BloqueCheckoutProps {
  /**
   * Checkout configuration with amount and optional settings
   */
  config: CheckoutConfig;
  /**
   * Appearance customization (colors, fonts, etc.)
   */
  appearance?: AppearanceConfig;
  /**
   * Your Bloque public API key. Optional if init() was called.
   */
  publicApiKey?: string;
  /**
   * Language: 'es' (Spanish) or 'en' (English). Default: 'es'
   */
  lang?: CheckoutLang;
  /**
   * Operation mode: 'sandbox' or 'production'. Default: 'production'
   */
  mode?: CheckoutMode;
  /**
   * Callback when payment is successful
   */
  onSuccess?: (result: PaymentResult) => void;
  /**
   * Callback when payment fails
   */
  onError?: (error: PaymentError) => void;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
  /**
   * iframe width. Default: '100%'
   */
  width?: string | number;
  /**
   * iframe height. Default: '600px'
   */
  height?: string | number;
}

interface ResolvedCheckoutProps {
  amount: number;
  publicApiKey: string;
  lang: CheckoutLang;
  mode: CheckoutMode;
  requireEmail: boolean;
  webhookUrl?: string;
  appearance?: AppearanceConfig;
}

function buildCheckoutUrl(props: ResolvedCheckoutProps): string {
  const params = new URLSearchParams();

  params.set('amount', props.amount.toString());
  params.set('publicApiKey', props.publicApiKey);

  params.set('lang', props.lang);
  params.set('mode', props.mode);
  params.set('requireEmail', props.requireEmail.toString());

  if (props.webhookUrl) {
    params.set('webhookUrl', props.webhookUrl);
  }

  if (props.appearance?.primaryColor) {
    params.set('primaryColor', props.appearance.primaryColor);
  }
  if (props.appearance?.borderRadius) {
    params.set('borderRadius', props.appearance.borderRadius);
  }
  if (props.appearance?.fontFamily) {
    params.set('fontFamily', props.appearance.fontFamily);
  }

  return `${CHECKOUT_BASE_URL}/?${params.toString()}`;
}

export function BloqueCheckout({
  config,
  appearance,
  publicApiKey,
  lang,
  mode,
  onSuccess,
  onError,
  className,
  style,
  width = '100%',
  height = '600px',
}: BloqueCheckoutProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  const resolvedPublicApiKey = publicApiKey ?? globalConfig?.publicApiKey;
  const resolvedMode = mode ?? globalConfig?.mode ?? 'production';
  const resolvedLang = lang ?? globalConfig?.lang ?? 'es';

  if (!resolvedPublicApiKey) {
    throw new Error(
      'BloqueCheckout: publicApiKey is required. Either pass it as a prop or call init() first.',
    );
  }

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const checkoutUrl = useMemo(
    () =>
      buildCheckoutUrl({
        amount: config.amount,
        publicApiKey: resolvedPublicApiKey,
        lang: resolvedLang,
        mode: resolvedMode,
        requireEmail: config.requireEmail ?? true,
        webhookUrl: config.webhookUrl,
        appearance,
      }),
    [
      config.amount,
      config.requireEmail,
      config.webhookUrl,
      resolvedPublicApiKey,
      resolvedLang,
      resolvedMode,
      appearance,
    ],
  );

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== CHECKOUT_BASE_URL) return;

    const { type, data, error } = event.data || {};

    if (type === 'payment-result' && onSuccessRef.current) {
      onSuccessRef.current(data as PaymentResult);
    }

    if (type === 'payment-error' && onErrorRef.current) {
      onErrorRef.current(error as PaymentError);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  return (
    <iframe
      ref={iframeRef}
      src={checkoutUrl}
      width={width}
      height={height}
      className={className}
      style={{
        border: 'none',
        ...style,
      }}
      title="Bloque Checkout"
      allow="payment"
    />
  );
}
