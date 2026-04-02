# Bloque Payments SDK — Examples

| Example | Description | Path |
|---------|-------------|------|
| **basic-checkout** | Create a hosted checkout link (server SDK) | [`basic-checkout.ts`](basic-checkout.ts) |
| **direct-card-payment-3ds** | Card payment with 3D Secure + status polling (server SDK) | [`direct-card-payment-3ds.example.ts`](direct-card-payment-3ds.example.ts) |
| **react** | Embedded checkout with `@bloque/payments-react` (Rsbuild) | [`react/`](react/) |
| **hono-react** | Full-stack: Hono API backend + React frontend | [`hono-react/`](hono-react/) |

## Authentication

The SDK uses a three-credential model:

| Credential | Env Variable | Where | Purpose |
|------------|-------------|-------|---------|
| **Secret key** (`sk_*`) | `BLOQUE_SECRET_KEY` | Server only | Auto-exchanged for a JWT by the SDK |
| **Publishable key** (`pk_*`) | `VITE_PUBLISHABLE_KEY` | Browser | Identifies the merchant (read-only) |
| **Client secret** (JWT) | `VITE_CLIENT_SECRET` | Browser | Scoped checkout session token (`checkout.pay`) |

Server-side examples use `BLOQUE_SECRET_KEY`. Browser examples use `VITE_PUBLISHABLE_KEY` and optionally `VITE_CLIENT_SECRET`.

> `accessToken` and `VITE_PUBLIC_API_KEY` are still accepted for backward compatibility but are deprecated.

## Quick start

```bash
# Server-side scripts
BLOQUE_SECRET_KEY=sk_test_... BLOQUE_CHECKOUT_ID=... npx tsx examples/basic-checkout.ts

# React embedded checkout
cd examples/react
cp .env.example .env    # fill in your keys
pnpm install && pnpm dev

# Hono + React
cd examples/hono-react/api && pnpm install && pnpm dev   # API on :8787
cd examples/hono-react/web && pnpm install && pnpm dev   # Web on :3000
```

## 3D Secure sandbox

Set `VITE_THREE_DS_AUTH_TYPE` in the React examples (or `BLOQUE_THREE_DS_AUTH_TYPE` for server scripts) to one of these Wompi sandbox scenarios:

| Value | Behavior |
|-------|----------|
| `challenge_v2` | Shows 3DS challenge iframe |
| `no_challenge_success` | Frictionless success |
| `challenge_denied` | Frictionless denied |
| `supported_version_error` | Card version not supported |
| `authentication_error` | Authentication fails |

See the [Wompi 3DS v2 docs](https://docs.wompi.co/docs/colombia/transacciones-con-3d-secure-v2/) for full details.
