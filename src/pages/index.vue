<route lang="yaml">
meta:
  name: Register / Login
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'
  import { Hide, View } from '@element-plus/icons-vue'
  import { register } from '~/apps/auth/auth.repository'
  import { useRegisterScheme } from '~/apps/auth/auth.shceme'
  import type { RegisterPayload } from '~/apps/auth/auth.types'

  const router = useRouter()

  const { errors, validate, values, resetForm } = useForm<RegisterPayload>({
    validationSchema: toFormValidator(
      z.object(useRegisterScheme()._def.shape())
    ),
  })
  const { value: email } = useField<string>('email')
  // const { value: password } = useField<string>('password')
  // const { value: password_confirmation } = useField<string>(
  //   'password_confirmation'
  // )

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      ElMessage.success('Check your email to continue.')
      resetForm()
    },
  })

  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)

  async function handleSubmit() {
    if ((await validate()).valid) {
      mutate(values)
    }
  }
</script>

<template>
  <el-row align="middle" justify="center" style="min-height: 100vh">
    <el-col :span="24" :md="20" style="max-width: 480px; padding: 20px">
      <el-card
        v-loading="isLoading"
        :body-style="{ padding: '2rem 1.5rem' }"
        style="margin-bottom: 20px"
      >
        <el-space :size="24" direction="vertical" fill style="width: 100%">
          <h1 align="center">Register / Login</h1>

          <el-form @submit.prevent="handleSubmit()">
            <el-form-item :error="errors.email">
              <el-input v-model="email" placeholder="Email" type="email" />
            </el-form-item>

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%; margin-top: 18px"
            >
              <el-button type="primary" native-type="submit">Send</el-button>
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
      <p align="center">
        Already have an account? <br />
        <router-link to="/login"> Login with password here. </router-link>
      </p>
    </el-col>
  </el-row>
</template>
