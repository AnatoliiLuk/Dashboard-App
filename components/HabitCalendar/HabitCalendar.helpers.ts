import {
  addDays,
  addMonths,
  formatDisplay,
  monthTitle,
  startOfMonth,
  startOfWeek,
  weekTitle,
} from '@/lib/habits/dates';

export type CalendarView = 'month' | 'week';

const CALENDAR_VIEW_KEY = 'habit-calendar-view';

export function loadCalendarView(): CalendarView {
  if (typeof window === 'undefined') {
    return 'month';
  }
  return window.localStorage.getItem(CALENDAR_VIEW_KEY) === 'week'
    ? 'week'
    : 'month';
}

export function saveCalendarView(view: CalendarView) {
  window.localStorage.setItem(CALENDAR_VIEW_KEY, view);
}

export function shiftCalendar(
  cursor: string,
  view: CalendarView,
  step: -1 | 1,
) {
  if (view === 'week') {
    return addDays(cursor, step * 7);
  }
  return addMonths(cursor, step);
}

export function calendarHeading(cursor: string, view: CalendarView) {
  return view === 'week' ? weekTitle(cursor) : monthTitle(cursor);
}

export function isCurrentPeriod(
  cursor: string,
  today: string,
  view: CalendarView,
) {
  if (view === 'week') {
    return startOfWeek(cursor) === startOfWeek(today);
  }
  return startOfMonth(cursor) === startOfMonth(today);
}

export function currentPeriodLabel(today: string) {
  return formatDisplay(today);
}

export function calendarStepLabel(
  view: CalendarView,
  direction: 'previous' | 'next',
) {
  const unit = view === 'week' ? 'week' : 'month';
  return direction === 'previous' ? `Previous ${unit}` : `Next ${unit}`;
}
