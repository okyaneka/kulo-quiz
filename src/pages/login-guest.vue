<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'

  const form = ref<any>({})
</script>

<template>
  <el-row align="middle" justify="center" style="min-height: 100vh">
    <el-col :span="16" :xs="24">
      <el-card>
        <el-space :size="32" direction="vertical" fill>
          <el-space />
          <el-row justify="center">
            <el-col :span="16">
              <el-image :src="LOGO" style="" />
            </el-col>
          </el-row>

          <h1 align="center">You can enjoy us as a guest.</h1>

          <el-form :model="form">
            <el-form-item>
              <el-input
                v-model="form.name"
                placeholder="Just tell me your name."
              />
            </el-form-item>

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%"
            >
              <el-button type="primary" native-type="submit"
                >Login as a Guest</el-button
              >
            </el-space>
          </el-form>
        </el-space>
      </el-card>
    </el-col>
  </el-row>
</template>
