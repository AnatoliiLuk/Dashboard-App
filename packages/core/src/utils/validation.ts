export function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function trimName(value: string): string {
  return value.trim();
}
