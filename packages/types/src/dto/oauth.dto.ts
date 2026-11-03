export type OAuthConsentDecisionDto = {
  /** The signed `request` from the consent page URL. */
  request: string;
  approve: boolean;
};
