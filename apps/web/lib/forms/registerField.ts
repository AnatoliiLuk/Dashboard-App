import type { UseFormRegisterReturn } from 'react-hook-form';

// MUI TextField forwards `ref` to the wrapper. The native input is `inputRef`.
export function registerField({ ref, ...field }: UseFormRegisterReturn) {
  return { ...field, inputRef: ref };
}
