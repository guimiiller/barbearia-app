import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

const VAPID_KEY =
  "BHIXwsZPaXkzFB-_tigqulM89L4hJRootr-wj4UahVesbp6TA2UrXSYR_g_uhdjhvdfC5q2DHDWbzkIt3lKdK9A";

export const enablePushNotifications = async () => {
  try {
    // Firebase Messaging deste fluxo é somente Web/PWA
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      console.log("🔕 Notificações Web indisponíveis neste ambiente.");
      return null;
    }

    if (!("Notification" in window)) {
      console.log("🔕 Este navegador não suporta notificações.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("🔕 Este navegador não suporta Service Worker.");
      return null;
    }

    // -----------------------------------------------------
    // 1. Solicitar permissão
    // -----------------------------------------------------

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.log("🔕 Permissão para notificações não concedida.");
      return null;
    }

    console.log("✅ Permissão para notificações concedida.");

    // -----------------------------------------------------
    // 2. Registrar o Service Worker do Firebase
    // -----------------------------------------------------

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    console.log("✅ Service Worker registrado:", registration.scope);

    await navigator.serviceWorker.ready;

    // -----------------------------------------------------
    // 3. Obter Firebase Messaging
    // -----------------------------------------------------

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.log("❌ Firebase Messaging indisponível.");
      return null;
    }

    // -----------------------------------------------------
    // 4. Gerar token FCM
    // -----------------------------------------------------

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.log("❌ Firebase não retornou um token FCM.");
      return null;
    }

    return token;
  } catch (error) {
    console.error("❌ Erro ao ativar notificações:", error);

    return null;
  }
};
