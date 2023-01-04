<script setup lang="ts">
  import draggable from 'vuedraggable'
  import { Close, QuestionFilled } from '@element-plus/icons-vue'
  import type {
    Choice,
    ChoicesQuestion,
    ChoicesQuestionPayload,
    QuestionPayload,
    Questions,
  } from '~/apps/question/question.types'
  import { ChoicesQuestionPayloadScheme } from '~/apps/question/question.schemes'

  const blankChoice: Choice = {
    key: 0,
    text: '',
    image_url: null,
  }

  const props = defineProps<{
    value: Partial<ChoicesQuestion>
    errors?: { [key: string]: string }
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: Partial<ChoicesQuestion>): void
  }>()

  const choiceInput = ref()
  const correctAnswerValue = ref<{ [key: number]: boolean }>({})

  const { values, errors, validate } = useForm<
    Omit<ChoicesQuestionPayload, keyof QuestionPayload>
  >({
    validationSchema: toFormValidator(
      z.object(ChoicesQuestionPayloadScheme._def.shape())
    ),
  })
  const { value: question } = useField<string | null>('question')
  const { value: choices } = useField<Choice[] | null>('choices')
  const { value: correct_answer } = useField<number[] | null>('correct_answer')

  function handleAddOption() {
    if (choices.value)
      choices.value.push({ ...blankChoice, key: choices.value.length })
    else choices.value = [{ ...blankChoice }]
    nextTick().then(() => {
      choiceInput.value?.focus()
    })
  }

  function handleDeleteOption(index: number) {
    if (choices.value) {
      choices.value.splice(index, 1)
      choices.value.slice(index).forEach((choice, i) => {
        choice.key = index + i
      })
    }
  }

  function setCorrectAnswer() {
    correct_answer.value = Object.entries(correctAnswerValue.value)
      .filter((v) => v[1])
      .map((v) => parseInt(v[0]))
  }

  function updateModel() {
    validate()
    const value = Object.assign({}, props.value, values)
    emit('update:value', value)
  }

  watch(correctAnswerValue, () => setCorrectAnswer(), { deep: true })
  watch(question, () => updateModel())
  watch(choices, () => updateModel(), { deep: true })
  watch(correct_answer, () => updateModel())

  onMounted(() => {
    question.value = props.value?.question ?? ''
    choices.value = props.value?.choices ?? [{ ...blankChoice }]
    choices.value.forEach((v) => {
      correctAnswerValue.value[v.key] =
        props.value.correct_answer?.includes(v.key) ?? false
    })
  })
</script>

<template>
  <el-form-item label="Question" :error="errors?.question">
    <el-input v-model="question" type="textarea"></el-input>
  </el-form-item>

  <el-form-item
    label="Options"
    :error="errors?.choices || errors?.correct_answer"
  >
  </el-form-item>
  <draggable
    v-if="choices != undefined"
    v-model="choices"
    item-key="key"
    :animation="200"
    handle=".el-input-group__prepend"
  >
    <template #item="{ index }">
      <el-form-item
        :key="choices[index].key"
        :error="errors ? errors[`choices[${index}].text`] : ''"
        style="margin-bottom: 18px"
      >
        <el-row align="middle" style="width: 100%; flex-wrap: nowrap">
          <el-input
            ref="choiceInput"
            v-model="choices[index].text"
            style="width: 100%; margin-right: 16px"
          >
            <template #prepend>
              <el-icon><svg-icon name="arrow-swap" /></el-icon>
            </template>
            <template #append>
              <el-space>
                <el-checkbox
                  v-model="correctAnswerValue[choices[index].key]"
                ></el-checkbox>
                <el-tooltip effect="dark" content="Choose the correct answer!">
                  <el-icon>
                    <question-filled />
                  </el-icon>
                </el-tooltip>
              </el-space>
            </template>
          </el-input>
          <el-button
            size="small"
            circle
            @click="handleDeleteOption(index)"
            tabindex="-1"
          >
            <template #icon>
              <el-icon :size="12" color="var(--el-text-color-primary)">
                <close />
              </el-icon>
            </template>
          </el-button>
        </el-row>
      </el-form-item>
    </template>
  </draggable>
  <el-button @click="handleAddOption">Add Options</el-button>
</template>
