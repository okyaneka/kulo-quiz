import { useAppStore } from '~/plugins/firebase'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
  updateProfile,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  isSignInWithEmailLink,
  signInWithEmailLink,
  // RecaptchaVerifier,
} from 'firebase/auth'
import { defineStore } from 'pinia'
import type { Subject } from '~/composables/types/interfaces'
import type {
  RegisterPayload,
  LoginPayload,
  GuestLoginPayload,
  ForgotPasswordPayload,
} from './auth.types'

export function useAuth() {
  const { app } = useAppStore()
  return getAuth(app)
}

export async function register(payload: RegisterPayload) {
  return await sendSignInLinkToEmail(useAuth(), payload.email, {
    url:
      import.meta.env.VITE_APP_BASE_URL +
      '/auth-processing?_id=' +
      payload.email,
    handleCodeInApp: true,
    dynamicLinkDomain: 'quiz.kulooky.my.id',
  }).then(() => {
    localStorage.setItem('emailForSignIn', payload.email)
    console.log(localStorage)
  })
}

export function login(payload: LoginPayload) {
  return signInWithEmailAndPassword(
    useAuth(),
    payload.email,
    payload.password
  ).then(async (userCredential: UserCredential) => {
    await getAuthUser()
    return userCredential
  })
}

export function guestLogin(payload: GuestLoginPayload) {
  return signInAnonymously(useAuth()).then(
    async (userCredential: UserCredential) => {
      await updateProfile(userCredential.user, { displayName: payload.name })
      await getAuthUser()
      return userCredential
    }
  )
}

export async function processAuth() {
  if (isSignInWithEmailLink(useAuth(), window.location.href)) {
    const url = new URL(location.toString())
    const email = url.searchParams.get('email')
    if (email == null) throw new Error('email undefined')

    await signInWithEmailLink(useAuth(), email, window.location.href)
    await getAuthUser()
  }
}

export async function getAuthUser(): Promise<User | null> {
  return new Promise((res, rej) => {
    const unsubscribe = authObserver((user: User | null) => {
      unsubscribe()
      if (user == null) {
        logout()
        rej('user_is_null')
      }
      const store = useAuthStore()
      store.user = user as User
      res(user)
    })
  })
}

export async function logout() {
  await signOut(useAuth())
  const store = useAuthStore()
  store.user = null
}

export function forgetPassword(payload: ForgotPasswordPayload) {
  return sendPasswordResetEmail(useAuth(), payload.email)
}

export function authObserver(callback: (user: User | null) => void) {
  return onAuthStateChanged(useAuth(), (user: User | null) => {
    callback(user)
  })
}

// export function useRecaptchaVerifier(
//   ref: HTMLElement,
//   callback: () => any
// ): RecaptchaVerifier {
//   return new RecaptchaVerifier(
//     ref,
//     {
//       callback: (res: any) => {
//         console.log('callback', res)
//         callback()
//       },
//       'expired-callback': (res: any) => {
//         console.log('expired-callback', res)
//       },
//       'error-callback': (res: any) => {
//         console.log('error-callback', res)
//       },
//     },
//     useAuth()
//   )
// }

export function useAuthUser(): User {
  const { user } = useAuthStore()
  if (user == null) throw new Error('Unauthorized.')
  return user
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>()

  const isLoggedIn = async (): Promise<boolean> => {
    try {
      if (user.value == undefined) await getAuthUser()
      return !!user.value
    } catch (e) {
      return false
    }
  }

  const useAuthor = (): Subject => {
    if (user.value == undefined) throw new Error('user_undefined')
    return {
      email: user.value.email,
      uid: user.value.uid,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
    }
  }

  return { user, isLoggedIn, useAuthor }
})
