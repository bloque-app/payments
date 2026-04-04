import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { resolve } from 'node:path';

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

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
    define: publicVars,
  },
  server: {
    port: 3000,
  },
});
