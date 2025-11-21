importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCYh9fPO406fKWEky1JzHzvrd-0yQ7ItBU",
  authDomain: "saerom-council-push-noti.firebaseapp.com",
  projectId: "saerom-council-push-noti",
  messagingSenderId: "630680292036",
  appId: "1:630680292036:web:97c0bce5ab0d77506ad791",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle =
    payload.notification?.title || "새 알림이 도착했습니다";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "icons/icon192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
