/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_KEY?: string;
  readonly VITE_CHECKOUT_URL?: string;
  readonly VITE_BLOQUE_MODE?: string;
  readonly VITE_THREE_DS_AUTH_TYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
