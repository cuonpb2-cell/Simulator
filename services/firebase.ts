
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getFirebaseConfig = () => {
  // The hosting environment is expected to inject this global variable.
  const injectedConfig = (window as any).__firebase_config;

  if (injectedConfig && injectedConfig.apiKey && injectedConfig.apiKey !== "YOUR_FALLBACK_API_KEY") {
    return injectedConfig;
  }

  console.warn("Using fallback Firebase config. Authentication will likely fail if a valid config is not injected.");
  // Fallback for local development or misconfigured environments.
  return {
    apiKey: "YOUR_FALLBACK_API_KEY",
    authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
    projectId: "YOUR_FALLBACK_PROJECT_ID",
    storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
    appId: "YOUR_FALLBACK_APP_ID"
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'ai-text-adventure-simulator-vn';

export { app, auth, db, appId };