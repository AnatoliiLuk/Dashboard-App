const TOKEN_KEY = 'habits-plus-token';

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  notify();
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  notify();
}

export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
