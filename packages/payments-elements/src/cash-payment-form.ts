import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

export interface CashPaymentFormData {
  email: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
}

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' },
];

export class CashPaymentForm extends LitElement {
  @state()
  private formData: CashPaymentFormData = {
    email: '',
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
  };

  @state()
  private errors: Partial<Record<keyof CashPaymentFormData, string>> = {};

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

    input,
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: var(--bloque-border-radius, 6px);
      font-size: 15px;
      transition: all 0.2s ease;
      box-sizing: border-box;
      background: white;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--bloque-primary-color, #4f46e5);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--bloque-primary-color, #4f46e5) 10%, transparent);
    }

    input.error,
    select.error {
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

    .info-box {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: var(--bloque-border-radius, 6px);
      padding: 12px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #92400e;
    }

    .info-box strong {
      display: block;
      margin-bottom: 4px;
    }

    .info-list {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .info-list li {
      margin-bottom: 4px;
    }
  `;

  private handleInput(field: keyof CashPaymentFormData, e: Event) {
    const input = e.target as HTMLInputElement | HTMLSelectElement;
    this.formData = { ...this.formData, [field]: input.value };
    this.validateField(field, input.value);
  }

  private handleDocumentNumberInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.formData.documentNumber = value;
    input.value = value;
    this.validateField('documentNumber', value);
  }

  private validateField(
    field: keyof CashPaymentFormData,
    value: string,
  ): boolean {
    let error = '';

    switch (field) {
      case 'email':
        if (!value.trim()) error = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Email inválido';
        break;
      case 'documentNumber':
        if (!value.trim()) error = 'El número de documento es requerido';
        else if (value.length < 5) error = 'Número de documento inválido';
        break;
      case 'fullName':
        if (!value.trim()) error = 'El nombre completo es requerido';
        else if (value.trim().split(' ').length < 2)
          error = 'Ingresa tu nombre completo';
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
    const fields: (keyof CashPaymentFormData)[] = [
      'email',
      'documentNumber',
      'fullName',
    ];

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
        detail: { data: this.formData, type: 'cash' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <form class="form-container" @submit=${this.handleSubmit}>
        <div class="info-box">
          <strong>💵 Pago en efectivo</strong>
          <p style="margin: 4px 0">
            Genera un recibo de pago para realizar tu pago en:
          </p>
          <ul class="info-list">
            <li>Puntos Efecty</li>
            <li>Baloto</li>
            <li>Su Red</li>
            <li>Corresponsales bancarios</li>
          </ul>
        </div>

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

        <div class="form-group">
          <label for="fullName">Nombre completo</label>
          <input
            id="fullName"
            type="text"
            placeholder="Juan Pérez García"
            class=${this.errors.fullName ? 'error' : ''}
            @input=${(e: Event) => this.handleInput('fullName', e)}
            autocomplete="name"
          />
          ${
            this.errors.fullName
              ? html`<div class="error-message">${this.errors.fullName}</div>`
              : ''
          }
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="documentType">Tipo de documento</label>
            <select
              id="documentType"
              @change=${(e: Event) => this.handleInput('documentType', e)}
            >
              ${DOCUMENT_TYPES.map(
                (type) => html`
                  <option
                    value=${type.value}
                    ?selected=${this.formData.documentType === type.value}
                  >
                    ${type.label}
                  </option>
                `,
              )}
            </select>
          </div>

          <div class="form-group">
            <label for="documentNumber">Número de documento</label>
            <input
              id="documentNumber"
              type="text"
              placeholder="1234567890"
              class=${this.errors.documentNumber ? 'error' : ''}
              @input=${this.handleDocumentNumberInput}
            />
            ${
              this.errors.documentNumber
                ? html`<div class="error-message">
                  ${this.errors.documentNumber}
                </div>`
                : ''
            }
          </div>
        </div>

        <button type="submit">Generar recibo de pago</button>
      </form>
    `;
  }
}
