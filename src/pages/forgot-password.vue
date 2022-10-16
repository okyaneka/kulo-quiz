<route lang="yaml">
meta:
  noRequireAuth: true
</route>

<script setup lang="ts">
  import { forgetPassword } from '~/apps/auth/auth.repository'
  import { useForgotPasswordScheme } from '~/apps/auth/auth.shceme'
  import type { ForgotPasswordPayload } from '~/apps/auth/auth.types'

  const { errors, validate, values } = useForm<ForgotPasswordPayload>({
    validationSchema: toFormValidator(
      z.object(useForgotPasswordScheme()._def.shape())
    ),
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
  <el-row align="middle" justify="center" style="min-height: 100vh">
    <el-col :span="24" :md="20" style="max-width: 480px">
      <el-card
        v-loading="isLoading"
        :body-style="{ padding: '2rem 1.5rem' }"
        style="margin-bottom: 20px"
      >
        <el-space :size="32" direction="vertical" fill>
          <template v-if="!sent">
            <h1 align="center">Forget password.</h1>

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

      <p align="center">
        Or you can <router-link to="/login">Login</router-link> /
        <router-link to="/">Register</router-link>.
      </p>
    </el-col>
  </el-row>
</template>
