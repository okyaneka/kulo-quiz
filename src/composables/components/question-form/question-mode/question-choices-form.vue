<script setup lang="ts">
  import { Close, QuestionFilled } from '@element-plus/icons-vue'
  import type {
    Choice,
    ChoicesQuestionPayload,
  } from '~/apps/question/question.types'

  type PayloadData = Partial<ChoicesQuestionPayload>

  const blankChoice: Choice = {
    key: 0,
    text: '',
    image_url: null,
  }

  const props = defineProps<{
    value: PayloadData
    errors?: { [key: string]: string }
  }>()

  defineEmits<{
    (e: 'update:value', value: PayloadData): void
  }>()

  const choiceInput = ref()

  const { value: question } = useField<PayloadData['question']>('question')
  const { value: choices } = useField<PayloadData['choices']>('choices')
  const { value: correct_answer } =
    useField<PayloadData['correct_answer']>('correct_answer')

  function handleAddOption() {
    if (choices.value)
      choices.value.push({ ...blankChoice, key: choices.value.length })
    else choices.value = [{ ...blankChoice }]
    nextTick().then(() => {
      const input = choiceInput.value.slice().pop() as HTMLInputElement
      input.focus()
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

  const correctAnswerValue = ref<boolean[]>([])

  function setCorrectAnswer() {
    correct_answer.value = correctAnswerValue.value
      .map((v, i) => ({ value: i, selected: v }))
      .filter((v) => v.selected)
      .map((v) => v.value)
  }

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

  <template v-if="errors?.choices || errors?.correct_answer">
    <p
      style="
        color: var(--el-color-error);
        font-size: var(--el-font-size-extra-small);
      "
    >
      {{ errors?.choices || errors?.correct_answer }}
    </p>
  </template>

  <el-form-item
    v-for="(option, index) in choices"
    :key="`option-${index}`"
    :error="errors ? errors[`choices[${index}].text`] : ''"
    :label="index == 0 ? 'Options' : ''"
  >
    <el-row align="middle" style="width: 100%; flex-wrap: nowrap">
      <el-input
        ref="choiceInput"
        v-model="option.text"
        style="width: 100%; margin-right: 16px"
      >
        <template #append>
          <el-space>
            <el-checkbox
              v-model="correctAnswerValue[option.key]"
              @change="setCorrectAnswer"
            ></el-checkbox>
            <el-tooltip effect="dark" content="Choose the correct answer!">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </el-space>
        </template>
      </el-input>
      <el-button size="small" circle @click="handleDeleteOption(index)">
        <template #icon>
          <el-icon :size="12" color="var(--el-text-color-primary)">
            <close />
          </el-icon>
        </template>
      </el-button>
    </el-row>
  </el-form-item>

  <el-button @click="handleAddOption">Add Options</el-button>
</template>

<style scoped>
  .el-input-group__append {
    padding: 30px;
  }
</style>
