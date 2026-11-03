export interface OAuthConsentProps {
  /** The signed `request` from the consent page URL. */
  request: string;
  /** Leaves the app for the client's redirect URI. Replaced in tests. */
  navigate?: (url: string) => void;
}
