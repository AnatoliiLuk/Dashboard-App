export type CoachLocale = 'en' | 'uk';

export type CoachMessageDto = {
  role: 'user' | 'assistant';
  content: string;
};

export type CoachChatDto = {
  /** Starts and ends with a user message. At most 20 messages. */
  messages: CoachMessageDto[];
  locale: CoachLocale;
  /** The person's local date, YYYY-MM-DD, so streaks match the UI. */
  today?: string;
};
