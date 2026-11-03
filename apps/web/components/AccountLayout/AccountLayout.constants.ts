// The account settings tabs, each its own route so it can be linked to.
export const accountTabs = [
  { href: '/account', label: 'account.nav.profile', ai: false },
  { href: '/account/security', label: 'account.nav.security', ai: false },
  { href: '/account/ai', label: 'account.nav.ai', ai: true },
] as const;
