/**
 * Price vs. market estimate. Computed (not stored in the schema yet), so it lives in the UI.
 * Move to @repo/core once the market-estimate job exists.
 */
export const MARKET_POSITIONS = ["below", "fair", "above"] as const;
export type MarketPosition = (typeof MARKET_POSITIONS)[number];
