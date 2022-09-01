import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check'
import type { FirebaseOptions } from 'firebase/app'
import { defineStore } from 'pinia'

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

  const app = initializeApp(config)
  const appStore = useAppStore()
  appStore.app = app

  return app
}

export function useAppCheck() {
  const _siteKey = import.meta.env.VITE_SITE_KEY

  const appStore = useAppStore()
  const appCheck = initializeAppCheck(appStore.app, {
    provider: new ReCaptchaV3Provider(_siteKey),
    isTokenAutoRefreshEnabled: true,
  })

  appStore.appCheck = appCheck

  return appCheck
}

export const useAppStore = defineStore('app', () => {
  const app = ref<FirebaseApp>()
  const appCheck = ref<AppCheck>()

  return { app, appCheck }
})
