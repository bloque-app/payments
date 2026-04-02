import { MC_ID_CHECK_LOGO_DATA_URI } from './assets/mc-id-check-logo-data-uri';
import type {
  BloqueCheckoutOptions,
  BloqueInitOptions,
  CheckoutMessage,
  PaymentMethod,
  PaymentResult,
  ThreeDSChallengeData,
} from './types';

const DEFAULT_CHECKOUT_URL = 'https://payments.bloque.app/checkout';

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function decodeHtmlEntities(encoded: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = encoded;
  return textarea.value;
}

export class BloqueCheckout {
  private static globalConfig: BloqueInitOptions | null = null;

  private iframe: HTMLIFrameElement | null = null;
  private options: BloqueCheckoutOptions & {
    checkoutUrl: string;
    mode: 'production' | 'sandbox';
    publicApiKey: string;
    paymentMethods: PaymentMethod[];
  };
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isReady = false;

  /** Full-screen 3DS overlay mounted on document.body (avoids nested iframes). */
  private threeDsOverlay: HTMLDivElement | null = null;
  private threeDsTimers: ReturnType<typeof setTimeout>[] = [];
  private threeDsContentEl: HTMLDivElement | null = null;
  private threeDsStatusEl: HTMLDivElement | null = null;

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

    const publishableKey =
      options.publishableKey ||
      options.publicApiKey ||
      BloqueCheckout.globalConfig?.publishableKey ||
      BloqueCheckout.globalConfig?.publicApiKey;
    const mode =
      options.mode || BloqueCheckout.globalConfig?.mode || 'production';
    const checkoutUrl =
      options.checkoutUrl ||
      BloqueCheckout.globalConfig?.checkoutUrl ||
      DEFAULT_CHECKOUT_URL;

    if (!publishableKey) {
      throw new Error(
        '[BloqueCheckout] publishableKey (or publicApiKey) is required. Either pass it as an option or call BloqueCheckout.init() first.',
      );
    }

    this.options = {
      checkoutId: options.checkoutId,
      clientSecret: options.clientSecret,
      publishableKey,
      publicApiKey: publishableKey,
      mode,
      checkoutUrl,
      appearance: options.appearance,
      showInstallments: options.showInstallments,
      paymentMethods: options.paymentMethods || ['card'],
      onReady: options.onReady,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onPending: options.onPending,
      iframeStyles: options.iframeStyles,
      three_ds_auth_type: options.three_ds_auth_type,
      onThreeDSChallenge: options.onThreeDSChallenge,
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

    if (this.options.paymentMethods && this.options.paymentMethods.length > 0) {
      params.set('paymentMethods', this.options.paymentMethods.join(','));
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
        (this.iframe.style as unknown as Record<string, string>)[key] = value;
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
      const { type, data, error, threeDsData } = event.data || {};

      switch (type) {
        case 'checkout-ready':
          this.handleCheckoutReady();
          break;

        case '3ds-challenge':
          this.handleThreeDSChallenge(threeDsData);
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
          clientSecret: this.options.clientSecret,
          publishableKey: this.options.publishableKey,
          publicApiKey: this.options.publicApiKey,
          mode: this.options.mode,
          ...(this.options.three_ds_auth_type !== undefined
            ? { three_ds_auth_type: this.options.three_ds_auth_type }
            : {}),
        },
        '*',
      );
    }

    this.options.onReady?.();
  }

  private clearThreeDsTimers(): void {
    for (const t of this.threeDsTimers) {
      clearTimeout(t);
    }
    this.threeDsTimers = [];
  }

  private removeThreeDsOverlay(): void {
    this.clearThreeDsTimers();
    this.threeDsContentEl = null;
    this.threeDsStatusEl = null;
    if (this.threeDsOverlay?.parentNode) {
      this.threeDsOverlay.parentNode.removeChild(this.threeDsOverlay);
    }
    this.threeDsOverlay = null;
  }

  private setThreeDsStatus(text: string): void {
    if (this.threeDsStatusEl) {
      this.threeDsStatusEl.textContent = text;
    }
  }

  private showMcLogoInContent(): void {
    if (!this.threeDsContentEl) return;
    this.threeDsContentEl.replaceChildren();
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:flex;align-items:center;justify-content:center;width:100%;min-height:400px;background:#fff;';
    const img = document.createElement('img');
    img.src = MC_ID_CHECK_LOGO_DATA_URI;
    img.alt = 'Mastercard Identity Check';
    img.style.cssText = 'width:256px;max-width:80%;height:auto;';
    wrap.appendChild(img);
    this.threeDsContentEl.appendChild(wrap);
  }

  private handleThreeDSChallenge(data: ThreeDSChallengeData | undefined): void {
    if (!data?.iframe || typeof document === 'undefined') {
      return;
    }

    this.options.onThreeDSChallenge?.();

    this.removeThreeDsOverlay();

    const root = document.createElement('div');
    root.className = 'bloque-3ds-overlay';
    root.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;font-family:system-ui,sans-serif;';

    const panel = document.createElement('div');
    panel.style.cssText =
      'margin:auto;width:min(480px,96vw);max-height:90vh;display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);';

    const header = document.createElement('div');
    header.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb;';

    const title = document.createElement('span');
    title.textContent = 'Verificación segura';
    title.style.cssText = 'font-weight:600;font-size:15px;color:#111827;';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText =
      'border:none;background:transparent;font-size:20px;line-height:1;cursor:pointer;color:#6b7280;padding:4px 8px;';
    closeBtn.addEventListener('click', () => {
      this.removeThreeDsOverlay();
      this.options.onError?.('3D Secure verification was cancelled');
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const statusEl = document.createElement('div');
    statusEl.style.cssText =
      'padding:8px 16px;font-size:13px;color:#4b5563;text-align:center;';
    statusEl.textContent = 'Iniciando verificación segura...';

    const contentEl = document.createElement('div');
    contentEl.style.cssText =
      'flex:1;min-height:400px;border-top:1px solid #e5e7eb;';

    panel.appendChild(header);
    panel.appendChild(statusEl);
    panel.appendChild(contentEl);
    root.appendChild(panel);
    document.body.appendChild(root);

    this.threeDsOverlay = root;
    this.threeDsStatusEl = statusEl;
    this.threeDsContentEl = contentEl;

    this.showMcLogoInContent();

    const decoded = decodeHtmlEntities(data.iframe);

    const splashTimer = setTimeout(() => {
      this.setThreeDsStatus(
        'Complete la verificación de su banco para continuar',
      );
      if (!this.threeDsContentEl) return;
      this.threeDsContentEl.replaceChildren();

      const frameWrap = document.createElement('div');
      frameWrap.style.cssText = 'width:100%;min-height:400px;background:#fff;';

      const iframeEl = document.createElement('iframe');
      iframeEl.title = '3D Secure verification';
      iframeEl.style.cssText =
        'width:100%;height:400px;border:0;display:block;';

      if (isUrl(decoded)) {
        iframeEl.src = decoded.trim();
        iframeEl.setAttribute(
          'sandbox',
          'allow-scripts allow-forms allow-popups allow-same-origin',
        );
      } else {
        iframeEl.srcdoc = decoded;
        iframeEl.setAttribute(
          'sandbox',
          'allow-scripts allow-forms allow-popups',
        );
      }

      frameWrap.appendChild(iframeEl);
      this.threeDsContentEl.appendChild(frameWrap);
    }, 3000);
    this.threeDsTimers.push(splashTimer);
  }

  private handlePaymentResult(data: PaymentResult): void {
    if (this.threeDsOverlay) {
      this.finishThreeDsThenDispatch(data);
      return;
    }
    this.dispatchPaymentResult(data);
  }

  private finishThreeDsThenDispatch(data: PaymentResult): void {
    this.clearThreeDsTimers();
    this.setThreeDsStatus('Autenticación completada, redirigiendo...');
    this.showMcLogoInContent();

    const t = setTimeout(() => {
      this.removeThreeDsOverlay();
      this.dispatchPaymentResult(data);
    }, 2000);
    this.threeDsTimers.push(t);
  }

  private dispatchPaymentResult(data: PaymentResult): void {
    if (data.status === 'approved') {
      this.options.onSuccess?.(data);
    } else if (data.status === 'pending') {
      this.options.onPending?.(data);
    } else if (data.status === 'rejected') {
      this.options.onError?.(data.message || 'Payment was rejected');
    }
  }

  private handlePaymentError(error: string): void {
    if (this.threeDsOverlay) {
      this.removeThreeDsOverlay();
    }
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
    this.removeThreeDsOverlay();

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
