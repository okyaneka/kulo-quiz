import type { Middleware } from '~/composables/types/interfaces'
import { useApp, useAppCheck, useAppStore } from '~/plugins/firebase'

const _default: Middleware = async () => {
  const { app, appCheck } = useAppStore()
  if (!app) useApp()
  if (!appCheck) useAppCheck()
}

export default _default
