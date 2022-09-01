import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useApp, useAppCheck, useAppStore } from '~/plugins/firebase'

export default async function (): Promise<void | undefined> {
  const { app, appCheck } = useAppStore()
  if (!app) await useApp()
  // if (!appCheck) await useAppCheck()
}
