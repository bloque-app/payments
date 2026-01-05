import type { PaymentSubmitPayload } from '@bloque/payments-core';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import './card-payment-form';
import './cash-payment-form';
import './payment-method-selector';
import './pse-payment-form';
import type {
  AppearanceConfig,
  CheckoutConfig,
  PaymentMethodType,
} from './types';

export class BloqueCheckout extends LitElement {
  @state()
  private selectedMethod: PaymentMethodType | null = null;

  @state()
  private isLoading = false;

  @state()
  private error: string | null = null;

  @property({ type: Object })
  config: CheckoutConfig | null = null;

  @property({ type: Object })
  appearance: AppearanceConfig | null = null;

  @property({ type: Number })
  amount: number | null = null;

  @property({ type: Array })
  availableMethods: PaymentMethodType[] = ['card', 'pse', 'cash'];

  @property({ type: Boolean })
  requireEmail = true;

  @property({ type: Boolean })
  showMethodSelector = true;

  @property({ attribute: false })
  onSubmit?: (payload: PaymentSubmitPayload) => Promise<void>;

  private get effectiveAvailableMethods(): PaymentMethodType[] {
    return this.config?.payment_methods || this.availableMethods;
  }

  private get effectivePrimaryColor(): string {
    return this.appearance?.primaryColor || '#4f46e5';
  }

  private get effectiveBorderRadius(): string {
    return this.appearance?.borderRadius || '8px';
  }

  private get effectiveFontFamily(): string {
    return (
      this.appearance?.fontFamily ||
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
    );
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.effectiveAvailableMethods.length === 1) {
      this.selectedMethod = this.effectiveAvailableMethods[0];
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('availableMethods') ||
      changedProperties.has('config')
    ) {
      if (this.effectiveAvailableMethods.length === 1) {
        this.selectedMethod = this.effectiveAvailableMethods[0];
      }
    }
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(
        --bloque-font-family,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        sans-serif
      );
    }

    .checkout-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
    }

    .form-container {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 2px solid #e5e7eb;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .back-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 8px 0;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 16px;
      transition: color 0.2s ease;
    }

    .back-button:hover {
      color: #4f46e5;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      color: #991b1b;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      border-radius: 8px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .form-wrapper {
      position: relative;
    }
  `;

  private handleMethodSelected(e: CustomEvent) {
    this.selectedMethod = e.detail.method;
    this.error = null;
  }

  private async handlePaymentSubmitted(e: CustomEvent) {
    const { data, type } = e.detail;

    this.error = null;
    this.isLoading = true;

    try {
      // Si hay una función onSubmit, ejecutarla
      if (this.onSubmit) {
        await this.onSubmit({ data, type });
      }

      // Emitir evento de éxito para compatibilidad
      this.dispatchEvent(
        new CustomEvent('payment-success', {
          detail: { data, type },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Payment failed. Please try again.';

      // Emitir evento de error
      this.dispatchEvent(
        new CustomEvent('payment-error', {
          detail: { data, type, error: this.error },
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    // Apply dynamic styles
    const style = `
      --bloque-primary-color: ${this.effectivePrimaryColor};
      --bloque-border-radius: ${this.effectiveBorderRadius};
      --bloque-font-family: ${this.effectiveFontFamily};
    `;

    return html`
      <div class="checkout-container" style="${style}">
        ${
          this.showMethodSelector && this.effectiveAvailableMethods.length > 1
            ? html`
              <div class="section">
                <div class="section-title">Selecciona tu método de pago</div>
                <payment-method-selector
                  .availableMethods=${this.effectiveAvailableMethods}
                  .selectedMethod=${this.selectedMethod}
                  @method-selected=${this.handleMethodSelected}
                ></payment-method-selector>
              </div>
            `
            : ''
        }
        ${
          this.selectedMethod
            ? html`
              <div class="form-container">
                ${
                  this.error
                    ? html`
                      <div class="error-banner">
                        <span>⚠️</span>
                        <span>${this.error}</span>
                      </div>
                    `
                    : ''
                }
                <div class="section-title">Completa la información de pago</div>
                <div class="form-wrapper">
                  ${
                    this.isLoading
                      ? html`
                        <div class="loading-overlay">
                          <div class="spinner"></div>
                        </div>
                      `
                      : ''
                  }
                  ${
                    this.selectedMethod === 'card'
                      ? html`
                        <card-payment-form
                          .requireEmail=${this.requireEmail}
                          .amount=${this.config?.amount}
                          .currency=${this.config?.currency}
                          @payment-submitted=${this.handlePaymentSubmitted}
                        ></card-payment-form>
                      `
                      : this.selectedMethod === 'pse'
                        ? html`
                          <pse-payment-form
                            @payment-submitted=${this.handlePaymentSubmitted}
                          ></pse-payment-form>
                        `
                        : html`
                          <cash-payment-form
                            @payment-submitted=${this.handlePaymentSubmitted}
                          ></cash-payment-form>
                        `
                  }
                </div>
              </div>
            `
            : ''
        }
      </div>
    `;
  }
}
