<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import draggable from 'vuedraggable'
  import type QuestionForm from '~/composables/components/question-form/question-form.vue'
  import { Plus, Close } from '@element-plus/icons-vue'
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'
  import { deleteQuestion } from '~/apps/question/question.repositories'
  import SvgIcon from '~/composables/components/svg-icon.vue'

  const props = defineProps<{ validate?: boolean; disabled?: boolean }>()
  const emit = defineEmits<{
    (e: 'update:validate', value: boolean): void
  }>()

  const { questions } = storeToRefs(useQuizStore())
  const forms = ref<(InstanceType<typeof QuestionForm> | null)[]>([])

  const lastScrollPos = ref<number>(0)
  const isShowNav = ref<boolean>(true)
  const openQuestion = ref()
  const questionsValid = ref<boolean[]>([])

  const isValidate = computed({
    get: () => {
      return props.validate ?? false
    },
    set: (value: boolean) => {
      emit('update:validate', value)
    },
  })

  function handleAddQuestion() {
    const index = questions.value.push({
      seq: questions.value.length,
      guide: '',
      image_url: null,
    })

    openQuestion.value = `question-${index - 1}`
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

  function validate() {
    // return new Promise((res) => {

    forms.value.forEach((v) => {
      if (v != null) v.validate()
    })
    // })
  }

  watch(isValidate, async () => {
    validate()
    await nextTick()
    emit('update:validate', false)
  })

  defineExpose({ validate })

  onMounted(() => {
    if (questions.value.length == 0) handleAddQuestion()
    window.addEventListener('scroll', onscroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onscroll)
  })
</script>

<template>
  <h3 style="margin-bottom: 16px">Questions</h3>

  <el-collapse class="custom-header" v-model="openQuestion" accordion>
    <draggable
      v-model="questions"
      item-key="id"
      tag="el-collapse"
      :animation="200"
      handle=".handle"
    >
      <template #item="{ index }">
        <el-collapse-item
          :name="`question-${index}`"
          :title="`Pertanyaan #${index + 1}`"
          :key="questions[index].id"
        >
          <template #title>
            <el-button
              class="handle"
              circle
              style="margin-right: 8px; border: none"
              @click.stop=""
            >
              <el-icon>
                <svg-icon name="arrow-swap"></svg-icon>
              </el-icon>
            </el-button>

            <h5>Question {{ index + 1 }}</h5>
            <!-- <el-tooltip>
              <template #content>
                <span>{{ questions[index].question }}</span>
              </template>
            </el-tooltip> -->
            <el-popover v-if="questionsValid[index] == false">
              <template #reference>
                <el-icon
                  :size="20"
                  style="margin-left: 1rem"
                  color="#1a73e8"
                  @click.stop=""
                >
                  <svg-icon name="info-circle" />
                </el-icon>
              </template>
              <p align="center">This question is not valid yet.</p>
            </el-popover>

            <el-popconfirm
              hide-icon
              title="Are you sure to delete this?"
              @confirm="handleDeleteQuestion(index)"
            >
              <template #reference>
                <el-button
                  size="small"
                  circle
                  plain
                  type="danger"
                  style="margin-left: auto"
                  @click.stop=""
                  :icon="Close"
                >
                </el-button>
              </template>
            </el-popconfirm>
          </template>

          <question-form
            ref="forms"
            v-model:value="questions[index]"
            v-model:is-valid="questionsValid[index]"
            :disabled="disabled"
          ></question-form>
        </el-collapse-item>
      </template>
    </draggable>
  </el-collapse>

  <el-button
    :icon="Plus"
    circle
    size="large"
    style="z-index: 998; position: fixed; right: 16px; bottom: 168px"
    @click="handleAddQuestion"
  ></el-button>
</template>
