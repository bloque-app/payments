import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

export interface PSEPaymentFormData {
  personType: 'natural' | 'juridica';
  documentType: string;
  documentNumber: string;
  bankCode: string;
  email: string;
}

interface Bank {
  code: string;
  name: string;
}

const BANKS: Bank[] = [
  { code: 'bancolombia', name: 'Bancolombia' },
  { code: 'banco_de_bogota', name: 'Banco de Bogotá' },
  { code: 'banco_davivienda', name: 'Davivienda' },
  { code: 'bbva', name: 'BBVA Colombia' },
  { code: 'banco_occidente', name: 'Banco de Occidente' },
  { code: 'banco_popular', name: 'Banco Popular' },
  { code: 'banco_av_villas', name: 'Banco AV Villas' },
  { code: 'colpatria', name: 'Scotiabank Colpatria' },
  { code: 'banco_caja_social', name: 'Banco Caja Social' },
  { code: 'banco_agrario', name: 'Banco Agrario' },
  { code: 'citibank', name: 'Citibank' },
  { code: 'banco_gnb_sudameris', name: 'Banco GNB Sudameris' },
  { code: 'itau', name: 'Itaú' },
  { code: 'bancoomeva', name: 'Bancoomeva' },
];

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PP', label: 'Pasaporte' },
];

export class PSEPaymentForm extends LitElement {
  @state()
  private formData: PSEPaymentFormData = {
    personType: 'natural',
    documentType: 'CC',
    documentNumber: '',
    bankCode: '',
    email: '',
  };

  @state()
  private errors: Partial<Record<keyof PSEPaymentFormData, string>> = {};

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

    .radio-group {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .radio-option input[type='radio'] {
      width: auto;
      margin-right: 8px;
      cursor: pointer;
    }

    .radio-option label {
      margin: 0;
      cursor: pointer;
      font-weight: 400;
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
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--bloque-border-radius, 6px);
      padding: 12px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #1e40af;
    }
  `;

  private handlePersonTypeChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.formData.personType = input.value as 'natural' | 'juridica';
    this.requestUpdate();
  }

  private handleInput(field: keyof PSEPaymentFormData, e: Event) {
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
    field: keyof PSEPaymentFormData,
    value: string,
  ): boolean {
    let error = '';

    switch (field) {
      case 'documentNumber':
        if (!value.trim()) error = 'El número de documento es requerido';
        else if (value.length < 5) error = 'Número de documento inválido';
        break;
      case 'bankCode':
        if (!value) error = 'Debe seleccionar un banco';
        break;
      case 'email':
        if (!value.trim()) error = 'El email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
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
    const fields: (keyof PSEPaymentFormData)[] = [
      'documentNumber',
      'bankCode',
      'email',
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
        detail: { data: this.formData, type: 'pse' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <form class="form-container" @submit=${this.handleSubmit}>
        <div class="info-box">
          🏦 Serás redirigido al portal de tu banco para completar el pago de
          forma segura.
        </div>

        <div class="form-group">
          <label>Tipo de persona</label>
          <div class="radio-group">
            <div class="radio-option">
              <input
                type="radio"
                id="natural"
                name="personType"
                value="natural"
                .checked=${this.formData.personType === 'natural'}
                @change=${this.handlePersonTypeChange}
              />
              <label for="natural">Persona Natural</label>
            </div>
            <div class="radio-option">
              <input
                type="radio"
                id="juridica"
                name="personType"
                value="juridica"
                .checked=${this.formData.personType === 'juridica'}
                @change=${this.handlePersonTypeChange}
              />
              <label for="juridica">Persona Jurídica</label>
            </div>
          </div>
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

        <div class="form-group">
          <label for="bankCode">Selecciona tu banco</label>
          <select
            id="bankCode"
            class=${this.errors.bankCode ? 'error' : ''}
            @change=${(e: Event) => this.handleInput('bankCode', e)}
          >
            <option value="">-- Selecciona un banco --</option>
            ${BANKS.map(
              (bank) => html`
                <option
                  value=${bank.code}
                  ?selected=${this.formData.bankCode === bank.code}
                >
                  ${bank.name}
                </option>
              `,
            )}
          </select>
          ${
            this.errors.bankCode
              ? html`<div class="error-message">${this.errors.bankCode}</div>`
              : ''
          }
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

        <button type="submit">Continuar al banco</button>
      </form>
    `;
  }
}
