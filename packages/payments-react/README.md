# @bloque/payments-react

React component that embeds the Bloque hosted checkout.

## Live Demo

Try the hosted example at [https://bloque-example-payments.pages.dev/](https://bloque-example-payments.pages.dev/).

## Installation

```bash
# Using bun
bun add @bloque/payments-react

# Using pnpm
pnpm add @bloque/payments-react

# Using npm
npm install @bloque/payments-react

# Using yarn
yarn add @bloque/payments-react
```

## Usage

### How it Works

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│ React Component │─────▶│  Your Backend   │─────▶│  Bloque API  │
│  (Frontend)     │      │   (SDK Usage)   │      │              │
└─────────────────┘      └─────────────────┘      └──────────────┘
```

1. **React Component** captures payment data from user
2. **`onSubmit`** sends complete `PaymentSubmitPayload` to your backend
3. **Your Backend** uses `@bloque/payments` to process the payment

### Basic Example

```tsx
import { BloqueCheckout } from '@bloque/payments-react';
import type { PaymentSubmitPayload } from '@bloque/payments-react';

function App() {
  const handleSubmit = async (payload: PaymentSubmitPayload) => {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Payment failed');
    }

    return response.json();
  };

  return (
    <BloqueCheckout
      onSubmit={handleSubmit}
      requireEmail={true}
    />
  );
}
```

**Your Backend (using `@bloque/payments`):**

```typescript
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  apiKey: process.env.BLOQUE_API_KEY!,
  mode: 'production',
});

app.post('/api/payments', async (req, res) => {
  const payload = req.body;

  const payment = await bloque.payments.create({
    payment: payload,
  });

  res.json(payment);
});
```

### With Configuration and Appearance

```tsx
import { BloqueCheckout } from '@bloque/payments-react';
import type {
  CheckoutConfig,
  AppearanceConfig,
  PaymentSubmitPayload,
} from '@bloque/payments-react';

function CheckoutPage() {
  const config: CheckoutConfig = {
    payment_methods: ['card', 'pse'],
    amount: 120_000,
    currency: 'COP',
  };

  const appearance: AppearanceConfig = {
    primaryColor: '#10b981',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const handleSubmit = async (payload: PaymentSubmitPayload) => {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Payment failed');
    }

    return response.json();
  };

  const handleSuccess = (event: CustomEvent<PaymentSubmitPayload>) => {
    console.log('Payment successful!', event.detail);
    window.location.href = '/success';
  };

  const handleError = (event: CustomEvent<PaymentSubmitPayload & { error: string }>) => {
    console.error('Payment failed:', event.detail.error);
  };

  return (
    <BloqueCheckout
      config={config}
      appearance={appearance}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### With Custom Styling

```tsx
import { BloqueCheckout } from '@bloque/payments-react';

function App() {
  return (
    <div className="checkout-container">
      <BloqueCheckout
        onSubmit={handleSubmit}
        className="custom-checkout"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      />
    </div>
  );
}
```

## Props

### `BloqueCheckout`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `CheckoutConfig` | `undefined` | Configuration object from backend SDK |
| `appearance` | `AppearanceConfig` | `undefined` | Appearance customization |
| `amount` | `number` | `undefined` | Payment amount (can also be set via `config.amount`) |
| `availableMethods` | `PaymentMethodType[]` | `['card', 'pse', 'cash']` | Available payment methods |
| `requireEmail` | `boolean` | `true` | Whether email is required for card payments |
| `showMethodSelector` | `boolean` | `true` | Whether to show the payment method selector |
| `onSubmit` | `function` | `undefined` | Function called when user submits payment |
| `onSuccess` | `function` | `undefined` | Event handler for successful payment |
| `onError` | `function` | `undefined` | Event handler for payment errors |
| `className` | `string` | `undefined` | CSS class name |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |

### `CheckoutConfig`

```typescript
interface CheckoutConfig {
  payment_methods?: PaymentMethodType[];
  amount?: number;
  currency?: string;
}
```

### `AppearanceConfig`

```typescript
interface AppearanceConfig {
  primaryColor?: string;
  borderRadius?: string;
  fontFamily?: string;
}
```

## TypeScript

The package includes full TypeScript definitions with discriminated union types for type safety:

```typescript
import type {
  BloqueCheckoutProps,
  PaymentSubmitPayload,
  CheckoutConfig,
  AppearanceConfig,
} from '@bloque/payments-react';

// PaymentSubmitPayload is a discriminated union type
// TypeScript automatically narrows the type based on the 'type' field
const handleSubmit = async (payload: PaymentSubmitPayload) => {
  // Type narrowing example
  switch (payload.type) {
    case 'card':
      // payload.data is CardPaymentFormData
      console.log('Card ending in:', payload.data.cardNumber.slice(-4));
      break;
    case 'pse':
      // payload.data is PSEPaymentFormData
      console.log('Bank:', payload.data.bankCode);
      break;
    case 'cash':
      // payload.data is CashPaymentFormData
      console.log('Name:', payload.data.fullName);
      break;
  }

  // Send complete payload to your backend
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.json();
};
```

## Events

### `onSubmit`

Called when the user submits a payment form. Send the complete payload to your backend, which will use `@bloque/payments` to process the payment.

```typescript
onSubmit?: (payload: PaymentSubmitPayload) => Promise<void>;
```

**Example:**
```typescript
const handleSubmit = async (payload: PaymentSubmitPayload) => {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Payment failed');
  return response.json();
};
```

**Type definition:**
```typescript
type PaymentSubmitPayload =
  | { type: 'card'; data: CardPaymentFormData }
  | { type: 'pse'; data: PSEPaymentFormData }
  | { type: 'cash'; data: CashPaymentFormData };
```

**Your backend should:**
```typescript
import { Bloque } from '@bloque/payments';

const bloque = new Bloque({
  apiKey: process.env.BLOQUE_API_KEY!,
  mode: 'production',
});

app.post('/api/payments', async (req, res) => {
  const payload = req.body;

  const payment = await bloque.payments.create({
    payment: payload,
  });

  res.json(payment);
});
```

### `onSuccess`

Fired when the payment is successfully processed.

```typescript
onSuccess?: (event: CustomEvent<PaymentSubmitPayload>) => void;
```

### `onError`

Fired when payment processing fails.

```typescript
onError?: (event: CustomEvent<PaymentSubmitPayload & { error: string }>) => void;
```

## Payment Methods

- **Card** - Credit and debit card payments
- **PSE** - Colombian online banking system
- **Cash** - Generate receipt for cash payment at physical locations

## License

[MIT](../../LICENSE)
