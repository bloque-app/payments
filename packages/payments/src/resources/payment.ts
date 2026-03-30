import type {
  CardPaymentFormData,
  CardPaymentPayload,
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

  /**
   * Fetch current payment status by payment URN (e.g. `did:bloque:payments:uuid`).
   * Use while polling after a 3DS challenge.
   */
  async getStatus(paymentId: string): Promise<PaymentResponse> {
    return this.http.get<PaymentResponse>(`/${paymentId}`);
  }

  private buildPaymentPayload(
    payment: PaymentSubmitPayload,
  ): Record<string, unknown> {
    switch (payment.type) {
      case 'card':
        return this.buildCardPayload(payment.data) as unknown as Record<
          string,
          unknown
        >;
    }
  }

  private buildCardPayload(data: CardPaymentFormData): CardPaymentPayload {
    const payload: CardPaymentPayload = {
      customer_email: data.email || '',
      number: data.cardNumber,
      cvc: data.cvv,
      exp_month: data.expiryMonth,
      exp_year: data.expiryYear,
      card_holder: data.cardholderName,
    };

    if (data.is_three_ds !== undefined) {
      payload.is_three_ds = data.is_three_ds;
    }
    if (data.browser_info !== undefined) {
      payload.browser_info = data.browser_info;
    }
    if (data.three_ds_auth_type !== undefined) {
      payload.three_ds_auth_type = data.three_ds_auth_type;
    }

    return payload;
  }
}
