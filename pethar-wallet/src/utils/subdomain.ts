export type Subdomain =
  | 'm'
  | 'app'
  | 'dashboard'
  | 'wallet'
  | 'login'
  | 'signup'
  | 'auth'
  | 'connect'
  | 'info'
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
  | 'exchange'
  | 'global'
  | 'data'
  | 'transfer'
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

// Note: 'privacy' and 'terms' are main website routes (domain/privacy, domain/terms), so they are excluded from path-based subdomain hijacking
export const KNOWN_SUBDOMAINS: string[] = [
  'm',
  'app',
  'dashboard',
  'wallet',
  'login',
  'signup',
  'auth',
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
  'transfer',
  'm2m',
  'web3',
  'ads',
  'chat',
  'connect',
  'careers',
  'download',
  'info',
  'search',
  'security',
];

export const getSubdomain = (): Subdomain => {
  if (typeof window === 'undefined') return '';

  // 1. Check URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const paramSubdomain = searchParams.get('subdomain') || searchParams.get('sd');
  if (paramSubdomain) {
    const clean = paramSubdomain.toLowerCase().trim();
    if (clean === 'dashboard') return 'app';
    return clean as Subdomain;
  }

  // 2. Check path-based routing (e.g. /download/en/ios, /download/ak/android, /login, /signup, /wallet)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  for (const segment of pathSegments) {
    const s = segment.toLowerCase().trim();
    if (s === 'dashboard') return 'app';
    if (KNOWN_SUBDOMAINS.includes(s)) {
      return s as Subdomain;
    }
  }

  const hostname = window.location.hostname;
  const hostnameWithoutPort = hostname.split(':')[0].toLowerCase();

  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort === '127.0.0.1') {
    return '';
  }

  const parts = hostnameWithoutPort.split('.');

  // Support local dev subdomains like download.localhost or wallet.localhost
  if (parts.length === 2 && parts[1] === 'localhost') {
    if (parts[0] === 'dashboard') return 'app';
    return parts[0] as Subdomain;
  }

  // Handle .co.uk domain (e.g. pethar.co.uk or download.pethar.co.uk)
  if (parts.length >= 3 && parts[parts.length - 2] === 'co' && parts[parts.length - 1] === 'uk') {
    if (parts.length === 3 && parts[0] === 'pethar') {
      return '';
    }
    if (parts[0] === 'www') {
      return '';
    }
    if (parts[0] === 'dashboard') {
      return 'app';
    }
    return parts[0] as Subdomain;
  }

  // Handle standard domains (e.g. pethar.com, download.pethar.com)
  if (parts.length >= 2) {
    if (parts[0] === 'www' || parts[0] === 'pethar') {
      return '';
    }
    if (parts[0] === 'dashboard') {
      return 'app';
    }
    return parts[0] as Subdomain;
  }

  return '';
};

export const isSubdomain = (subdomain: string): boolean => {
  return getSubdomain() === subdomain;
};

export const redirectToSubdomain = (
  subdomain: string,
  options?: { path?: string; search?: string }
) => {
  if (typeof window === 'undefined') return;

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const search =
    options?.search !== undefined ? options.search : window.location.search;

  let targetPath = options?.path;
  if (!targetPath) {
    const currentPath = window.location.pathname;
    const isCurrentAuth =
      currentPath.includes('/login') ||
      currentPath.includes('/signup') ||
      currentPath.includes('/auth');

    if (isCurrentAuth && (subdomain === 'app' || subdomain === 'dashboard' || subdomain === 'wallet' || !subdomain)) {
      targetPath = subdomain === 'app' || subdomain === 'dashboard' ? '/dashboard' : '/';
    } else {
      targetPath = currentPath;
    }
  }

  if (!targetPath.startsWith('/')) {
    targetPath = `/${targetPath}`;
  }

  const isPetharDomain = hostname.endsWith('pethar.co.uk');

  // 1. Single-origin routing (localhost, 127.0.0.1, preview URLs)
  if (!isPetharDomain) {
    if (!subdomain || subdomain === 'www') {
      window.location.href = `${window.location.protocol}//${hostname}${port}${targetPath}${search}`;
    } else if (subdomain === 'app' || subdomain === 'dashboard') {
      window.location.href = `${window.location.protocol}//${hostname}${port}/dashboard${search}`;
    } else {
      const subSuffix = targetPath === '/' ? '' : targetPath;
      window.location.href = `${window.location.protocol}//${hostname}${port}/${subdomain}${subSuffix}${search}`;
    }
    return;
  }

  // 2. Official production domain (*.pethar.co.uk) -> e.g. download.pethar.co.uk/en/ios or download.pethar.co.uk/ak/android
  const normalizedSubdomain = subdomain === 'dashboard' ? 'app' : subdomain;
  const targetHost = normalizedSubdomain && normalizedSubdomain !== 'www'
    ? `${normalizedSubdomain}.pethar.co.uk`
    : 'pethar.co.uk';

  window.location.href = `${window.location.protocol}//${targetHost}${port}${targetPath}${search}`;
};

export const goToDashboard = (lang?: string, navigate?: (path: string) => void) => {
  if (typeof window === 'undefined') return;

  const targetLang = lang === 'en' ? 'en' : 'ak';
  localStorage.setItem('pethar_logged_in', 'true');

  const hostname = window.location.hostname;
  const isPetharDomain = hostname.endsWith('pethar.co.uk');

  if (
    isPetharDomain &&
    (hostname.startsWith('auth.') || hostname.startsWith('login.') || hostname.startsWith('signup.'))
  ) {
    const port = window.location.port ? `:${window.location.port}` : '';
    window.location.href = `${window.location.protocol}//app.pethar.co.uk${port}/${targetLang}/dashboard`;
    return;
  }

  if (navigate) {
    navigate(`/${targetLang}/dashboard`);
    return;
  }

  redirectToSubdomain('app', { path: `/${targetLang}/dashboard`, search: '' });
};

export const goToAuth = (mode: 'login' | 'signup' = 'login') => {
  redirectToSubdomain('auth', { path: '/auth', search: `?mode=${mode}` });
};

export const goToApp = (lang?: string, navigate?: (path: string) => void) => {
  goToDashboard(lang, navigate);
};

export const getRedirectMap = (): Record<string, string> => {
  return {
    'dashboard': 'app',
    'esearch': 'search',
    'carreers': 'careers',
    'dev': 'developer',
  };
};
