import {
  type BloqueCheckoutOptions,
  BloqueCheckout as CoreBloqueCheckout,
} from '@bloque/payments-core';
import { useEffect, useRef } from 'react';

export interface BloqueCheckoutProps
  extends Omit<BloqueCheckoutOptions, 'checkoutId'> {
  /**
   * The checkout ID returned from your backend after creating a checkout session
   */
  checkoutId: string;

  /**
   * Additional CSS class name for the container div
   */
  className?: string;

  /**
   * Additional inline styles for the container div
   */
  style?: React.CSSProperties;
}

/**
 * BloqueCheckout React component
 *
 * This component renders an iframe with the Bloque hosted checkout page.
 *
 * @example
 * ```tsx
 * import { BloqueCheckout } from '@bloque/payments-react';
 *
 * function MyCheckout() {
 *   return (
 *     <BloqueCheckout
 *       checkoutId="checkout_123abc"
 *       onSuccess={(data) => {
 *         console.log('Payment successful!', data);
 *       }}
 *       onError={(error) => {
 *         console.error('Payment failed:', error);
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function BloqueCheckout({
  checkoutId,
  publicApiKey,
  mode,
  checkoutUrl,
  appearance,
  onReady,
  onSuccess,
  onError,
  onPending,
  iframeStyles,
  className,
  style,
}: BloqueCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<CoreBloqueCheckout | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const checkout = new CoreBloqueCheckout({
      checkoutId,
      publicApiKey,
      mode,
      checkoutUrl,
      appearance,
      onReady,
      onSuccess,
      onError,
      onPending,
      iframeStyles,
    });

    const iframe = checkout.createIframe();
    containerRef.current.appendChild(iframe);

    checkoutRef.current = checkout;

    return () => {
      checkout.destroy();
    };
  }, [
    checkoutId,
    publicApiKey,
    mode,
    checkoutUrl,
    appearance,
    onReady,
    onSuccess,
    onError,
    onPending,
    iframeStyles,
  ]);

  return <div ref={containerRef} className={className} style={style} />;
}

export type {
  AppearanceConfig,
  BloqueCheckoutOptions,
  BloqueInitOptions,
  PaymentResult,
} from '@bloque/payments-core';
// Re-export types and utilities from core for convenience
export {
  BloqueCheckout as BloqueCheckoutCore,
  init,
} from '@bloque/payments-core';
