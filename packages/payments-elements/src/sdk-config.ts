export interface SDKInitOptions {
  apiKey: string;
  mode?: 'production' | 'sandbox';
}

/**
 * Global SDK configuration
 */
class SDKConfig {
  private static instance: SDKConfig;
  private _apiKey: string | null = null;
  private _mode: 'production' | 'sandbox' = 'production';

  private constructor() {}

  static getInstance(): SDKConfig {
    if (!SDKConfig.instance) {
      SDKConfig.instance = new SDKConfig();
    }
    return SDKConfig.instance;
  }

  init(options: SDKInitOptions): void {
    this._apiKey = options.apiKey;
    this._mode = options.mode ?? 'production';
  }

  get apiKey(): string | null {
    return this._apiKey;
  }

  get mode(): 'production' | 'sandbox' {
    return this._mode;
  }

  getApiUrl(): string {
    const baseUrl =
      this._mode === 'sandbox'
        ? 'https://dev.bloque.app'
        : 'https://api.bloque.app';
    return baseUrl;
  }

  isInitialized(): boolean {
    return this._apiKey !== null;
  }
}

/**
 * Initialize the Bloque Payments SDK
 * @param options - SDK initialization options
 * @param options.apiKey - Your Bloque API key
 * @param options.mode - Environment mode ('production' or 'sandbox')
 */
export function init(options: SDKInitOptions): void {
  SDKConfig.getInstance().init(options);
}

export function getSDKConfig(): SDKConfig {
  return SDKConfig.getInstance();
}
