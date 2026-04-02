# @bloque/payments-core

Core JavaScript library for integrating Bloque hosted checkout into any web application.

## Installation

```bash
pnpm install @bloque/payments-core
```

## Authentication

The checkout component accepts two browser-safe credentials:

| Option | Required | Description |
|--------|----------|-------------|
| `publishableKey` | Yes | Your `pk_test_*` / `pk_live_*` key — identifies the merchant |
| `clientSecret` | Recommended | A scoped JWT from `bloque.checkout.create()` — authorizes payment execution |

> `publicApiKey` is still accepted for backward compatibility but is deprecated in favor of `publishableKey`.

## Quick Start

```javascript
import { createCheckout } from '@bloque/payments-core';

const checkout = createCheckout({
  checkoutId: 'checkout_123abc',
  publishableKey: 'pk_test_...',
  clientSecret: 'eyJ...',       // from your backend
  container: '#checkout-container',
  onSuccess: (data) => {
    console.log('Payment successful!', data);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  },
});

// Later, cleanup
checkout.destroy();
```

## 3D Secure

When the hosted checkout triggers a 3DS challenge, the overlay is rendered at the **parent page** level (not inside the checkout iframe) via `postMessage`:

```javascript
const checkout = createCheckout({
  checkoutId: 'checkout_123abc',
  publishableKey: 'pk_test_...',
  clientSecret: 'eyJ...',
  container: '#checkout-container',
  threeDsAuthType: 'challenge_v2', // sandbox only
  onThreeDSChallenge: () => {
    console.log('3DS challenge overlay is visible');
  },
  onSuccess: (data) => console.log('ok', data),
  onError: (err) => console.error(err),
});
```

## Documentation

For complete documentation, examples, and API reference, visit:

**[https://docs.bloque.app/pay](https://docs.bloque.app/pay)**

## License

[MIT](../../LICENSE)
