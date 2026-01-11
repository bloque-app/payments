# Bloque Payments

Official payment processing libraries for Bloque.

## Packages

This monorepo contains the following packages:

- **[@bloque/payments](./packages/payments-sdk)** - SDK for creating and managing payments and checkouts
- **[@bloque/payments-core](./packages/payments-core)** - Core utilities and types
- **[@bloque/payments-react](./packages/payments-react)** - React wrapper for payment components

## Installation

```bash
# SDK
npm install @bloque/payments

# React Components
npm install @bloque/payments-react
```

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Build specific layers
bun run build:foundation  # Core & SDK
bun run build:ui         # Elements & React

# Clean all packages
bun run clean
```

## Documentation

See the README in each package for detailed usage instructions.

## License

[MIT](./LICENSE)
