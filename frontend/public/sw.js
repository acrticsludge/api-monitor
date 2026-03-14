self.addEventListener("push", function (event) {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const raw = event.notification.data.url || "/";
  const url = raw.startsWith("http") ? raw : self.location.origin + raw;
  event.waitUntil(clients.openWindow(url));
});
