# Bloque Payments SDK

The official TypeScript/JavaScript SDK for integrating [Bloque](https://www.bloque.app) payments into your applications.

## Features

- **TypeScript First**: Built with TypeScript for complete type safety
- **Simple API**: Intuitive interface for creating and managing checkouts
- **Multiple Payment Methods**: Support for cards, PSE, and cash payments
- **Fully Async**: Promise-based API for modern JavaScript workflows
- **Lightweight**: Minimal dependencies for optimal bundle size

## Installation

```bash
bun add @bloque/payments-sdk
```

## Quick Start

```typescript
import { Bloque } from '@bloque/payments-sdk';

// Initialize the SDK
const bloque = new Bloque({
  apiKey: 'your-api-key-here',
  server: 'sandbox', // or 'production'
});

// Create a checkout session
const checkout = await bloque.checkout.create({
  name: 'Online Course Purchase',
  description: 'Complete React Development Course',
  items: [
    {
      name: 'React Course',
      amount: 99_00, // Amount in cents (USD)
      quantity: 1,
    },
  ],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
});

// Redirect user to checkout
console.log('Checkout URL:', checkout.url);
```

## Configuration

### Initialize the SDK

```typescript
import { Bloque } from '@bloque/payments-sdk';

const bloque = new Bloque({
  apiKey: 'your-api-key-here',    // Required: Your Bloque API key
  server: 'sandbox',               // Required: 'sandbox' or 'production'
});
```

### Environment Options

- **`sandbox`**: For testing and development
- **`production`**: For live payments

## API Reference

### Checkout

The checkout resource allows you to create payment sessions.

#### Create a Checkout

```typescript
const checkout = await bloque.checkout.create({
  name: string;              // Required: Name of the checkout
  description?: string;      // Optional: Description
  image_url?: string;        // Optional: Product/checkout image URL
  items: CheckoutItem[];     // Required: Items to be purchased
  success_url: string;       // Required: Redirect URL after success
  cancel_url: string;        // Required: Redirect URL after cancellation
  metadata?: Record<string, string | number | boolean>; // Optional: Custom metadata
  expires_at?: string;       // Optional: Expiration date (ISO 8601)
});
```

**Checkout Item**:
```typescript
{
  name: string;        // Item name
  amount: number;      // Price in smallest currency unit (e.g., cents)
  quantity: number;    // Quantity
  image_url?: string;  // Item image URL
}
```

#### Checkout Response

```typescript
{
  id: string;                // Unique checkout identifier
  object: 'checkout';        // Object type
  url: string;               // Public payment URL for the customer
  status: string;            // Current checkout status
  amount_total: number;      // Total amount
  amount_subtotal: number;   // Subtotal amount
  currency: 'USD';           // Currency
  items: CheckoutItem[];     // Items in the checkout
  metadata?: Metadata;       // Custom metadata
  created_at: string;        // Creation timestamp (ISO 8601)
  updated_at: string;        // Last update timestamp (ISO 8601)
  expires_at: string;        // Expiration timestamp (ISO 8601)
}
```

## Examples

### Basic Checkout with Single Item

```typescript
const checkout = await bloque.checkout.create({
  name: 'E-book Purchase',
  description: 'Learn TypeScript in 30 Days',
  items: [
    {
      name: 'TypeScript E-book',
      amount: 19_99,
      quantity: 1,
    },
  ],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
});
```

### Checkout with Multiple Items

```typescript
const checkout = await bloque.checkout.create({
  name: 'Shopping Cart',
  description: 'Your selected items',
  items: [
    {
      name: 'Wireless Mouse',
      amount: 25_00,
      quantity: 1,
      image_url: 'https://example.com/mouse.jpg',
    },
    {
      name: 'USB Cable',
      amount: 10_00,
      quantity: 2,
      image_url: 'https://example.com/cable.jpg',
    },
  ],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
});
```

### Checkout with Metadata and Expiration

```typescript
const checkout = await bloque.checkout.create({
  name: 'Limited Time Offer',
  items: [
    {
      name: 'Premium Course',
      amount: 99_00,
      quantity: 1,
    },
  ],
  success_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
  metadata: {
    user_id: '12345',
    campaign: 'summer_sale',
    discount_applied: true,
  },
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
});
```


## Error Handling

The SDK uses standard JavaScript errors. Always wrap API calls in try-catch blocks:

```typescript
try {
  const checkout = await bloque.checkout.create({
    name: 'Product',
    items: [{ name: 'Item', amount: 1000, quantity: 1 }],
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/cancel',
  });
} catch (error) {
  console.error('Failed to create checkout:', error);
}
```

## TypeScript Support

This SDK is written in TypeScript and includes complete type definitions. You'll get full autocomplete and type checking when using TypeScript or modern editors like VS Code:

```typescript
import type { Checkout, CheckoutStatus, CheckoutItem } from '@bloque/payments-sdk';

const item: CheckoutItem = {
  name: 'Product',
  amount: 5000,
  quantity: 1,
};
```

## Development

### Building the SDK

```bash
bun install
bun run build
```

### Development Mode (Watch)

```bash
bun run dev
```

### Type Checking

```bash
bun run typecheck
```

### Code Quality

```bash
bun run check
```

## Requirements

- Node.js 22.x or higher / Bun 1.x or higher
- TypeScript 5.x or higher (for TypeScript projects)

## Links

- [Homepage](https://www.bloque.app)
- [GitHub Repository](https://github.com/bloque-app/bloque-payments)
- [Issue Tracker](https://github.com/bloque-app/bloque-payments/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.
