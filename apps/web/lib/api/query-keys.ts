export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

export const habitKeys = {
  all: ['habits'] as const,
  detail: (id: string) => ['habits', id] as const,
};

export const completionKeys = {
  all: ['completions'] as const,
};
