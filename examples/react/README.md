# React — Bloque Embedded Checkout Example

Minimal Rsbuild + React app demonstrating `@bloque/payments-react` with optional 3D Secure support.

## Setup

```bash
pnpm install
cp .env.example .env   # then edit with your keys
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PUBLIC_API_KEY` | yes | Your Bloque public API key (`pk_test_…`) |
| `VITE_CHECKOUT_ID` | yes | Checkout ID from your backend |
| `VITE_CHECKOUT_URL` | no | Custom hosted checkout URL (defaults to `https://payments.bloque.app/checkout`) |
| `VITE_THREE_DS_AUTH_TYPE` | no | Wompi 3DS sandbox scenario (e.g. `challenge_v2`) |

## Get started

```bash
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm preview      # preview production build
```

## 3D Secure sandbox

To test 3DS flows locally, set `VITE_THREE_DS_AUTH_TYPE` in `.env`:

```
VITE_THREE_DS_AUTH_TYPE=challenge_v2
```

This passes the scenario through to the SDK and triggers the 3DS overlay in the embedded checkout.
See the [Wompi 3DS v2 docs](https://docs.wompi.co/docs/colombia/transacciones-con-3d-secure-v2/) for all available values.
