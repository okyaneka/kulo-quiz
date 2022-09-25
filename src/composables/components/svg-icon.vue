<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      prefix?: string
      name: string
      color?: string
    }>(),
    {
      prefix: 'icon',
      color: 'currentColor',
    }
  )

  const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<template>
  <svg
    aria-hidden="true"
    :style="{ height: '100%', width: '100%', verticalAlign: 'initial' }"
  >
    <use :href="symbolId" :style="{ color }" />
  </svg>
</template>
