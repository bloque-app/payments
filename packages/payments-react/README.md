# @bloque/payments-react

React components for integrating Bloque hosted checkout into your React application.

## Installation

```bash
pnpm install @bloque/payments-react
```

## Quick Start

```tsx
import { BloqueCheckout } from '@bloque/payments-react';

function CheckoutPage() {
  return (
    <BloqueCheckout
      checkoutId="checkout_123abc"
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

## Documentation

For complete documentation, examples, and API reference, visit:

**[https://docs.bloque.app/pay](https://docs.bloque.app/pay)**

## License

[MIT](../../LICENSE)
