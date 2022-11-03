import { useAuthStore } from '~/apps/auth/auth.repository'
import type { Middleware } from '~/composables/types/interfaces'

const _default: Middleware = async (to, from, next) => {
  const isLoggedIn = await useAuthStore().isLoggedIn()

  const redirect = sessionStorage.getItem('redirect')

  if (to.meta.requireAuth && !isLoggedIn)
    sessionStorage.setItem('redirect', to.fullPath)

  if (
    to.meta.noRequireAuth &&
    (!to.fullPath.includes('login') || !to.fullPath.includes('login'))
  )
    sessionStorage.removeItem('redirect')

  if (to.meta.requireAuth && isLoggedIn && redirect) {
    sessionStorage.removeItem('redirect')
    return () => next(redirect)
  }
}

export default _default
