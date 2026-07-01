# @bloque/payments

## 0.2.1

### Patch Changes

- Rewire internal service dependencies and refresh the workspace lockfile so the
  `@bloque/payments`, `@bloque/payments-core`, and `@bloque/payments-react`
  packages resolve each other correctly at the published `0.2.x` versions.

## 0.2.0

### Minor Changes

- c616d99: added payout_route

### Patch Changes

- 8315a83: Add `single_use` support to checkout creation. When set, the payment link can only be used once; after it reaches a terminal state (paid or cancelled) the server rejects further payment attempts with `409 E_PAYMENT_LINK_CONSUMED`. The flag is exposed on `CheckoutParams`, forwarded on the create payload, and hoisted onto the returned `Checkout` from `metadata.single_use`.

## 0.1.4

### Patch Changes

- Fix checkout structures to map correctly status

## 0.1.3

### Patch Changes

- Upgrade the internal versions

## 0.1.2

### Patch Changes

- Upgrade the internal versions

## 0.1.1

### Patch Changes

- Upgrade the SDK endpoints
- Align with API new secret & public keys

## 0.1.0

### Minor Changes

- 04e497e: New api keys system and 3d secure

## 0.0.3

### Patch Changes

- adding method to verify webhooks and adding storybook
- Updated dependencies
  - @bloque/payments-core@0.0.3
