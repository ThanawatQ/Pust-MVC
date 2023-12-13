self.addEventListener('push', event => {
  const data = event.data.json()
  console.log('New notification', data)
  const options = {
    body: data.body,
    icon:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/1024px-Flat_tick_icon.svg.png",
    data:{url:"www.google.com"},
    actions: [
      { action: "open_url", title: data.openLinkTitile },
      // {
      //   action: data.openLink,
      //   title: data.openLinkTitile
      // },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
})

self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;
  const { url } = notification.data;

  notification.close();

  if (action === 'open_url') {
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
