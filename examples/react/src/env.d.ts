/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_KEY?: string;
  readonly VITE_CHECKOUT_ID?: string;
  readonly VITE_CHECKOUT_URL?: string;
  readonly VITE_THREE_DS_AUTH_TYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
