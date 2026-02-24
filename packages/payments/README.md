# Bloque Payments SDK

Official TypeScript/JavaScript SDK for integrating Bloque payments.

## Installation

```bash
bun add @bloque/payments
```

## Initialize

```ts
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  mode: 'sandbox', // 'sandbox' | 'production'
  accessToken: process.env.BLOQUE_ACCESS_TOKEN!,
  webhookSecret: process.env.BLOQUE_WEBHOOK_SECRET, // optional
});
```

## Quick Start: Create Checkout

```ts
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  mode: 'sandbox',
  accessToken: process.env.BLOQUE_ACCESS_TOKEN!,
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
  object: 'checkout';
  url: string;
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
};
```

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
