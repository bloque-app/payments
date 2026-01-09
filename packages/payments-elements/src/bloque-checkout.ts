import type {
  CardPaymentFormData,
  CashPaymentFormData,
  PaymentSubmitPayload,
  PSEPaymentFormData,
} from '@bloque/payments-core';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import './card-payment-form';
import './cash-payment-form';
import './payment-method-selector';
import './pse-payment-form';
import { getSDKConfig } from './sdk-config';
import type {
  AppearanceConfig,
  CheckoutConfig,
  PaymentMethodType,
  PaymentResponse,
} from './types';

export class BloqueCheckout extends LitElement {
  @state()
  private selectedMethod: PaymentMethodType | null = null;

  @state()
  private isLoading = false;

  @state()
  private error: string | null = null;

  @state()
  private paymentResult: PaymentResponse | null = null;

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
  onSubmit?: (
    payload: PaymentSubmitPayload,
  ) => Promise<PaymentResponse | undefined>;

  @property({ attribute: false })
  onSuccess?: (response: PaymentResponse) => void;

  @property({ attribute: false })
  onError?: (error: { message: string; data: unknown; type: string }) => void;

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

  private formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
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

    .secure-payment {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 13px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .secure-payment svg {
      width: 16px;
      height: 16px;
    }

    .success-container {
      text-align: center;
      padding: 32px 24px;
      animation: fadeIn 0.3s ease-in;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: #dcfce7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .success-icon svg {
      width: 32px;
      height: 32px;
      color: #16a34a;
    }

    .success-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .success-message {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 24px;
    }

    .success-details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      text-align: left;
    }

    .success-detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .success-detail-row:not(:last-child) {
      border-bottom: 1px solid #e5e7eb;
    }

    .success-detail-label {
      color: #6b7280;
    }

    .success-detail-value {
      color: #111827;
      font-weight: 500;
    }

    .pending-container {
      text-align: center;
      padding: 32px 24px;
      animation: fadeIn 0.3s ease-in;
    }

    .pending-icon {
      width: 64px;
      height: 64px;
      background: #fef3c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .pending-icon svg {
      width: 32px;
      height: 32px;
      color: #d97706;
    }

    .pending-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .pending-message {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 24px;
    }
  `;

  private handleMethodSelected(e: CustomEvent) {
    this.selectedMethod = e.detail.method;
    this.error = null;
  }

  private buildCardPayload(data: CardPaymentFormData): Record<string, string> {
    return {
      customer_email: data.email || '',
      number: data.cardNumber,
      cvc: data.cvv,
      exp_month: data.expiryMonth,
      exp_year: data.expiryYear,
      card_holder: data.cardholderName,
    };
  }

  private buildPSEPayload(data: PSEPaymentFormData): Record<string, string> {
    return {
      customer_email: data.email,
      person_type: data.personType,
      document_type: data.documentType,
      document_number: data.documentNumber,
      bank_code: data.bankCode,
    };
  }

  private buildCashPayload(data: CashPaymentFormData): Record<string, string> {
    return {
      customer_email: data.email,
      document_type: data.documentType,
      document_number: data.documentNumber,
      full_name: data.fullName,
    };
  }

  private buildPaymentPayload(
    payment: PaymentSubmitPayload,
  ): Record<string, unknown> {
    switch (payment.type) {
      case 'card':
        return this.buildCardPayload(payment.data);
      case 'pse':
        return this.buildPSEPayload(payment.data);
      case 'cash':
        return this.buildCashPayload(payment.data);
    }
  }

  private async sendToAPI(
    payload: PaymentSubmitPayload,
  ): Promise<PaymentResponse> {
    const sdkConfig = getSDKConfig();

    if (!sdkConfig.isInitialized()) {
      throw new Error(
        'SDK not initialized. Please call BloquePayments.init() before using the checkout.',
      );
    }

    const paymentPayload = this.buildPaymentPayload(payload);

    if (!this.config?.amount) {
      throw new Error('Amount is required in config');
    }
    paymentPayload.amount = this.config.amount;

    paymentPayload.currency = this.config?.currency || 'USD';

    if (this.config?.webhookUrl) {
      paymentPayload.webhook_url = this.config.webhookUrl;
    }

    const apiUrl = sdkConfig.getApiUrl();
    const response = await fetch(`${apiUrl}/api/payments/${payload.type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        'X-Api-Key': sdkConfig.publicApiKey!,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Payment failed with status ${response.status}`,
      );
    }

    return response.json();
  }

  private async handlePaymentSubmitted(e: CustomEvent) {
    const { data, type } = e.detail;
    const payload: PaymentSubmitPayload = { data, type };

    this.error = null;
    this.isLoading = true;

    try {
      let paymentResponse: PaymentResponse | undefined;

      if (this.onSubmit) {
        const result = await this.onSubmit(payload);
        if (result) {
          paymentResponse = result;
        }
      } else {
        paymentResponse = await this.sendToAPI(payload);
      }

      if (paymentResponse && paymentResponse.status === 'approved') {
        this.paymentResult = paymentResponse;
      } else if (paymentResponse && paymentResponse.status === 'pending') {
        this.paymentResult = paymentResponse;
      } else if (paymentResponse && paymentResponse.status === 'rejected') {
        this.error =
          paymentResponse.message ||
          'El pago fue rechazado. Por favor, intenta con otro método de pago.';
      }

      if (this.onSuccess && paymentResponse) {
        this.onSuccess(paymentResponse);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Payment failed. Please try again.';

      this.error = errorMessage;

      if (this.onError) {
        this.onError({
          message: errorMessage,
          data,
          type,
        });
      }
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    const style = `
      --bloque-primary-color: ${this.effectivePrimaryColor};
      --bloque-border-radius: ${this.effectiveBorderRadius};
      --bloque-font-family: ${this.effectiveFontFamily};
    `;

    return html`
      <div class="checkout-container" style="${style}">
        ${
          this.paymentResult?.status === 'approved'
            ? html`
            <div class="success-container">
              <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div class="success-title">${this.config?.labels?.successTitle || '¡Pago realizado correctamente!'}</div>
              <div class="success-message">${this.config?.labels?.successMessage || 'Tu pago ha sido procesado exitosamente.'}</div>
              <div class="success-details">
                <div class="success-detail-row">
                  <span class="success-detail-label">ID de pago</span>
                  <span class="success-detail-value">${this.paymentResult.payment_id}</span>
                </div>
                <div class="success-detail-row">
                  <span class="success-detail-label">Referencia</span>
                  <span class="success-detail-value">${this.paymentResult.reference}</span>
                </div>
                <div class="success-detail-row">
                  <span class="success-detail-label">Monto</span>
                  <span class="success-detail-value">${this.formatAmount(this.paymentResult.amount, this.paymentResult.currency)}</span>
                </div>
              </div>
            </div>
          `
            : this.paymentResult?.status === 'pending'
              ? html`
            <div class="pending-container">
              <div class="pending-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div class="pending-title">${this.config?.labels?.pendingTitle || 'Pago pendiente'}</div>
              <div class="pending-message">${this.config?.labels?.pendingMessage || 'Te notificaremos por correo electrónico una vez se complete el pago.'}</div>
              <div class="success-details">
                <div class="success-detail-row">
                  <span class="success-detail-label">ID de pago</span>
                  <span class="success-detail-value">${this.paymentResult.payment_id}</span>
                </div>
                <div class="success-detail-row">
                  <span class="success-detail-label">Referencia</span>
                  <span class="success-detail-value">${this.paymentResult.reference}</span>
                </div>
                <div class="success-detail-row">
                  <span class="success-detail-label">Monto</span>
                  <span class="success-detail-value">${this.formatAmount(this.paymentResult.amount, this.paymentResult.currency)}</span>
                </div>
              </div>
            </div>
          `
              : html`
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
                          .labels=${this.config?.labels?.card}
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
                <div class="secure-payment">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <span>${this.config?.labels?.securePaymentText || 'Pago seguro con encriptación SSL'}</span>
                </div>
              </div>
            `
            : ''
        }
        `
        }
      </div>
    `;
  }
}
