<template>
  <div class="auth-page" :style="authThemeStyle">
    <el-card class="auth-card" shadow="always">
      <h1>病例端登录</h1>
      <p>欢迎来到 MedCase 病例端</p>
      <el-form label-position="top" @submit.prevent="handleLogin">
        <div class="user-type-field">
          <div class="user-type-buttons" role="radiogroup" aria-label="用户类型">
            <button
              v-for="option in USER_TYPE_OPTIONS"
              :key="option.value"
              type="button"
              class="user-type-button"
              :class="{ 'is-active': form.userType === option.value }"
              role="radio"
              :aria-checked="form.userType === option.value"
              @click="selectUserType(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="captcha-field">
            <el-input v-model="form.code" placeholder="请输入验证码" />
            <img
              v-if="captchaImage"
              class="captcha-image"
              :src="captchaImage"
              alt="验证码"
              @click="loadCaptcha"
            />
          </div>
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          登录
        </el-button>
      </el-form>
      <div class="auth-actions">
        <router-link to="/register">注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCaptcha } from '@/api/user/auth'
import useUserStore from '@/stores/user'
import {
  getPreferredUserType,
  getUserTypeTheme,
  setPreferredUserType,
  USER_TYPE_OPTIONS
} from '@/utils/userTypePreference'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const captchaImage = ref('')

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
  userType: getPreferredUserType()
})

const currentTheme = computed(() => getUserTypeTheme(form.userType))
const authThemeStyle = computed(() => ({
  '--auth-primary': currentTheme.value.primary,
  '--auth-primary-hover': currentTheme.value.primaryHover,
  '--auth-primary-active': currentTheme.value.primaryActive,
  '--auth-primary-soft': currentTheme.value.primarySoft,
  '--auth-border': currentTheme.value.border,
  '--auth-shadow': currentTheme.value.shadow,
  '--auth-background': currentTheme.value.background
}))

function selectUserType(userType) {
  form.userType = setPreferredUserType(userType)
}

async function loadCaptcha() {
  const result = await getCaptcha()
  form.uuid = result.uuid || ''
  captchaImage.value = result.img ? `data:image/jpeg;base64,${result.img}` : ''
}

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(form)
    await router.replace(route.query.redirect || '/home')
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--auth-background);
  transition: background 0.2s ease;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--auth-border);
  border-top: 4px solid var(--auth-primary);
  box-shadow: var(--auth-shadow);
}

:deep(.el-button--primary) {
  --el-button-bg-color: var(--auth-primary);
  --el-button-border-color: var(--auth-primary);
  --el-button-hover-bg-color: var(--auth-primary-hover);
  --el-button-hover-border-color: var(--auth-primary-hover);
  --el-button-active-bg-color: var(--auth-primary-active);
  --el-button-active-border-color: var(--auth-primary-active);
}

h1 {
  margin: 0 0 8px;
}

p {
  margin: 0 0 20px;
  color: #666;
}

.auth-actions {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;

  :deep(a) {
    color: var(--auth-primary-hover);
  }
}

.user-type-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.user-type-field {
  margin-bottom: 18px;
}

.user-type-button {
  min-height: 42px;
  border: 1px solid var(--auth-border);
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.user-type-button:hover {
  border-color: var(--auth-primary);
  color: var(--auth-primary);
  box-shadow: 0 6px 16px rgb(15 23 42 / 10%);
}

.user-type-button.is-active {
  border-color: var(--auth-primary);
  background: var(--auth-primary);
  color: #fff;
  box-shadow: 0 10px 20px rgb(15 23 42 / 16%);
}

.captcha-field {
  display: flex;
  gap: 12px;
}

.captcha-image {
  width: 120px;
  height: 32px;
  cursor: pointer;
  object-fit: cover;
}
</style>
