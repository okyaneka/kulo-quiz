import { useDocRef } from '~/plugins/firebase'
import type { Config } from './config.types'

const CONFIGS = 'configs'

function useConfigDocRef(id: string) {
  return useDocRef<Config>(CONFIGS, id)
}

// export async function getConfig(id: string): Promise<Partial<Config>> {
//   const doc = await getDoc(useConfigDocRef(id))

//   if (!doc.exists()) {
//     await setDoc(useConfigDocRef(id), getTimestamps())
//     return await getConfig(id)
//   }

//   const { config } = storeToRefs(useQuizStore())
//   config.value = await getDocument(useConfigDocRef(id))

//   return config.value
// }

export async function setConfig(id: string, payload: Partial<Config>) {
  return await setDocument(useConfigDocRef(id), payload)
}

// async function useQuizConfigDoc(quiz_id: string) {
//   const user = useAuthUser()

//   // find config
//   const { empty, docs } = await getDocs(
//     query(useQuizConfigRef(), where('quiz.id', '==', quiz_id))
//   )

//   // create config if empty
//   if (empty) {
//     const { quiz } = useQuizStore()
//     if (!quiz) throw new Error('quiz_undefined')

//     const payload: QuizConfigPayloadData = {
//       author: {
//         uid: user.uid,
//         displayName: user.displayName as string,
//         email: user.email as string,
//       },
//       quiz: {
//         id: quiz.id,
//         title: quiz.title,
//       },
//       created_at: Timestamp.fromDate(new Date()),
//       updated_at: Timestamp.fromDate(new Date()),
//     }
//     return await addDoc(useQuizConfigRef(), payload)
//   } else {
//     return doc(useFirestore(), QUIZ_CONFIGS, docs[0].id)
//   }
// }

// export async function getQuizConfig(
//   id: string
// ): Promise<QuizConfig | QuizConfigPayloadData> {
//   const doc = await getDoc<QuizConfigPayloadData>(await useQuizConfigDoc(id))

//   if (!doc.exists()) throw new Error('quiz_config_undefined')

//   const data = { ...doc.data(), id: doc.id }
//   // const data: QuizConfig = {}

//   const { config } = storeToRefs(useQuizStore())
//   config.value = data

//   return config.value
// }

// export async function setQuizConfig(id: string, payload: QuizConfigPayload) {
//   const docRef = await useQuizConfigDoc(id)

//   Object.assign(payload, { updated_at: Timestamp.fromDate(new Date()) })

//   await setDoc(docRef, payload, { merge: true })

//   return await getQuizConfig(id)
// }
