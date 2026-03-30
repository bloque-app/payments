export type ASSETS = 'COPM/2' | 'DUSD/6' | 'COP/2' | 'USD/6';

export interface Metadata {
  [key: string]: unknown;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

// --- Payout Route types ---

export type RouteNetwork = 'kusama' | 'polygon' | 'tron' | 'bep20' | 'bloque';

export type PolygonRoute = {
  network: 'polygon';
  address: string;
  alias: string;
  metadata?: Metadata;
};

export type KusamaRoute = {
  network: 'kusama';
  address: string;
  alias: string;
  memo?: string;
  metadata?: Metadata;
};

export type TronRoute = {
  network: 'tron';
  address: string;
  alias: string;
  metadata?: Metadata;
};

export type Bep20Route = {
  network: 'bep20';
  address: string;
  alias: string;
  metadata?: Metadata;
};

export type BloqueRoute = {
  network: 'bloque';
  account_urn: string;
  alias: string;
  metadata?: Metadata;
};

/**
 * Discriminated union of all supported payout route destinations.
 * Use the `network` field to determine which properties are available.
 */
export type Route =
  | PolygonRoute
  | KusamaRoute
  | TronRoute
  | Bep20Route
  | BloqueRoute;

export type PayoutRouteFixed = {
  type: 'fixed';
  amount: number;
  route: Route;
  metadata?: Metadata;
};

export type PayoutRoutePercentage = {
  type: 'percentage';
  percentage: number;
  route: Route;
  metadata?: Metadata;
};

/**
 * Defines how funds from a payment are distributed.
 * Can be a fixed amount or a percentage of the total.
 */
export type PayoutRoute = PayoutRouteFixed | PayoutRoutePercentage;
