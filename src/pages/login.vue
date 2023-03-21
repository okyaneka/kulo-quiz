<route lang="yaml">
meta:
  name: Login
  noRequireAuth: true
</route>

<script setup lang="ts">
  import { Hide, View } from '@element-plus/icons-vue'
  import { login } from '~/apps/auth/auth.repository'
  import type { LoginPayload } from '~/apps/auth/auth.types'
  import { useLoginScheme } from '~/apps/auth/auth.shceme'

  const router = useRouter()

  const { errors, validate, values } = useForm<LoginPayload>({
    validationSchema: toFormValidator(z.object(useLoginScheme()._def.shape())),
  })
  const { value: email } = useField<string>('email')
  const { value: password } = useField<string>('password')

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      ElMessage.success('Login success.')
      router.push('/home')
    },
  })

  const showPassword = ref<boolean>(false)

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
          <h1 align="center">Login with password</h1>

          <el-form @submit.prevent="handleSubmit()">
            <el-form-item :error="errors.email">
              <el-input v-model="email" placeholder="Email" type="email" />
            </el-form-item>

            <el-form-item :error="errors.password">
              <el-input
                v-model="password"
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
            <p align="right">
              <router-link to="/forgot-password">
                I forget my password
              </router-link>
            </p>

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
        Doesn't have an account?
        <router-link to="/">Register here.</router-link>
      </p>
    </el-col>
  </el-row>
</template>
