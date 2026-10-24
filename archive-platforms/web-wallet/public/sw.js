self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never intercept configuration profiles or APK downloads so native iOS/Android handlers run directly
  if (
    url.pathname.endsWith('.mobileconfig') ||
    url.pathname.endsWith('.apk') ||
    event.request.method !== 'GET'
  ) {
    return;
  }
});
