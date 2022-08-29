import { useApp } from '~/plugins/firebase'
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
} from 'firebase/auth'
import { defineStore } from 'pinia'

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
  return getAuth(useApp())
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
  return new Promise((res) => {
    const unsubscribe = authObserver((user: User | null) => {
      unsubscribe()
      const store = useAuthStore()
      store.user = user
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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>()
  return { user }
})
