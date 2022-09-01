<route lang="yaml">
meta:
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'
  import { Hide, View } from '@element-plus/icons-vue'
  import { login, type LoginPayload } from '~/apps/auth/auth.repository'
  import { LoginScheme } from '~/apps/auth/auth.shceme'

  const router = useRouter()

  const { errors, validate, values } = useForm<LoginPayload>({
    validationSchema: LoginScheme,
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

          <h1 align="center">Hei, I miss you so much! Let's go back!</h1>

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

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%; margin-top: 18px"
            >
              <el-button type="primary" native-type="submit">Login</el-button>
              <p align="center">
                <router-link to="/forgot-password">
                  I forget my password
                </router-link>
              </p>
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
        Doesn't have an account?
        <router-link to="/">Register here.</router-link>
      </p>
    </el-col>
  </el-row>
</template>
