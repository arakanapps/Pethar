export type Subdomain =
  | 'app'
  | 'dashboard'
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
    const clean = paramSubdomain.toLowerCase().trim();
    if (clean === 'dashboard') return 'app';
    return clean as Subdomain;
  }

  // 2. Check path-based routing (e.g. /login, /signup, /wallet, /app, /dashboard, /platform, /en/wallet, /ak/login)
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

  // If localhost or IP address without subdomain
  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort === '127.0.0.1') {
    return '';
  }

  const parts = hostnameWithoutPort.split('.');

  // Support local dev subdomains like wallet.localhost
  if (parts.length === 2 && parts[1] === 'localhost') {
    if (parts[0] === 'dashboard') return 'app';
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
    // dashboard.pethar.co.uk -> 'app'
    if (parts[0] === 'dashboard') {
      return 'app';
    }
    return parts[0] as Subdomain;
  }

  // Handle standard domains (e.g. pethar.com, wallet.pethar.com)
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

  // Sanitize target path:
  // When switching away from auth/login/signup to app/dashboard, NEVER carry over /auth, /login, or /signup!
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

  // Ensure targetPath starts with '/'
  if (!targetPath.startsWith('/')) {
    targetPath = `/${targetPath}`;
  }

  const isPetharDomain = hostname.endsWith('pethar.co.uk');

  // 1. Single-origin routing (localhost, 127.0.0.1, Vercel preview, Firebase web.app, etc.)
  if (!isPetharDomain) {
    if (!subdomain || subdomain === 'www') {
      window.location.href = `${window.location.protocol}//${hostname}${port}${targetPath}${search}`;
    } else if (subdomain === 'app' || subdomain === 'dashboard') {
      window.location.href = `${window.location.protocol}//${hostname}${port}/dashboard${search}`;
    } else {
      window.location.href = `${window.location.protocol}//${hostname}${port}/${subdomain}${search}`;
    }
    return;
  }

  // 2. Official production domain (*.pethar.co.uk)
  // Ensure we map 'dashboard' to 'app.pethar.co.uk'
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

  // If on a dedicated auth subdomain on production (auth.pethar.co.uk, login.pethar.co.uk):
  if (
    isPetharDomain &&
    (hostname.startsWith('auth.') || hostname.startsWith('login.') || hostname.startsWith('signup.'))
  ) {
    const port = window.location.port ? `:${window.location.port}` : '';
    window.location.href = `${window.location.protocol}//app.pethar.co.uk${port}/${targetLang}/dashboard`;
    return;
  }

  // If navigate function is passed from React Router, perform fast SPA transition
  if (navigate) {
    navigate(`/${targetLang}/dashboard`);
    return;
  }

  // Otherwise perform full navigation
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
    'faq': 'help',
    'legal': 'privacy',
    'terms': 'privacy',
  };
};