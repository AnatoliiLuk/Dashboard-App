export function archivedAtFor(
  archived: boolean | undefined,
  now: () => Date = () => new Date(),
): Date | null | undefined {
  if (archived === undefined) {
    return undefined;
  }
  return archived ? now() : null;
}
