self.addEventListener("push", function (event) {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
    image: data.image, // optional
    data: {
      url: data.url,
    },
    actions: [
      { action: "open", title: "Open", icon: "/open-icon.png" },
      { action: "dismiss", title: "Dismiss", icon: "/dismiss-icon.png" },
    ],
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// self.addEventListener("push", async (event) => {
//   const data = event.data.json();
//   const { title, body, icon, link } = data;

//   await self.registration.showNotification(title, {
//     body,
//     icon,
//     data: { url: link },
//   });
// });

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(clients.openWindow(event.notification.data.url));
// });
