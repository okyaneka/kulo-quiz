import { useApp, useAppCheck, useAppStore } from '~/plugins/firebase'

export default async function (): Promise<void | undefined> {
  const { app, appCheck } = useAppStore()
  if (!app) useApp()
  if (!appCheck) useAppCheck()
}
