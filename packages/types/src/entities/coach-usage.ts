/** Today's AI coach token use against the daily budget (UTC day). */
export type CoachUsage = {
  /** False when the coach is switched off (`AI_ENABLED=false`). */
  enabled: boolean;
  /** Billable tokens used today, counted like `DailyTokenBudget`. */
  usedTokens: number;
  dailyLimit: number;
  /** Next midnight UTC, ISO 8601. */
  resetsAt: string;
};
