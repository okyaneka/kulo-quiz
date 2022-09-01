import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getAuthUser } from '~/apps/auth/auth.repository'

export default async function (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void | undefined> {
  if (to.meta.requireAuth || to.meta.noRequireAuth) {
    const user = await getAuthUser()

    if (to.meta.requireAuth) {
      if (user) return next()
      else return next('/')
    }

    if (to.meta.noRequireAuth) {
      if (user) return next('/home')
      else return next()
    }
  }
}
