<route lang="yaml">
meta:
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'

  import {
    forgetPassword,
    type ForgotPasswordPayload,
  } from '~/apps/auth/auth.repository'
  import { ForgotPasswordScheme } from '~/apps/auth/auth.shceme'

  const { errors, validate, values } = useForm<ForgotPasswordPayload>({
    validationSchema: ForgotPasswordScheme,
  })
  const { value: email } = useField<string>('email')

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgetPassword(payload),
    onSuccess: () => {
      ElMessage.success('Email sent.')
      sent.value = true
    },
  })

  const sent = ref<boolean>(false)

  async function handleSubmit() {
    if ((await validate()).valid) {
      mutate(values)
    }
  }
</script>

<template>
  <el-row
    align="middle"
    justify="center"
    style="min-height: 100vh; padding: var(--el-main-padding) 0"
  >
    <el-col :span="24" :lg="16" :md="20">
      <el-card v-loading="isLoading">
        <el-space :size="32" direction="vertical" fill>
          <el-space />
          <el-row justify="center">
            <el-col :span="16">
              <el-image :src="LOGO" style="" />
            </el-col>
          </el-row>

          <template v-if="!sent">
            <h1 align="center">Oh, you forget your password.</h1>

            <el-form @submit.prevent="handleSubmit()">
              <el-form-item :error="errors.email">
                <el-input
                  v-model="email"
                  placeholder="Don't worry, just tell us your email here."
                />
              </el-form-item>

              <el-space
                direction="vertical"
                fill
                :fill-ratio="100"
                style="width: 100%; margin-top: 18px"
              >
                <el-button type="primary" native-type="submit"
                  >Here is my email</el-button
                >
              </el-space>
            </el-form>
          </template>
          <template v-else>
            <h1 align="center">Email has sent to your account.</h1>
            <p align="center">if you haven't received the email.</p>
            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%"
            >
              <el-button type="primary" @click="sent = false"
                >Resend the email please!</el-button
              >
            </el-space>
          </template>
        </el-space>
      </el-card>

      <p align="center" style="margin-top: 32px">
        Or you can <router-link to="/login">Login</router-link> /
        <router-link to="/">Register</router-link>.
      </p>
    </el-col>
  </el-row>
</template>
