import '@bloque/payments-elements';
import type {
  AppearanceConfig,
  CheckoutConfig,
  PaymentMethodType,
  PaymentResponse,
  PaymentSubmitPayload,
} from '@bloque/payments-elements';
import { useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'bloque-checkout': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export interface BloqueCheckoutProps {
  config?: CheckoutConfig;
  appearance?: AppearanceConfig;
  amount?: number;
  availableMethods?: PaymentMethodType[];
  requireEmail?: boolean;
  showMethodSelector?: boolean;
  onSubmit?: (
    payload: PaymentSubmitPayload,
  ) => Promise<PaymentResponse | undefined>;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: { message: string; data: unknown; type: string }) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function BloqueCheckout({
  config,
  appearance,
  amount,
  availableMethods,
  requireEmail = true,
  showMethodSelector = true,
  onSubmit,
  onSuccess,
  onError,
  className,
  style,
}: BloqueCheckoutProps) {
  const checkoutRef = useRef<
    HTMLElement & {
      config?: CheckoutConfig;
      appearance?: AppearanceConfig;
      amount?: number;
      availableMethods?: PaymentMethodType[];
      requireEmail?: boolean;
      showMethodSelector?: boolean;
      onSubmit?: (
        payload: PaymentSubmitPayload,
      ) => Promise<PaymentResponse | undefined>;
      onSuccess?: (response: PaymentResponse) => void;
      onError?: (error: {
        message: string;
        data: unknown;
        type: string;
      }) => void;
    }
  >(null);

  useEffect(() => {
    const element = checkoutRef.current;
    if (!element) return;

    if (config) element.config = config;
    if (appearance) element.appearance = appearance;
    if (amount !== undefined) element.amount = amount;
    if (availableMethods) element.availableMethods = availableMethods;
    element.requireEmail = requireEmail;
    element.showMethodSelector = showMethodSelector;
    if (onSubmit) element.onSubmit = onSubmit;
    if (onSuccess) element.onSuccess = onSuccess;
    if (onError) element.onError = onError;
  }, [
    config,
    appearance,
    amount,
    availableMethods,
    requireEmail,
    showMethodSelector,
    onSubmit,
    onSuccess,
    onError,
  ]);

  return (
    // @ts-expect-error - Custom element types are not fully supported
    <bloque-checkout ref={checkoutRef} className={className} style={style} />
  );
}
