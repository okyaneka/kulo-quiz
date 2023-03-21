<route lang="yaml">
meta:
  layout: prefer-private
</route>

<script setup lang="ts">
  import type { UserData } from '~/apps/auth/auth.types'
  import { useColRef } from '~/plugins/firebase'

  const users = ref<UserData[]>([])

  async function fetchAllUsers() {
    users.value = []
    const data = await getDocs<UserData>(query(useColRef('users')))
    if (!data.empty) {
      data.forEach((res) => {
        users.value.push(res.data())
      })
    }
  }

  onMounted(() => {
    fetchAllUsers()
  })
</script>

<template>
  <el-table :data="users">
    <el-table-column label="username" prop="username">
      <template #default="{ row }">
        <router-link
          :to="{ name: 'u-username', params: { username: row.username } }"
        >
          {{ row.username }}
        </router-link>
      </template>
    </el-table-column>
  </el-table>
</template>
