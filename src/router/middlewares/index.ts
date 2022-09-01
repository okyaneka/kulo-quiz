import type { NavigationGuard } from 'vue-router'
import authGuard from './auth-guard'
import useFirebase from './use-firebase'

const guards: NavigationGuard[] = [useFirebase, authGuard]

export default guards
