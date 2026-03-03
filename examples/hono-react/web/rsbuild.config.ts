import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Hono + React - Bloque Checkout Example',
  },
  source: {
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    port: 3000,
  },
});
