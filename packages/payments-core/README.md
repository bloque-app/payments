# @bloque/payments-core

Core JavaScript library for integrating Bloque hosted checkout into any web application.

## Installation

```bash
pnpm install @bloque/payments-core
```

## Quick Start

```javascript
import { createCheckout } from '@bloque/payments-core';

// First, create a payment intent using @bloque/payments on your backend
// Then use the checkout_id to mount the checkout
const checkout = createCheckout({
  checkoutId: 'checkout_123abc',
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

## Documentation

For complete documentation, examples, and API reference, visit:

**[https://docs.bloque.app/pay](https://docs.bloque.app/pay)**

## License

[MIT](../../LICENSE)
