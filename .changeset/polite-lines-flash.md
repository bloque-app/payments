---
"@bloque/payments": minor
---

- Add pre-filled `payeer` support on checkout creation. `PayeerInfo.name` is now optional; at least one of `name` or `email` is required when `payeer` is provided.
- Add `MerchantConfig` / `MerchantTheme` types and route `merchant`, `payment_methods`, and `payeer` through checkout metadata.
- Add `bloque.payments.cancelSubscription(paymentUrn)` and supporting `CancelDirectSubscriptionOutput` / `CancelSubscriptionStatus` types.
- Add `payout_route` on checkout creation.
- Document new HTTP 400 error codes surfaced via `APIError.code`:
  - `E_INVALID_PAYEER` — `payeer` provided with neither `name` nor `email`.
  - `E_PAYEE_EMAIL_MISMATCH` / `E_PAYEE_NAME_MISMATCH` — direct payment submission disagrees with the merchant's preset (email is case-insensitive, name is exact).
