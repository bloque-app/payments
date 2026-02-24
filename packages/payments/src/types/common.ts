export type ASSETS = 'COPM/2' | 'DUSD/6';

export interface Metadata {
  [key: string]: string | number | boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}
