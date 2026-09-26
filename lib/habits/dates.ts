export function isDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parse(value).getTime())
  );
}

export function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplay(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
}

export function addDays(iso: string, days: number): string {
  const date = parse(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return format(date);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function addMonths(iso: string, months: number): string {
  const date = parse(startOfMonth(iso));
  date.setUTCMonth(date.getUTCMonth() + months);
  return format(date);
}

export function weekdayIndex(iso: string): number {
  const jsDay = parse(iso).getUTCDay();
  return (jsDay + 6) % 7;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function monthTitle(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parse(startOfMonth(iso)));
}

export function weekTitle(iso: string): string {
  const start = startOfWeek(iso);
  const end = addDays(start, 6);
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${Number(start.slice(8, 10))}–${Number(end.slice(8, 10))} ${monthTitle(start)}`;
  }

  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const startText = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: sameYear ? undefined : 'numeric',
    timeZone: 'UTC',
  }).format(parse(start));
  const endText = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parse(end));
  return `${startText} – ${endText}`;
}

export function compareDates(left: string, right: string): number {
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

function parse(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIsoDate(value: string): string {
  const display = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (display) {
    return `${display[3]}-${display[2]}-${display[1]}`;
  }
  return value;
}

function format(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
