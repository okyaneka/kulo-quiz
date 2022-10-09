<script setup lang="ts">
  // const isDark = useDark()

  // const toggleDark = useToggle(isDark)
  const { isNotFound } = storeToRefs(useNotfoundStore())
</script>

<template>
  <el-container v-if="isNotFound">
    <el-main>
      <el-space fill style="min-height: 100vh; width: 100%">
        <el-card style="display: flex; justify-content: center">
          <el-empty description="page_not_found"></el-empty>
        </el-card>
      </el-space>
    </el-main>
  </el-container>
  <router-view v-else />
</template>
