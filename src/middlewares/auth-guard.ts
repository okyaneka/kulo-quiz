import { useAuthStore } from '~/apps/auth/auth.repository'
import type { Middleware } from '~/composables/types/interfaces'

const _default: Middleware = async (to, from, next) => {
  const isLoggedIn = await useAuthStore().isLoggedIn()

  if (to.meta.requireAuth && !isLoggedIn) return () => next('/login')

  if (to.meta.noRequireAuth && isLoggedIn) return () => next('/home')
}

export default _default
