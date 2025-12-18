import type {
  CardPaymentFormData,
  CashPaymentFormData,
  CreatePaymentParams,
  PaymentResponse,
  PaymentSubmitPayload,
  PSEPaymentFormData,
} from '@bloque/payments-core';
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
      case 'pse':
        return this.buildPSEPayload(payment.data);
      case 'cash':
        return this.buildCashPayload(payment.data);
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
}
