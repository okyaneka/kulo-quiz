import { getAuth } from 'firebase/auth'
import type { Query } from 'firebase/firestore'
import { useColRef, useDocRef } from '~/plugins/firebase'
import { getAuthUser, useAuthUser } from '../auth/auth.repository'
import type { UserData } from '../auth/auth.types'
import { getQuiz, useQuizColRef, useQuizStore } from '../quiz/quiz.repositories'
import { QuizStatus } from '../quiz/quiz.types'
import { UserMetaScheme } from './user-inter.schemes'
import type {
  Follower,
  Following,
  QuizLiked,
  UserWithMeta,
  UserInteraction,
  UserMeta,
} from './user-inter.types'

const USERS = 'users'
const USER_INTERS = 'user_inters'

function useUserColRef() {
  return useColRef<UserData>(USERS)
}

function useUserIntersCol() {
  return useColRef<UserInteraction>(USER_INTERS)
}

function useUserFollowerColRef(id: string) {
  return useColRef<Follower>(`users/${id}/follower`)
}

function useUserFollowerDocRef(user: string, id: string) {
  return useDocRef<Follower>(`users/${user}/follower/`, id)
}

function useUserFollowingColRef(id: string) {
  return useColRef<Following>(`users/${id}/following`)
}

function useUserFollowingDocRef(user: string, id: string) {
  return useDocRef<Following>(`users/${user}/following/`, id)
}

export async function getUserWithMeta(username: string): Promise<UserWithMeta> {
  const user = await getUser(username)
  const auth = useAuthUser()

  const queries: { key: keyof UserMeta; query: Query }[] = [
    {
      key: 'quiz_count',
      query: query(
        useQuizColRef(),
        where('author.uid', '==', user.user_id),
        where('status', '==', QuizStatus.Publish)
      ),
    },
    {
      key: 'follower_count',
      query: query(
        useUserFollowerColRef(user.id),
        where('has_follow', '==', true)
      ),
    },
    {
      key: 'following_count',
      query: query(
        useUserFollowingColRef(user.id),
        where('has_following', '==', true)
      ),
    },
    {
      key: 'has_follow',
      query: query(
        useUserFollowerColRef(user.id),
        where('has_follow', '==', true),
        where('subject.uid', '==', auth.user_id)
      ),
    },
    {
      key: 'has_following',
      query: query(
        useUserFollowingColRef(auth.id),
        where('has_following', '==', true),
        where('subject.uid', '==', user.user_id)
      ),
    },
  ]

  const userMeta = await new Promise<UserMeta>((res) => {
    const data: any = {}
    let fetched = 0

    queries.forEach((v) => {
      getDocs(v.query).then(({ size }) => {
        data[v.key] = size
        if (++fetched == queries.length) res(UserMetaScheme.parse(data))
      })
    })
  })

  return { ...user, ...userMeta }
}

// get user
export async function getUser(username: string) {
  const { empty, docs } = await getDocs(
    query(useUserColRef(), where('username', '==', username.trim()))
  )

  if (empty) {
    const { isNotFound } = storeToRefs(useNotfoundStore())
    isNotFound.value = true
    throw new Error('user_not_found')
  }

  const data = docs[0]
  return { ...data.data(), id: data.id }
}

// like qui
// unlike quiz

// follow user
export async function followUser(user_id: string) {
  const user = useAuthUser()

  return new Promise((resolve) => {
    let set = 0
    // add to follower
    getDoc(useUserFollowerDocRef(user_id, user.id)).then(async (res) => {
      const unfollowed_at = res.data()?.unfollowed_at ?? null
      await setDoc(useUserFollowerDocRef(user_id, user.id), {
        followed_at: Timestamp.now(),
        has_follow: true,
        subject: getAuthor().author,
        unfollowed_at,
      })
      if (++set == 2) resolve(true)
    })

    // add to following
    getDoc(useUserFollowingDocRef(user.id, user_id)).then(async (res) => {
      const unfollowing_at = res.data()?.unfollowing_at ?? null
      await setDoc(useUserFollowingDocRef(user.id, user_id), {
        following_at: Timestamp.now(),
        has_following: true,
        subject: getAuthor().author,
        unfollowing_at,
      })
      if (++set == 2) resolve(true)
    })
  })
}

// unfollow user
export async function unfollowUser(user_id: string) {
  const user = useAuthUser()
  getDoc(useUserFollowerDocRef(user_id, user.id)).then(() => {
    setDoc(
      useUserFollowerDocRef(user_id, user.id),
      {
        has_follow: false,
        subject: getAuthor().author,
        unfollowed_at: Timestamp.now(),
      },
      { merge: true }
    )
  })

  getDoc(useUserFollowingDocRef(user.id, user_id)).then(() => {
    setDoc(
      useUserFollowingDocRef(user.id, user_id),
      {
        has_following: false,
        subject: getAuthor().author,
        unfollowing_at: Timestamp.now(),
      },
      { merge: true }
    )
  })
}

export async function getUserInter(quiz_id: string) {
  const { count, rows } = await getDocumentList(useUserIntersCol(), {
    filter: { 'quiz.id': quiz_id },
  })
  if (count) return rows[0]

  const quiz = await getQuiz(quiz_id)
  const { getQuiz: _getQuiz } = useQuizStore()
  return await addDocument(
    useUserIntersCol(),
    { ..._getQuiz(quiz) },
    { withoutTimestamps: true }
  )
}

export async function setLikesQuiz(quiz_id: string) {
  const userInter = await getUserInter(quiz_id)
  const _collection = `${USER_INTERS}/${userInter.id}/quiz_likes`
  const { empty, docs, size } = await getDocs<QuizLiked>(
    query(useColRef(_collection), where('quiz.uid', '==', quiz_id))
  )
  if (empty) {
    await addDocument<QuizLiked>(
      useColRef(_collection),
      { quiz: userInter.quiz },
      { withoutAuthor: true }
    )
    return size + 1
  } else {
    await deleteDoc(useDocRef(_collection, docs[0].id))
    return size - 1
  }
}
