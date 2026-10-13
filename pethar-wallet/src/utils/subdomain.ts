export type Subdomain =
  | 'app'
  | 'wallet'
  | 'login'
  | 'signup'
  | 'auth'
  | 'connect'
  | 'info'
  | 'demo'
  | 'download'
  | 'beta'
  | 'search'
  | 'careers'
  | 'ads'
  | 'support'
  | 'help'
  | 'chat'
  | 'pay'
  | 'card'
  | 'merchant'
  | 'p2m'
  | 'p2c'
  | 'c2c'
  | 'trade'
  | 'exchange'
  | 'global'
  | 'data'
  | 'p2p'
  | 'm2m'
  | 'web3'
  | 'ibanking'
  | 'accounts'
  | 'platform'
  | 'online'
  | 'offline'
  | 'admin'
  | 'root'
  | 'developer'
  | 'dev'
  | 'api'
  | 'docs'
  | 'cloud'
  | 'www'
  | string; // Allow any subdomain for flexibility

export const getSubdomain = (): Subdomain => {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  // Remove port if present (e.g., localhost:3000)
  const hostnameWithoutPort = hostname.split(':')[0];

  // Split by dots and take the first part as subdomain
  const parts = hostnameWithoutPort.split('.');
  if (parts.length >= 2) {
    // Handle special case for www and root domain
    if (parts[0] === 'www' && parts.length >= 3) {
      return parts[0] as Subdomain; // www
    }
    if (parts[0] === 'pethar' && parts.length >= 2) {
      // This would be for direct domain access like pethar.co.uk
      return '' as Subdomain;
    }
    return parts[0] as Subdomain;
  }

  return '' as Subdomain;
};

export const isSubdomain = (subdomain: string): boolean => {
  return getSubdomain() === subdomain;
};

export const redirectToSubdomain = (subdomain: string) => {
  if (typeof window === 'undefined') return;

  const currentHost = window.location.hostname;
  const newHostname = currentHost.replace(/^[^.]+\./, `${subdomain}.`);
  window.location.href = `${window.location.protocol}//${newHostname}${window.location.pathname}${window.location.search}`;
};

export const getRedirectMap = (): Record<string, string> => {
  return {
    // Common redirects
    'www': 'app',
    '': 'app', // root domain

    // Alternative spellings/common typos
    'esearch': 'search', // handle the typo from user's list
    'carreers': 'careers', // handle the typo from user's list
    'auth': 'login', // auth redirects to login
    'dev': 'developer', // dev redirects to developer

    // Common aliases
    'home': 'app',
    'main': 'app',
    'web': 'app',
  };
};