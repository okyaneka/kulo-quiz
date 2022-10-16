import type { Middleware } from '~/composables/types/interfaces'
import authGuard from './auth-guard'
import pageTitle from './page-title'
import sessionGuard from './session-guard'
import useFirebase from './use-firebase'

const guards: Middleware[] = [useFirebase, sessionGuard, authGuard, pageTitle]

export default guards
