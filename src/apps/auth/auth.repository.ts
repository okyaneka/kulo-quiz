import { useAppStore, useColRef, useDocRef } from '~/plugins/firebase'
import {
  getAuth,
  // createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
  updateProfile as __updateProfile,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  // signInWithPopup,
  // GoogleAuthProvider,
  // signInWithRedirect,
  // getRedirectResult,
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
  UserWithUserData,
  UserData,
  EditProfilePayload,
} from './auth.types'
// import type { UserWithMeta } from '../user-inter/user-inter.types'

const USERS = 'users'

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
      await __updateProfile(userCredential.user, { displayName: payload.name })
      await getAuthUser()
      return userCredential
    }
  )
}

export async function processAuth() {
  if (isSignInWithEmailLink(useAuth(), window.location.href)) {
    const url = new URL(location.toString())
    const email = url.searchParams.get('_id')
    if (email == null) throw new Error('email undefined')

    await signInWithEmailLink(useAuth(), email, window.location.href)
    await getAuthUser()
  }
}

export async function getAuthUser(): Promise<User | null> {
  const user = await new Promise<User>((res, rej) => {
    const unsubscribe = authObserver((user: User | null) => {
      unsubscribe()
      if (user == null) {
        logout()
        return rej('user_is_null')
      }

      res(user)
    })
  })

  const { size: total } = await getDocs(query(useColRef<UserData>(USERS)))
  const { size, docs } = await getDocs(
    query(useColRef<UserData>(USERS), where('user_id', '==', user.uid))
  )

  const userData = ref<UserData>()

  if (size == 0) {
    userData.value = await addDocument(
      useColRef<UserData>(USERS),
      {
        displayName: user.displayName,
        photoURL: user.photoURL,
        user_id: user.uid,
        username_set: false,
        username: 'user' + ntan(total + 1).padStart(4, '0'),
      },
      { withoutAuthor: true }
    )
  } else {
    const data = docs[0]
    if (size > 1) {
      docs.forEach((v, i) => {
        if (i == 0) return
        deleteDocument(useDocRef(USERS, v.id))
      })
    }
    userData.value = { ...data.data(), id: data.id }
  }

  const store = useAuthStore()
  store.user = Object.assign(user, userData.value)
  return store.user
}

export async function updateProfile(payload: EditProfilePayload) {
  const user = useAuthUser()
  await __updateProfile(user, {
    displayName: payload.displayName,
    photoURL: payload.photoURL,
  })

  await setDocument(useDocRef<UserData>(USERS, user.id), {
    displayName: payload.displayName,
    photoURL: payload.photoURL ?? null,
    username: payload.username,
    gender: payload.gender,
    bio: payload.bio,
    username_set: true,
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

export function useAuthUser(): UserWithUserData {
  const { user } = useAuthStore()
  if (user == null) throw new Error('Unauthorized.')
  return user
}

export async function checkUsername(username: string): Promise<boolean> {
  const user = useAuthUser()
  if (username == user.username) return true
  const { empty } = await getDocs(
    query(useColRef<UserData>(USERS), where('username', '==', username))
  )
  if (empty) return true
  return false
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserWithUserData | null>(null)

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
