// Nexus Desk Service Worker for Push Notifications
// This file must be in the public/ directory to be served at the root scope

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, data, tag, icon, badge } = payload;

    const options = {
      body: body || '',
      icon: icon || '/favicon.png',
      badge: badge || '/favicon.png',
      tag: tag || 'hw-notification',
      data: data || {},
      vibrate: [200, 100, 200],
      requireInteraction: tag === 'hw-call', // Keep call notifications visible
      actions: tag === 'hw-call'
        ? [
            { action: 'accept', title: 'Atender' },
            { action: 'decline', title: 'Recusar' },
          ]
        : [],
    };

    event.waitUntil(
      self.registration.showNotification(title || 'Nexus Desk', options)
    );
  } catch (e) {
    console.error('[SW] Push parse error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/app/desk';

  // Route based on notification type
  if (data.type === 'message' && data.conversationId) {
    url = `/app/desk?view=messages&conversation=${data.conversationId}`;
  } else if (data.type === 'call') {
    url = `/app/desk?view=messages`;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes('/app/desk') && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'notification-click', data });
          return;
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});