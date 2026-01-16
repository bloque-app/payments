import type {
  BloqueCheckoutOptions,
  BloqueInitOptions,
  CheckoutMessage,
  PaymentResult,
} from './types';

const DEFAULT_CHECKOUT_URL = 'http://payments.bloque.app/checkout';

export class BloqueCheckout {
  private static globalConfig: BloqueInitOptions | null = null;

  private iframe: HTMLIFrameElement | null = null;
  private options: BloqueCheckoutOptions & {
    checkoutUrl: string;
    mode: 'production' | 'sandbox';
    publicApiKey: string;
  };
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isReady = false;

  /**
   * Initialize global configuration for all BloqueCheckout instances
   * This allows you to set publicApiKey and mode once instead of passing them to every checkout
   *
   * @example
   * ```typescript
   * BloqueCheckout.init({
   *   publicApiKey: 'pk_test_...',
   *   mode: 'sandbox'
   * });
   * ```
   */
  static init(config: BloqueInitOptions): void {
    BloqueCheckout.globalConfig = config;
  }

  static getGlobalConfig(): BloqueInitOptions | null {
    return BloqueCheckout.globalConfig;
  }

  constructor(options: BloqueCheckoutOptions) {
    if (!options.checkoutId) {
      throw new Error('[BloqueCheckout] checkoutId is required');
    }

    const publicApiKey =
      options.publicApiKey || BloqueCheckout.globalConfig?.publicApiKey;
    const mode =
      options.mode || BloqueCheckout.globalConfig?.mode || 'production';
    const checkoutUrl =
      options.checkoutUrl ||
      BloqueCheckout.globalConfig?.checkoutUrl ||
      DEFAULT_CHECKOUT_URL;

    if (!publicApiKey) {
      throw new Error(
        '[BloqueCheckout] publicApiKey is required. Either pass it as an option or call BloqueCheckout.init() first.',
      );
    }

    this.options = {
      checkoutId: options.checkoutId,
      publicApiKey,
      mode,
      checkoutUrl,
      appearance: options.appearance,
      showInstallments: options.showInstallments,
      onReady: options.onReady,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onPending: options.onPending,
      iframeStyles: options.iframeStyles,
    };
  }

  createIframe(): HTMLIFrameElement {
    if (this.iframe) {
      return this.iframe;
    }

    this.iframe = document.createElement('iframe');

    let iframeUrl = this.options.checkoutUrl;
    const params = new URLSearchParams();

    if (this.options.appearance) {
      if (this.options.appearance.primaryColor) {
        params.set('primaryColor', this.options.appearance.primaryColor);
      }
      if (this.options.appearance.borderRadius) {
        params.set('borderRadius', this.options.appearance.borderRadius);
      }
      if (this.options.appearance.fontFamily) {
        params.set('fontFamily', this.options.appearance.fontFamily);
      }
    }

    if (this.options.showInstallments) {
      params.set('showInstallments', 'true');
    }

    const queryString = params.toString();
    if (queryString) {
      iframeUrl = `${iframeUrl}?${queryString}`;
    }

    this.iframe.src = iframeUrl;
    this.iframe.setAttribute('frameborder', '0');
    this.iframe.setAttribute('allowtransparency', 'true');
    this.iframe.setAttribute('allow', 'payment');

    const defaultStyles: Record<string, string> = {
      width: '100%',
      height: '600px',
      border: 'none',
      borderRadius: '8px',
    };

    const styles = { ...defaultStyles, ...this.options.iframeStyles };

    for (const [key, value] of Object.entries(styles)) {
      if (value !== undefined && value !== null) {
        (this.iframe.style as any)[key] = value;
      }
    }

    this.setupMessageListener();

    return this.iframe;
  }

  mount(container: HTMLElement | string): void {
    const containerElement =
      typeof container === 'string'
        ? document.getElementById(container) ||
          document.querySelector(container)
        : container;

    if (!containerElement) {
      throw new Error('Container element not found');
    }

    const iframe = this.createIframe();
    containerElement.appendChild(iframe);
  }

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent<CheckoutMessage>) => {
      const { type, data, error } = event.data || {};

      switch (type) {
        case 'checkout-ready':
          this.handleCheckoutReady();
          break;

        case 'payment-result':
          if (data) {
            this.handlePaymentResult(data);
          }
          break;

        case 'payment-error':
          if (error) {
            this.handlePaymentError(error);
          }
          break;

        default:
          // Ignore unknown message types
          break;
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  private handleCheckoutReady(): void {
    this.isReady = true;

    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(
        {
          type: 'checkout-init',
          checkoutId: this.options.checkoutId,
          publicApiKey: this.options.publicApiKey,
          mode: this.options.mode,
        },
        '*',
      );
    }

    this.options.onReady?.();
  }

  private handlePaymentResult(data: PaymentResult): void {
    if (data.status === 'approved') {
      this.options.onSuccess?.(data);
    } else if (data.status === 'pending') {
      this.options.onPending?.(data);
    } else if (data.status === 'rejected') {
      this.options.onError?.(data.message || 'Payment was rejected');
    }
  }

  private handlePaymentError(error: string): void {
    this.options.onError?.(error);
  }

  isCheckoutReady(): boolean {
    return this.isReady;
  }

  getIframe(): HTMLIFrameElement | null {
    return this.iframe;
  }

  updateOptions(options: Partial<BloqueCheckoutOptions>): void {
    this.options = {
      ...this.options,
      ...options,
      checkoutUrl: options.checkoutUrl || this.options.checkoutUrl,
      mode: options.mode || this.options.mode,
    };
  }

  destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }

    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    this.isReady = false;
  }
}

/**
 * Initialize global configuration for all BloqueCheckout instances
 * This is a convenience wrapper around BloqueCheckout.init()
 *
 * @example
 * ```typescript
 * import { init } from '@bloque/payments-core';
 *
 * init({
 *   publicApiKey: 'pk_test_...',
 *   mode: 'sandbox'
 * });
 * ```
 */
export function init(config: BloqueInitOptions): void {
  BloqueCheckout.init(config);
}

/**
 * Helper function to create and mount a checkout in one step
 */
export function createCheckout(
  options: BloqueCheckoutOptions & { container: HTMLElement | string },
): BloqueCheckout {
  const { container, ...checkoutOptions } = options;
  const checkout = new BloqueCheckout(checkoutOptions);
  checkout.mount(container);
  return checkout;
}
