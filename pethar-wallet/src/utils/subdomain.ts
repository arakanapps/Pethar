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
  | 'privacy'
  | 'security'
  | 'legal'
  | 'terms'
  | 'www'
  | string;

export const KNOWN_SUBDOMAINS: string[] = [
  'app',
  'wallet',
  'login',
  'signup',
  'platform',
  'pay',
  'card',
  'merchant',
  'ibanking',
  'accounts',
  'support',
  'help',
  'developer',
  'api',
  'trade',
  'data',
  'exchange',
  'global',
  'docs',
  'offline',
  'online',
  'admin',
  'cloud',
  'beta',
  'root',
  'p2m',
  'p2c',
  'c2c',
  'p2p',
  'm2m',
  'web3',
  'ads',
  'chat',
  'connect',
  'careers',
  'demo',
  'download',
  'info',
  'search',
  'privacy',
  'security',
  'legal',
  'terms',
];

export const getSubdomain = (): Subdomain => {
  if (typeof window === 'undefined') return '';

  // 1. Check URL query parameter (essential for preview and local development)
  const searchParams = new URLSearchParams(window.location.search);
  const paramSubdomain = searchParams.get('subdomain') || searchParams.get('sd');
  if (paramSubdomain) {
    return paramSubdomain.toLowerCase().trim() as Subdomain;
  }

  // 2. Check path-based routing (e.g. /login, /signup, /wallet, /app, /platform, /en/wallet, /ak/login)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  for (const segment of pathSegments) {
    const s = segment.toLowerCase().trim();
    if (KNOWN_SUBDOMAINS.includes(s)) {
      return s as Subdomain;
    }
  }

  const hostname = window.location.hostname;
  const hostnameWithoutPort = hostname.split(':')[0].toLowerCase();

  // If localhost or IP address without subdomain
  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort === '127.0.0.1') {
    return '';
  }

  const parts = hostnameWithoutPort.split('.');

  // Support local dev subdomains like wallet.localhost
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0] as Subdomain;
  }

  // Handle .co.uk domain (e.g. pethar.co.uk or wallet.pethar.co.uk)
  if (parts.length >= 3 && parts[parts.length - 2] === 'co' && parts[parts.length - 1] === 'uk') {
    // pethar.co.uk -> main domain
    if (parts.length === 3 && parts[0] === 'pethar') {
      return '';
    }
    // www.pethar.co.uk -> main domain
    if (parts[0] === 'www') {
      return '';
    }
    // wallet.pethar.co.uk -> 'wallet'
    return parts[0] as Subdomain;
  }

  // Handle standard domains (e.g. pethar.com, wallet.pethar.com)
  if (parts.length >= 2) {
    if (parts[0] === 'www' || parts[0] === 'pethar') {
      return '';
    }
    return parts[0] as Subdomain;
  }

  return '';
};

export const isSubdomain = (subdomain: string): boolean => {
  return getSubdomain() === subdomain;
};

export const redirectToSubdomain = (subdomain: string) => {
  if (typeof window === 'undefined') return;

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const pathname = window.location.pathname;
  const search = window.location.search;

  // Localhost or preview hosts: switch via path
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app')) {
    if (!subdomain) {
      window.location.href = `${window.location.protocol}//${hostname}${port}/`;
    } else {
      window.location.href = `${window.location.protocol}//${hostname}${port}/${subdomain}${search}`;
    }
    return;
  }

  // Official production domain (*.pethar.co.uk)
  if (hostname.endsWith('pethar.co.uk')) {
    const targetHost = subdomain ? `${subdomain}.pethar.co.uk` : 'pethar.co.uk';
    window.location.href = `${window.location.protocol}//${targetHost}${port}${pathname}${search}`;
    return;
  }

  // Generic domain fallback
  const baseDomain = hostname.replace(/^[^.]+\./, '');
  const targetHost = subdomain ? `${subdomain}.${baseDomain}` : baseDomain;
  window.location.href = `${window.location.protocol}//${targetHost}${port}${pathname}${search}`;
};

export const getRedirectMap = (): Record<string, string> => {
  return {
    // Note: '' (root domain pethar.co.uk) and 'www' must NOT redirect to app!
    // They serve the public landing page for everyone to see.

    // Typo corrections & aliases
    'esearch': 'search',
    'carreers': 'careers',
    'auth': 'login',
    'dev': 'developer',
    'faq': 'help',
    'legal': 'privacy',
    'terms': 'privacy',
  };
};