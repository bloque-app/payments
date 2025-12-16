import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { PaymentMethodType } from './types';
import { PAYMENT_METHODS } from './types';

export class PaymentMethodSelector extends LitElement {
  @property({ type: String })
  selectedMethod: PaymentMethodType | null = null;

  @property({ type: Array })
  availableMethods: PaymentMethodType[] = ['card', 'pse', 'cash'];

  static styles = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
    }

    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 500px;
      margin: 0 auto;
    }

    .payment-method {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: var(--bloque-border-radius, 8px);
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
    }

    .payment-method:hover {
      border-color: var(--bloque-primary-color, #4f46e5);
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.1);
    }

    .payment-method.selected {
      border-color: var(--bloque-primary-color, #4f46e5);
      background: color-mix(
        in srgb,
        var(--bloque-primary-color, #4f46e5) 8%,
        white
      );
    }

    .radio {
      width: 20px;
      height: 20px;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      margin-right: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .payment-method.selected .radio {
      border-color: var(--bloque-primary-color, #4f46e5);
    }

    .radio-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--bloque-primary-color, #4f46e5);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .payment-method.selected .radio-inner {
      opacity: 1;
    }

    .method-content {
      flex: 1;
    }

    .method-label {
      font-weight: 600;
      font-size: 16px;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .method-description {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .method-icon {
      width: 40px;
      height: 40px;
      margin-left: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
  `;

  private handleMethodSelect(method: PaymentMethodType) {
    this.selectedMethod = method;
    this.dispatchEvent(
      new CustomEvent('method-selected', {
        detail: { method },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getMethodIcon(type: PaymentMethodType): string {
    const icons = {
      card: '💳',
      pse: '🏦',
      cash: '💵',
    };
    return icons[type];
  }

  render() {
    return html`
      <div class="payment-methods">
        ${this.availableMethods.map((methodType) => {
          const method = PAYMENT_METHODS[methodType];
          const isSelected = this.selectedMethod === methodType;
          return html`
            <div
              class="payment-method ${isSelected ? 'selected' : ''}"
              @click=${() => this.handleMethodSelect(methodType)}
              role="radio"
              aria-checked=${isSelected}
              tabindex="0"
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this.handleMethodSelect(methodType);
                }
              }}
            >
              <div class="radio">
                <div class="radio-inner"></div>
              </div>
              <div class="method-content">
                <p class="method-label">${method.label}</p>
                <p class="method-description">${method.description}</p>
              </div>
              <div class="method-icon">${this.getMethodIcon(methodType)}</div>
            </div>
          `;
        })}
      </div>
    `;
  }
}
