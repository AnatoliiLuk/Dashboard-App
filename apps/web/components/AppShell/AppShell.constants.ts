import {
  CalendarIcon,
  CircleCheckIcon,
  SparkleIcon,
  TargetIcon,
} from '@/components/icons';

export const menu = [
  {
    href: '/',
    label: 'shell.calendar',
    shortLabel: 'shell.calendarShort',
    Icon: CalendarIcon,
  },
  {
    href: '/log',
    label: 'shell.logHabits',
    shortLabel: 'shell.logShort',
    Icon: CircleCheckIcon,
  },
  {
    href: '/goals',
    label: 'shell.myGoals',
    shortLabel: 'shell.goalsShort',
    Icon: TargetIcon,
  },
  {
    href: '/coach',
    label: 'shell.coach',
    shortLabel: 'shell.coachShort',
    Icon: SparkleIcon,
  },
] as const;

// The page heading screen readers land on; the nav already shows it visually.
export const pageTitle = {
  '/': 'shell.calendar',
  '/log': 'shell.logHabits',
  '/goals': 'shell.myGoals',
  '/coach': 'shell.coach',
  '/account': 'shell.account',
} as const;

export const MAIN_ID = 'main';

// `/` would match every route, so it only counts on its own.
export function isCurrentRoute(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
