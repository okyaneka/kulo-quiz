<route lang="yaml">
name: edit-questions
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { Plus, Close, FullScreen, Minus } from '@element-plus/icons-vue'
  import QuestionForm from '~/components/question/question-form.vue'
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'
  import { deleteQuestion } from '~/apps/question/question.repositories'

  const props = defineProps<{ validate?: boolean }>()
  const emit = defineEmits<{
    (e: 'update:validate', value: boolean): void
  }>()

  const isValidate = computed({
    get: () => {
      return props.validate ?? false
    },
    set: (value: boolean) => {
      emit('update:validate', value)
    },
  })

  const { questions } = storeToRefs(useQuizStore())

  const lastScrollPos = ref<number>(0)
  const isShowNav = ref<boolean>(true)
  const openQuestion = ref()

  function handleAddQuestion() {
    questions.value.push({
      guide: '',
      image_url: null,
      timer: null,
    })
  }

  async function handleDeleteQuestion(index: number) {
    const id = questions.value[index].id
    if (id != undefined) await deleteQuestion(id)
    questions.value.splice(index, 1)
  }

  function onscroll() {
    const currentScrollPos = window.scrollY
    const isBottomOfPage =
      window.scrollY + window.innerHeight == document.body.scrollHeight

    if (lastScrollPos.value > currentScrollPos || isBottomOfPage) {
      isShowNav.value = true
    } else if (isShowNav.value) {
      isShowNav.value = false
    }
    lastScrollPos.value = currentScrollPos
  }

  onMounted(() => {
    if (questions.value.length == 0) handleAddQuestion()
    window.addEventListener('scroll', onscroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onscroll)
  })
</script>

<template>
  <el-card>
    <h3 style="margin-bottom: 16px">Questions</h3>

    <el-collapse class="custom-header" v-model="openQuestion" accordion>
      <template
        v-for="(question, index) in questions"
        :key="`question-${index}`"
      >
        <el-collapse-item
          v-if="question"
          :name="`question-${index}`"
          :title="`Pertanyaan #${index + 1}`"
        >
          <template #title>
            <h5>Question {{ index + 1 }}</h5>
            <el-popconfirm
              hide-icon
              title="Are you sure to delete this?"
              @confirm="handleDeleteQuestion(index)"
            >
              <template #reference>
                <el-icon
                  :size="24"
                  hide-icon
                  style="margin-left: auto"
                  @click.stop=""
                >
                  <svg-icon
                    color="var(--el-color-danger-light-3)"
                    name="close-circle"
                  />
                </el-icon>
              </template>
            </el-popconfirm>
          </template>

          <question-form
            v-model:value="questions[index]"
            v-model:validate="isValidate"
          ></question-form>
        </el-collapse-item>
      </template>
    </el-collapse>
  </el-card>

  <el-button
    :icon="Plus"
    ref="buttonRef"
    circle
    size="large"
    :style="{ bottom: isShowNav ? '168px' : '128px' }"
    style="
      z-index: 998;
      position: fixed;
      right: 16px;
      transition: bottom 0.3s ease-in;
    "
    @click="handleAddQuestion"
  />
</template>
