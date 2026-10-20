type Listener = () => void;

const listeners = new Set<Listener>();

/** null until the first session check settles. */
let signedIn: boolean | null = null;

/**
 * Advances only when a sign-in is established. Requests captured the previous
 * value, so a session check that started before sign-in cannot clear it.
 */
let sessionEpoch = 0;

const LEGACY_TOKEN_KEY = 'habits-plus-token';

function dropLegacyToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
}

dropLegacyToken();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getSignedIn(): boolean | null {
  return signedIn;
}

export function getSessionEpoch(): number {
  return sessionEpoch;
}

export function setSignedIn(value: boolean): void {
  if (signedIn === value) {
    return;
  }

  if (value) {
    sessionEpoch += 1;
  }

  signedIn = value;
  notify();
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
