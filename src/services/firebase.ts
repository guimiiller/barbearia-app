import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDv7rP_g2xDKJyFKFBllm8ej99vwNwTSyY",
  authDomain: "barao-barber.firebaseapp.com",
  projectId: "barao-barber",
  storageBucket: "barao-barber.firebasestorage.app",
  messagingSenderId: "933349476113",
  appId: "1:933349476113:web:6e907337b35afb50226eb0",
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();

  if (!supported) {
    console.log("Firebase Messaging não é suportado neste navegador.");
    return null;
  }

  return getMessaging(firebaseApp);
};
