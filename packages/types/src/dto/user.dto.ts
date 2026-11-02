/** At least one of `name` or `email`. */
export type UpdateProfileDto = {
  name?: string;
  email?: string;
  /** Required when `email` changes. */
  currentPassword?: string;
};

export type ChangePasswordDto = {
  currentPassword: string;
  /** 8-128 characters, different from the current password. */
  newPassword: string;
};

export type DeleteAccountDto = {
  password: string;
};
