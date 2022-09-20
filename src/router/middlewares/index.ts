import type { NavigationGuard } from 'vue-router'
import authGuard from './auth-guard'
import pageTitle from './page-title'
import useFirebase from './use-firebase'

const guards: NavigationGuard[] = [useFirebase, authGuard, pageTitle]

export default guards
