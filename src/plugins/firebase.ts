import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseOptions } from 'firebase/app'

export function useApp() {
  const config: FirebaseOptions = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  }

  return initializeApp(config)
}

export function useAppCheck() {
  const _siteKey = import.meta.env.VITE_SITE_KEY

  return initializeAppCheck(useApp(), {
    provider: new ReCaptchaV3Provider(_siteKey),
    isTokenAutoRefreshEnabled: true,
  })
}
