<script setup lang="ts">
  // const isDark = useDark()

  // const toggleDark = useToggle(isDark)
  const { isNotFound } = storeToRefs(useNotfoundStore())

  const route = useRoute()

  watch(
    () => route.fullPath,
    () => (isNotFound.value = false)
  )
</script>

<template>
  <el-container v-if="isNotFound">
    <el-main>
      <el-row>
        <el-col style="padding: 20px">
          <el-card style="display: flex; justify-content: center">
            <el-empty description="page_not_found"></el-empty>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
  <router-view v-else />
</template>
