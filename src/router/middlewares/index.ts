import authGuard from './auth-guard'
import pageTitle from './page-title'
import useFirebase from './use-firebase'

const guards = [useFirebase, authGuard, pageTitle]

export default guards
