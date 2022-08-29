import type { NavigationGuard } from 'vue-router'
import authGuard from './auth-guard'

const guards: NavigationGuard[] = [authGuard]

export default guards
