import type { Middleware } from '~/composables/types/interfaces'
import router from '~/router'
import authGuard from './auth-guard'
import pageTitle from './page-title'
import sessionGuard from './session-guard'
import useFirebase from './use-firebase'

const guards: Middleware[] = [useFirebase, sessionGuard, authGuard, pageTitle]

export default () => {
  router.beforeEach(async (to, from, next) => {
    let guard = undefined
    for (let i = 0; i < guards.length; i++) {
      guard = await guards[i](to, from, next)

      if (guard) return guard()
    }
    return next()
  })
}
