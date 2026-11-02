/**
 * Stable, machine-readable error codes in the API error body (`code`).
 * Clients map these to translated text; the `message` is English only and
 * may change.
 */
const API_ERROR_CODES = [
  'CURRENT_PASSWORD_REQUIRED',
  'CURRENT_PASSWORD_INCORRECT',
  'PASSWORD_UNCHANGED',
  'EMAIL_IN_USE',
  'RATE_LIMITED',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
