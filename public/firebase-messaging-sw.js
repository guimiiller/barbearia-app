importScripts(
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDv7rP_g2xDKJyFKFBllm8ej99vwNwTSyY",
  authDomain: "barao-barber.firebaseapp.com",
  projectId: "barao-barber",
  storageBucket: "barao-barber.firebasestorage.app",
  messagingSenderId: "933349476113",
  appId: "1:933349476113:web:6e907337b35afb50226eb0",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Notificação recebida em background:", payload);

  const notificationTitle = payload.notification?.title || "Barão Barber";

  const notificationOptions = {
    body: payload.notification?.body || "Você recebeu uma nova notificação.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
