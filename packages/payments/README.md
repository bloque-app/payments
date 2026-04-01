# Bloque Payments SDK

Official TypeScript/JavaScript SDK for integrating Bloque payments.

## Installation

```bash
bun add @bloque/payments
```

## Authentication

The SDK supports a three-credential model:

| Credential | Prefix | Where | Purpose |
|------------|--------|-------|---------|
| **Secret key** | `sk_test_` / `sk_live_` | Server only | Exchanged for a short-lived JWT via `/origins/api-keys/exchange` |
| **Publishable key** | `pk_test_` / `pk_live_` | Browser | Identifies the merchant; read-only (view cart) |
| **Client secret** | JWT | Browser | Scoped JWT for a single checkout session (`checkout.pay`) |

### Initialize (recommended)

```ts
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  mode: 'sandbox',
  secretKey: process.env.BLOQUE_SECRET_KEY!,
  webhookSecret: process.env.BLOQUE_WEBHOOK_SECRET, // optional
});
```

The SDK automatically exchanges the secret key for a JWT and caches it (with refresh 1 min before expiry).

### Initialize (legacy)

```ts
const bloque = new Bloque({
  mode: 'sandbox',
  accessToken: process.env.BLOQUE_ACCESS_TOKEN!, // deprecated — use secretKey
});
```

## Quick Start: Create Checkout

```ts
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  mode: 'sandbox',
  secretKey: process.env.BLOQUE_SECRET_KEY!,
});

const checkout = await bloque.checkout.create({
  name: 'Pack Profesional de Productividad',
  description:
    'Periféricos premium para trabajo intensivo y alto rendimiento',
  asset: 'COPM/2',
  image_url: 'https://cdn.bloque.app/checkouts/productivity-pack.png',
  items: [
    {
      name: 'Teclado mecánico Keychron K2',
      description: 'Wireless, RGB, switches Blue',
      amount: 450_000_00,
      quantity: 2,
      image_url: 'https://cdn.bloque.app/items/keychron-k2.png',
    },
    {
      name: 'Mouse Logitech MX Master 3S',
      description: 'Inalámbrico, sensor 8K DPI',
      amount: 380_000_00,
      quantity: 1,
      image_url: 'https://cdn.bloque.app/items/mx-master-3s.png',
    },
  ],
  success_url: 'https://bloque.app/success',
  cancel_url: 'https://bloque.app/cancel',
});

console.log('Checkout URL:', checkout.url);
```

## API

### `Bloque` config

```ts
type BloqueConfig = {
  mode: 'sandbox' | 'production';
  secretKey: string;        // sk_test_... or sk_live_...
  timeout?: number;         // request timeout in ms (default 10_000)
  maxRetries?: number;      // retry count (default 2)
  webhookSecret?: string;
};

/** @deprecated Use BloqueConfig with secretKey instead */
type BloqueConfigLegacy = {
  mode: 'sandbox' | 'production';
  accessToken: string;
  timeout?: number;
  maxRetries?: number;
  webhookSecret?: string;
};
```

### Checkout

#### `bloque.checkout.create(params)`

```ts
type CheckoutParams = {
  name: string;
  description?: string;
  image_url?: string;
  asset?: 'COPM/2' | 'DUSD/6';
  items: {
    name: string;
    description?: string;
    amount: number;
    quantity: number;
    image_url?: string;
  }[];
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string | number | boolean>;
  expires_at?: string;
};
```

Notes:
- `asset` defaults to `DUSD/6` when omitted.
- Creation request is sent using `redirect_url` derived from `success_url`.

Response shape:

```ts
type Checkout = {
  id: string;
  urn: string;
  object: 'checkout';
  url: string;
  client_secret: string;   // scoped JWT for browser-side checkout
  status: 'pending' | 'completed' | 'expired' | 'canceled';
  amount_total: number;
  amount_subtotal: number;
  asset: 'COPM/2' | 'DUSD/6';
  items: {
    name: string;
    description?: string;
    amount: number;
    quantity: number;
    image_url?: string;
  }[];
  metadata?: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};
```

Pass the `client_secret` to `@bloque/payments-core` or `@bloque/payments-react` on the browser to authorize payment execution.

#### `bloque.checkout.retrieve(checkoutId)`

```ts
const checkout = await bloque.checkout.retrieve('checkout_123');
```

#### `bloque.checkout.cancel(checkoutId)`

```ts
const checkout = await bloque.checkout.cancel('checkout_123');
```

### Payments

#### `bloque.payments.create(params)`

Current supported submit payload is card:

```ts
const payment = await bloque.payments.create({
  checkoutId: 'checkout_123',
  payment: {
    type: 'card',
    data: {
      cardNumber: '4111111111111111',
      cardholderName: 'John Doe',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123',
      email: 'john@example.com',
    },
  },
});
```

Payment response:

```ts
type PaymentResponse = {
  id: string;
  object: 'payment';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  three_ds?: { current_step: string; iframe: string };
};
```

#### `bloque.payments.getStatus(paymentId)`

Poll payment status by URN (e.g. `did:bloque:payments:...`) after a 3DS challenge.

```ts
const latest = await bloque.payments.getStatus(payment.id);
```

### 3D Secure (direct API)

When you process card payments server-side with 3DS, pass browser fingerprint fields and optional sandbox scenario:

```ts
import type { BrowserInfo } from '@bloque/payments';

function browserInfoFromRequest(req: {
  headers: Record<string, string | string[] | undefined>;
}): BrowserInfo {
  const ua = String(req.headers['user-agent'] ?? '');
  const accept = String(req.headers['accept'] ?? '*/*');
  const lang = String(req.headers['accept-language'] ?? 'en');
  return {
    browser_user_agent: ua,
    browser_language: lang,
    browser_color_depth: '24',
    browser_screen_height: '900',
    browser_screen_width: '1440',
    browser_tz: '0',
  };
}

const payment = await bloque.payments.create({
  checkoutId: 'checkout_123',
  payment: {
    type: 'card',
    data: {
      cardNumber: '4111111111111111',
      cardholderName: 'John Doe',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123',
      email: 'john@example.com',
      is_three_ds: true,
      browser_info: browserInfoFromRequest(req),
      three_ds_auth_type: 'challenge_v2', // sandbox only; omit in production
    },
  },
});

if (payment.three_ds?.iframe) {
  // 1) Decode HTML entities if the gateway returns escaped HTML
  // 2) If iframe is a URL (https://...), use <iframe src="...">
  // 3) Otherwise use <iframe srcdoc={decodedHtml}> with sandbox allow-scripts allow-forms allow-popups
  // 4) Show Mastercard ID Check branding before/around the challenge where required
  // 5) Poll until terminal state:
  let status = payment.status;
  while (status === 'pending' || status === 'processing') {
    await new Promise((r) => setTimeout(r, 3000));
    const next = await bloque.payments.getStatus(payment.id);
    status = next.status;
  }
}
```

Field names for `BrowserInfo` match the Bloque Payments API (`browser_user_agent`, `browser_language`, etc.).

### Webhooks

Verify webhook signature (`HMAC-SHA256`):

```ts
const isValid = bloque.webhooks.verify(
  rawBody,
  signature,
  { secret: process.env.BLOQUE_WEBHOOK_SECRET! },
);
```

You can also set `webhookSecret` during `Bloque` initialization and omit `options` in `verify`.

## Example

Full example available at:
- `examples/basic-checkout.ts`
