import type { Checkout } from '../types/checkout';
import type {
  CardPaymentFormData,
  CardPaymentPayload,
  CashPaymentFormData,
  CashPaymentPayload,
  CreatePaymentParams,
  PaymentResponse,
  PaymentSubmitPayload,
  PsePaymentFormData,
  PsePaymentPayload,
} from '../types/payment';
import { BaseResource } from './base';
import { toCheckout } from './checkout';

interface ServerDirectPaymentOutput {
  payment_id: string;
  status: 'approved' | 'rejected' | 'pending';
  message: string;
  amount: number;
  currency: string;
  reference?: string;
  checkout_url?: string;
  payment_code?: string;
  order_id?: string;
  order_status?: string;
  three_ds?: { current_step: string; iframe: string };
  created_at: string;
}

export class PaymentResource extends BaseResource {
  /**
   * Process a direct payment for an existing checkout.
   * Maps to `POST /:type` on the server with `payment_urn` in the body.
   *
   * @param params - Payment URN and payment data (card / PSE / cash).
   * @returns Payment response with status and type-specific fields.
   *
   * @example
   * ```typescript
   * const payment = await bloque.payments.create({
   *   paymentUrn: 'did:bloque:payments:abc123',
   *   payment: {
   *     type: 'card',
   *     data: {
   *       cardNumber: '4111111111111111',
   *       cardholderName: 'John Doe',
   *       expiryMonth: '12',
   *       expiryYear: '2025',
   *       cvv: '123',
   *       email: 'john@example.com',
   *       installments: 1,
   *       currency: 'COP',
   *     }
   *   }
   * });
   * ```
   */
  async create(params: CreatePaymentParams): Promise<PaymentResponse> {
    const paymentUrn = params.paymentUrn ?? params.checkoutId ?? '';
    const paymentPayload = this.buildPaymentPayload(params.payment, paymentUrn);

    const raw = await this.http.post<ServerDirectPaymentOutput>(
      `/${params.payment.type}`,
      paymentPayload,
    );

    return {
      id: raw.payment_id,
      object: 'payment',
      status: raw.status,
      message: raw.message,
      amount: raw.amount,
      currency: raw.currency,
      reference: raw.reference,
      checkout_url: raw.checkout_url,
      payment_code: raw.payment_code,
      order_id: raw.order_id,
      order_status: raw.order_status,
      three_ds: raw.three_ds,
      created_at: raw.created_at,
    };
  }

  /**
   * Fetch current checkout state by payment URN (e.g. `did:bloque:payments:uuid`).
   * Use while polling after a 3DS challenge to check if the payment has been
   * approved and the checkout moved to `paid`.
   */
  async getStatus(paymentId: string): Promise<Checkout> {
    const raw = await this.http.get<Record<string, any>>(`/${paymentId}`);
    return toCheckout(raw);
  }

  private buildPaymentPayload(
    payment: PaymentSubmitPayload,
    paymentUrn: string,
  ): Record<string, unknown> {
    switch (payment.type) {
      case 'card':
        return this.buildCardPayload(
          payment.data,
          paymentUrn,
        ) as unknown as Record<string, unknown>;
      case 'pse':
        return this.buildPsePayload(
          payment.data,
          paymentUrn,
        ) as unknown as Record<string, unknown>;
      case 'cash':
        return this.buildCashPayload(
          payment.data,
          paymentUrn,
        ) as unknown as Record<string, unknown>;
    }
  }

  private buildCardPayload(
    data: CardPaymentFormData,
    paymentUrn: string,
  ): CardPaymentPayload {
    const payload: CardPaymentPayload = {
      payment_urn: paymentUrn,
      number: data.cardNumber,
      cvc: data.cvv,
      exp_month: data.expiryMonth,
      exp_year: data.expiryYear,
      card_holder: data.cardholderName,
      installments: data.installments,
      currency: data.currency,
      payee: {
        name: data.cardholderName,
        email: data.email,
        ...(data.phone && { phone: data.phone }),
      },
    };

    if (data.webhookUrl) {
      payload.webhook_url = data.webhookUrl;
    }
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

  private buildPsePayload(
    data: PsePaymentFormData,
    paymentUrn: string,
  ): PsePaymentPayload {
    return {
      payment_urn: paymentUrn,
      person_type: data.personType,
      bank_code: data.bankCode,
      ...(data.webhookUrl && { webhook_url: data.webhookUrl }),
      payee: {
        email: data.email,
        id_type: data.documentType,
        id_number: data.documentNumber,
        name: data.name ?? '',
        phone: data.phone ?? '',
      },
    };
  }

  private buildCashPayload(
    data: CashPaymentFormData,
    paymentUrn: string,
  ): CashPaymentPayload {
    return {
      payment_urn: paymentUrn,
      ...(data.webhookUrl && { webhook_url: data.webhookUrl }),
      payee: {
        name: data.fullName,
        email: data.email,
        id_type: data.documentType,
        id_number: data.documentNumber,
        ...(data.phone && { phone: data.phone }),
      },
    };
  }
}
