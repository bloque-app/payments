import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

export interface CardPaymentFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  email: string;
}

export class CardPaymentForm extends LitElement {
  @state()
  private formData: CardPaymentFormData = {
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    email: '',
  };

  @state()
  private errors: Partial<Record<keyof CardPaymentFormData, string>> = {};

  @property({ type: Boolean })
  requireEmail = false;

  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
    }

    .form-container {
      max-width: 500px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: var(--bloque-border-radius, 6px);
      font-size: 15px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: var(--bloque-primary-color, #4f46e5);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--bloque-primary-color, #4f46e5) 10%, transparent);
    }

    input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 13px;
      margin-top: 4px;
    }

    button {
      width: 100%;
      padding: 12px;
      background: var(--bloque-primary-color, #4f46e5);
      color: white;
      border: none;
      border-radius: var(--bloque-border-radius, 6px);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      margin-top: 8px;
    }

    button:hover {
      background: color-mix(
        in srgb,
        var(--bloque-primary-color, #4f46e5) 90%,
        black
      );
    }

    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .card-brand {
      font-size: 24px;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
    }

    .input-wrapper {
      position: relative;
    }
  `;

  private formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }

  private detectCardBrand(number: string): string {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return '💳'; // Visa
    if (cleaned.startsWith('5') && cleaned[1] >= '1' && cleaned[1] <= '5')
      return '💳'; // Mastercard
    if (cleaned.startsWith('3') && (cleaned[1] === '4' || cleaned[1] === '7'))
      return '💳'; // Amex
    return '';
  }

  private handleCardNumberInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '');
    this.formData.cardNumber = cleaned;
    input.value = this.formatCardNumber(cleaned.slice(0, 16));
    this.validateField('cardNumber', cleaned);
  }

  private handleExpiryInput(field: 'expiryMonth' | 'expiryYear', e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.formData[field] = value;
    this.validateField(field, value);
  }

  private handleCvvInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 4);
    this.formData.cvv = value;
    input.value = value;
    this.validateField('cvv', value);
  }

  private handleInput(field: keyof CardPaymentFormData, e: Event) {
    const input = e.target as HTMLInputElement;
    this.formData[field] = input.value;
    this.validateField(field, input.value);
  }

  private validateField(
    field: keyof CardPaymentFormData,
    value: string,
  ): boolean {
    let error = '';

    switch (field) {
      case 'cardNumber':
        if (!value) error = 'El número de tarjeta es requerido';
        else if (value.length < 13) error = 'Número de tarjeta inválido';
        break;
      case 'cardholderName':
        if (!value.trim()) error = 'El nombre del titular es requerido';
        break;
      case 'expiryMonth': {
        const month = Number.parseInt(value, 10);
        if (!value) error = 'Requerido';
        else if (month < 1 || month > 12) error = 'Mes inválido';
        break;
      }
      case 'expiryYear': {
        const year = Number.parseInt(value, 10);
        const currentYear = new Date().getFullYear() % 100;
        if (!value) error = 'Requerido';
        else if (year < currentYear) error = 'Año inválido';
        break;
      }
      case 'cvv':
        if (!value) error = 'CVV requerido';
        else if (value.length < 3) error = 'CVV inválido';
        break;
      case 'email':
        if (this.requireEmail && !value) error = 'Email requerido';
        else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Email inválido';
        break;
    }

    if (error) {
      this.errors = { ...this.errors, [field]: error };
    } else {
      const { [field]: _, ...rest } = this.errors;
      this.errors = rest;
    }

    return !error;
  }

  private validateForm(): boolean {
    const fields: (keyof CardPaymentFormData)[] = [
      'cardNumber',
      'cardholderName',
      'expiryMonth',
      'expiryYear',
      'cvv',
    ];
    if (this.requireEmail) fields.push('email');

    let isValid = true;
    for (const field of fields) {
      if (!this.validateField(field, this.formData[field] || '')) {
        isValid = false;
      }
    }
    return isValid;
  }

  private handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.requestUpdate();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('payment-submitted', {
        detail: { data: this.formData, type: 'card' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <form class="form-container" @submit=${this.handleSubmit}>
        <div class="form-group">
          <label for="cardNumber">Número de tarjeta</label>
          <div class="input-wrapper">
            <input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class=${this.errors.cardNumber ? 'error' : ''}
              @input=${this.handleCardNumberInput}
              autocomplete="cc-number"
            />
            ${
              this.detectCardBrand(this.formData.cardNumber)
                ? html`<span class="card-brand">
                  ${this.detectCardBrand(this.formData.cardNumber)}
                </span>`
                : ''
            }
          </div>
          ${
            this.errors.cardNumber
              ? html`<div class="error-message">${this.errors.cardNumber}</div>`
              : ''
          }
        </div>

        <div class="form-group">
          <label for="cardholderName">Nombre del titular</label>
          <input
            id="cardholderName"
            type="text"
            placeholder="NOMBRE COMPLETO"
            class=${this.errors.cardholderName ? 'error' : ''}
            @input=${(e: Event) => this.handleInput('cardholderName', e)}
            autocomplete="cc-name"
            style="text-transform: uppercase"
          />
          ${
            this.errors.cardholderName
              ? html`<div class="error-message">
                ${this.errors.cardholderName}
              </div>`
              : ''
          }
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expiryMonth">Mes</label>
            <input
              id="expiryMonth"
              type="text"
              placeholder="MM"
              maxlength="2"
              class=${this.errors.expiryMonth ? 'error' : ''}
              @input=${(e: Event) => this.handleExpiryInput('expiryMonth', e)}
              autocomplete="cc-exp-month"
            />
            ${
              this.errors.expiryMonth
                ? html`<div class="error-message">
                  ${this.errors.expiryMonth}
                </div>`
                : ''
            }
          </div>

          <div class="form-group">
            <label for="expiryYear">Año</label>
            <input
              id="expiryYear"
              type="text"
              placeholder="AA"
              maxlength="2"
              class=${this.errors.expiryYear ? 'error' : ''}
              @input=${(e: Event) => this.handleExpiryInput('expiryYear', e)}
              autocomplete="cc-exp-year"
            />
            ${
              this.errors.expiryYear
                ? html`<div class="error-message">${this.errors.expiryYear}</div>`
                : ''
            }
          </div>
        </div>

        <div class="form-group">
          <label for="cvv">CVV</label>
          <input
            id="cvv"
            type="text"
            placeholder="123"
            maxlength="4"
            class=${this.errors.cvv ? 'error' : ''}
            @input=${this.handleCvvInput}
            autocomplete="cc-csc"
          />
          ${
            this.errors.cvv
              ? html`<div class="error-message">${this.errors.cvv}</div>`
              : ''
          }
        </div>

        ${
          this.requireEmail
            ? html`
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  class=${this.errors.email ? 'error' : ''}
                  @input=${(e: Event) => this.handleInput('email', e)}
                  autocomplete="email"
                />
                ${
                  this.errors.email
                    ? html`<div class="error-message">${this.errors.email}</div>`
                    : ''
                }
              </div>
            `
            : ''
        }

        <button type="submit">Pagar</button>
      </form>
    `;
  }
}
