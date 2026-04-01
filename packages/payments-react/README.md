# @bloque/payments-react

React components for integrating Bloque hosted checkout into your React application.

## Installation

```bash
pnpm install @bloque/payments-react
```

## Authentication

| Prop | Required | Description |
|------|----------|-------------|
| `publishableKey` | Yes | `pk_test_*` / `pk_live_*` — identifies the merchant (browser-safe) |
| `clientSecret` | Recommended | Scoped JWT from `bloque.checkout.create()` — authorizes payment execution |

> `publicApiKey` is still accepted for backward compatibility but is deprecated.

## Quick Start

```tsx
import { BloqueCheckout } from '@bloque/payments-react';

function CheckoutPage({ checkoutId, clientSecret }) {
  return (
    <BloqueCheckout
      checkoutId={checkoutId}
      publishableKey="pk_test_..."
      clientSecret={clientSecret}
      onSuccess={(data) => {
        console.log('Payment successful!', data);
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

## 3D Secure (embedded checkout)

The hosted checkout can return a 3DS challenge. `@bloque/payments-core` / React show the challenge in a **parent-page overlay** (not inside the checkout iframe) via `postMessage`.

- Pass **`threeDsAuthType`** (sandbox only, e.g. `challenge_v2`) to drive Wompi sandbox scenarios.
- Optional **`onThreeDSChallenge`** runs when the overlay opens.

```tsx
<BloqueCheckout
  checkoutId="checkout_123abc"
  publishableKey="pk_test_..."
  clientSecret={clientSecret}
  threeDsAuthType="challenge_v2"
  onThreeDSChallenge={() => console.log('3DS started')}
  onSuccess={(data) => console.log('ok', data)}
  onError={(err) => console.error(err)}
/>
```

## Documentation

For complete documentation, examples, and API reference, visit:

**[https://docs.bloque.app/pay](https://docs.bloque.app/pay)**

## License

[MIT](../../LICENSE)
