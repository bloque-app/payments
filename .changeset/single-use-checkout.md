---
"@bloque/payments": patch
---

Add `single_use` support to checkout creation. When set, the payment link can only be used once; after it reaches a terminal state (paid or cancelled) the server rejects further payment attempts with `409 E_PAYMENT_LINK_CONSUMED`. The flag is exposed on `CheckoutParams`, forwarded on the create payload, and hoisted onto the returned `Checkout` from `metadata.single_use`.
