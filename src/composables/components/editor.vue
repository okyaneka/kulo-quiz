<script setup lang="ts">
  import Editor from '@tinymce/tinymce-vue'

  const EDITOR_KEY = import.meta.env.VITE_EDITOR_KEY

  const props = defineProps({
    modelValue: { type: String },
  })

  const emit = defineEmits(['update:modelValue'])

  const model = computed({
    get: () => {
      return props.modelValue
    },
    set: (data) => {
      emit('update:modelValue', data)
    },
  })
</script>

<template>
  <editor
    v-model="model"
    :api-key="EDITOR_KEY"
    :init="{
      menubar: false,
      plugins: ['lists', 'fullscreen'],
      content_style:
        '@import url(\'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\');' +
        'body{font-size:16px;font-family:\'Lato\',sans-serif}' +
        'h1{font-size:2em}h2{font-size:1.75em}h3{font-size:1.5em}h4{font-size:1.125em}h5{font-size:1em}h6{font-size:.875em}' +
        'h1,h2,h3,h4,h5,h6,li,p,ul{margin:0}',
      toolbar:
        'undo redo | formatselect | bold italic underline | bullist numlist | fullscreen ',
    }"
  />
</template>
