importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBXbZLM1YsEqNetwLVUHouOtmwgCCbRtqA",
  authDomain: "unimart-d6cd1.firebaseapp.com",
  projectId: "unimart-d6cd1",
  storageBucket: "unimart-d6cd1.firebasestorage.app",
  messagingSenderId: "347563265549",
  appId: "1:347563265549:web:11162f4e3a91c77e5ecf44"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/exown-icon.png',
    data: { url: payload.data?.link || '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
