# Hono + React — Bloque Checkout Example

Full-stack example: a Hono API backend creates checkouts, and a React frontend embeds `@bloque/payments-react`.

## Structure

```
hono-react/
├── api/        # Hono backend (creates payment intents)
└── web/        # Rsbuild React frontend (embedded checkout)
```

## Running

Start both in separate terminals:

```bash
# 1. API server (port 8787)
cd api
pnpm install
pnpm dev

# 2. React frontend (port 3000)
cd web
pnpm install
cp .env.example .env   # then edit with your keys
pnpm dev
```

The frontend creates a checkout via the API, then renders the embedded payment form.

## Environment variables (web)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PUBLIC_API_KEY` | no | Overrides the hardcoded public key |
| `VITE_CHECKOUT_URL` | no | Custom hosted checkout URL |
| `VITE_BLOQUE_MODE` | no | `sandbox` (default) or `production` |
| `VITE_THREE_DS_AUTH_TYPE` | no | Wompi 3DS sandbox scenario (e.g. `challenge_v2`) |

## 3D Secure sandbox

Set `VITE_THREE_DS_AUTH_TYPE=challenge_v2` in `web/.env` to test the 3DS challenge flow.
See the [Wompi 3DS v2 docs](https://docs.wompi.co/docs/colombia/transacciones-con-3d-secure-v2/) for all available scenarios.
