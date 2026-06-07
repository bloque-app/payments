export type CancelSubscriptionStatus =
  | 'cancellation_pending'
  | 'already_cancelled'
  | 'graph_done';

/**
 * Output of `POST /payments/subscriptions/:payment_urn/cancel`.
 * Cancels future occurrences of a recurring subscription (direct recurring-card flow).
 */
export interface CancelDirectSubscriptionOutput {
  status: CancelSubscriptionStatus;
  /**
   * Index of the next-to-fire occurrence anchor (`tick_<i>`) when status is
   * `cancellation_pending`. `null` if every tick has already resolved or graph is done.
   */
  cursor: number | null;
  /** Payment URN that was targeted for cancellation. */
  payment_urn: string;
  /** Underlying swap order id. */
  order_id: string;
  /** Underlying swap graph id. */
  graph_id: string;
}
