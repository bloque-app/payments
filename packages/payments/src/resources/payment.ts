import type {
  CardPaymentFormData,
  CreatePaymentParams,
  PaymentResponse,
  PaymentSubmitPayload,
} from '../types/payment';
import { BaseResource } from './base';

export class PaymentResource extends BaseResource {
  /**
   * Create a payment for an existing checkout session
   *
   * @param params - Checkout ID and payment data
   * @returns Payment response
   *
   * @example
   * ```typescript
   * const payment = await bloque.payments.create({
   *   checkoutId: 'checkout_abc123',
   *   payment: {
   *     type: 'card',
   *     data: {
   *       cardNumber: '4111111111111111',
   *       cardholderName: 'John Doe',
   *       expiryMonth: '12',
   *       expiryYear: '2025',
   *       cvv: '123',
   *       email: 'john@example.com'
   *     }
   *   }
   * });
   * ```
   */
  async create(params: CreatePaymentParams): Promise<PaymentResponse> {
    const paymentPayload = this.buildPaymentPayload(params.payment);

    const paymentResponse = await this.http.post<PaymentResponse>(
      `/checkout/${params.checkoutId}/pay/${params.payment.type}`,
      paymentPayload,
    );

    return paymentResponse;
  }

  private buildPaymentPayload(
    payment: PaymentSubmitPayload,
  ): Record<string, unknown> {
    switch (payment.type) {
      case 'card':
        return this.buildCardPayload(payment.data);
    }
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
}
