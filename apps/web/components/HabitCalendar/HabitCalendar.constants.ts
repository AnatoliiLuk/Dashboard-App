export const CALENDAR_VIEWS = ['month', 'week'] as const;

export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export const CALENDAR_VIEW_KEY = 'habit-calendar-view';

export const calendarViewLabel = {
  month: 'calendar.month',
  week: 'calendar.week',
} as const;
