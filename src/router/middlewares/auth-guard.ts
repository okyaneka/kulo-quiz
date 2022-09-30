import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getAuthUser, useAuthUser } from '~/apps/auth/auth.repository'

export default async function (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void | undefined> {
  if (to.meta.requireAuth || to.meta.noRequireAuth) {
    let user = null
    try {
      user = useAuthUser()
    } catch (error) {
      user = await getAuthUser().catch(() => {
        console.log('user_retrieved')
      })
    }

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
