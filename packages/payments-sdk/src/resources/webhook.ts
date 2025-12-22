import { createHmac } from 'node:crypto';

export interface WebhookVerifyOptions {
  secret: string;
}

export class WebhookResource {
  #secret: string;

  constructor(secret?: string) {
    this.#secret = secret || '';
  }

  /**
   * Verify the authenticity of a webhook payload using HMAC-SHA256
   *
   * @param body - The raw webhook body (string or object)
   * @param signature - The signature from the webhook header
   * @param options - Optional verification options
   * @returns True if the webhook is valid
   *
   * @example
   * ```typescript
   * const isValid = bloque.webhooks.verify(
   *   req.body,
   *   req.headers['x-bloque-signature'],
   *   { secret: process.env.WEBHOOK_SECRET }
   * );
   * ```
   */
  verify(
    body: string | Record<string, unknown>,
    signature: string,
    options?: WebhookVerifyOptions,
  ): boolean {
    const secret = options?.secret || this.#secret;

    if (!secret) {
      throw new Error(
        'Webhook secret is required. Pass it in options or set it during Bloque initialization.',
      );
    }

    if (!signature) {
      return false;
    }

    const payload = typeof body === 'string' ? body : JSON.stringify(body);

    const computedSignature = this.#computeSignature(payload, secret);

    return this.#secureCompare(signature, computedSignature);
  }

  setSecret(secret: string): void {
    this.#secret = secret;
  }

  #computeSignature(payload: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  #secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
