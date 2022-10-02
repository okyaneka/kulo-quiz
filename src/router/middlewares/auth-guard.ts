import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '~/apps/auth/auth.repository'

export default async function (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void | undefined> {
  if (to.meta.requireAuth || to.meta.noRequireAuth) {
    const { isLoggedIn } = useAuthStore()

    if (to.meta.requireAuth) {
      if (await isLoggedIn()) return next()
      else return next('/')
    }

    if (to.meta.noRequireAuth) {
      if (await isLoggedIn()) return next('/home')
      else return next()
    }
  }
}
