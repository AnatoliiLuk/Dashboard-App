export function fetcherGet<T>(): (url: string) => Promise<T> {
  return async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json() as Promise<T>;
  };
}
