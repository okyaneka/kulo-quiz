import { addDocument, getDocumentList } from '~/composables/repositories'
import type { ResponseRowsPayload } from '~/composables/types/interfaces'
import { useColRef, useDocRef } from '~/plugins/firebase'
import type {
  Topic,
  TopicFilterable,
  TopicOrderable,
  TopicPayload,
} from './topic.types'

const QUIZ_TOPICS = 'quiz_topics'

function useTopicColRef() {
  return useColRef<Topic>(QUIZ_TOPICS)
}

function useTopicDocRef(id: string) {
  return useDocRef<Topic>(QUIZ_TOPICS, id)
}

async function getFullTitle(
  payload: TopicPayload,
  title: Topic['title']
): Promise<Topic['fulltitle']> {
  if (payload.parent) {
    const topic = await getTopic(payload.parent.id)
    return getFullTitle(topic, topic.title + ' / ' + title)
  } else return title
}

export async function addTopic(payload: TopicPayload): Promise<Topic> {
  const fulltitle = await getFullTitle(payload, payload.title)

  return await addDocument<Topic, TopicPayload & { fulltitle: string }>(
    useColRef(QUIZ_TOPICS),
    { ...payload, fulltitle }
  )
}

export async function getTopicList(
  payload: ResponseRowsPayload<TopicFilterable, TopicOrderable>
) {
  return await getDocumentList(useTopicColRef(), payload)
}

export async function getTopic(id: string) {
  return await getDocument(useTopicDocRef(id))
}

export async function setTopic(id: string, payload: Partial<TopicPayload>) {
  return await setDocument(useTopicDocRef(id), payload)
}
