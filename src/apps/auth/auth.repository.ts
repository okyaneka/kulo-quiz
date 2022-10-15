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
  // RecaptchaVerifier,
} from 'firebase/auth'
import { defineStore } from 'pinia'
import type { Subject } from '~/composables/types/interfaces'

export interface RegisterPayload {
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface GuestLoginPayload {
  name: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface AuthObserverCallback {
  (user: User | null): void
}

export function useAuth() {
  const { app } = useAppStore()
  return getAuth(app)
}

export function register(payload: RegisterPayload) {
  return createUserWithEmailAndPassword(
    useAuth(),
    payload.email,
    payload.password
  ).then(async (userCredential: UserCredential) => {
    await getAuthUser()
    return userCredential
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

export function logout() {
  return signOut(useAuth())
}

export function forgetPassword(payload: ForgotPasswordPayload) {
  return sendPasswordResetEmail(useAuth(), payload.email)
}

export function authObserver(callback: AuthObserverCallback) {
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
