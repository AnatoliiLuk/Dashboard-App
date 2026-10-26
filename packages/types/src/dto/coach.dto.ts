export type CoachLocale = 'en' | 'uk';

export type CoachChatDto = {
  /** The new message. The server keeps the earlier turns. */
  message: string;
  locale: CoachLocale;
  /** The person's local date, YYYY-MM-DD, so streaks match the UI. */
  today?: string;
};
