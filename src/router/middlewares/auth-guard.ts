import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '~/apps/auth/auth.repository'

export default async function (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<(() => void) | void | undefined> {
  const isLoggedIn = await useAuthStore().isLoggedIn()

  if (to.meta.requireAuth && !isLoggedIn) return () => next('/')

  if (to.meta.noRequireAuth && isLoggedIn) return () => next('/home')
}
