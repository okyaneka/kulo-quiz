<script setup lang="ts">
  import { Close, QuestionFilled } from '@element-plus/icons-vue'
  import type { ChoicesQuestionPayload } from '~/apps/question/question.types'

  type QOptionsPayload = Pick<ChoicesQuestionPayload, 'question' | 'choices'>
  type ChoicesQuestionPayloadData = Partial<ChoicesQuestionPayload>

  const blankChoice: ChoicesQuestionPayload['choices'][0] = {
    text: '',
    is_true: false,
    image_url: null,
  }

  const props = defineProps<{ value: ChoicesQuestionPayloadData }>()
  const emits = defineEmits<{
    (e: 'update:value', value: ChoicesQuestionPayloadData): void
  }>()

  const values = computed({
    get() {
      return props.value ?? { question: '', choices: [] }
    },
    set(value) {
      if (value != undefined) emits('update:value', value)
    },
  })

  // })
  const { value: question } = useField<QOptionsPayload['question']>('question')
  const { value: choices } = useField<QOptionsPayload['choices']>('choices')

  function handleAddOption() {
    if (choices.value) choices.value.push({ ...blankChoice })
    else choices.value = [{ ...blankChoice }]
  }

  function handleDeleteOption(index: number) {
    if (choices.value) choices.value.splice(index, 1)
  }

  watch(question, (value) => {
    values.value.question = value
  })
  watch(choices, (value) => {
    values.value.choices = value
  })

  onMounted(() => {
    question.value = props.value?.question ?? ''
    choices.value = props.value?.choices ?? [{ ...blankChoice }]
  })
</script>

<template>
  <el-form-item label="Question">
    <el-input v-model="question" type="textarea"></el-input>
  </el-form-item>

  <el-form-item label="Options">
    <el-row
      v-for="(option, index) in choices"
      :key="`option-${index}`"
      align="middle"
      style="width: 100%; flex-wrap: nowrap"
    >
      <el-input v-model="option.text" style="width: 100%; margin-right: 16px">
        <template #append>
          <el-space>
            <el-checkbox v-model="option.is_true" />
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
