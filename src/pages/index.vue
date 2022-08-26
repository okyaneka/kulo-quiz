<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'
  import { Hide, View } from '@element-plus/icons-vue'

  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)
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

          <h1 align="center">Yeay! You're the choosen one! Come join us!</h1>

          <el-form :model="form">
            <el-form-item>
              <el-input v-model="form.email" placeholder="Email" type="email" />
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
              >
                <template #suffix>
                  <el-button
                    circle
                    size="small"
                    text
                    :icon="showPassword ? Hide : View"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="form.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Password Confirmation"
              >
                <template #suffix>
                  <el-button
                    circle
                    size="small"
                    text
                    :icon="showConfirmPassword ? Hide : View"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </el-input>
            </el-form-item>

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%"
            >
              <el-button type="primary" native-type="submit"
                >Register</el-button
              >
              <p
                align="center"
                style="
                  color: var(--el-text-color-secondary);
                  font-size: var(--el-font-size-extra-small);
                "
              >
                or
              </p>
              <router-link to="/login-guest">
                <el-button style="width: 100%">Try as a guest</el-button>
              </router-link>
            </el-space>
          </el-form>
        </el-space>
      </el-card>

      <p align="center" style="margin-top: 32px">
        Already have an account?
        <router-link to="/login"> Login here. </router-link>
      </p>
    </el-col>
  </el-row>
</template>
