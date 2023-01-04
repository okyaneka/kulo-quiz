<script lang="ts" setup>
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import Default from './default.vue'
  import Private from './private.vue'

  const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <default v-if="!user"></default>
  <private v-else></private>
</template>
