<template>
  <div class="auth-page" :style="authThemeStyle">
    <el-card class="auth-card" shadow="always">
      <h1>病例端注册</h1>
      <p>创建 MedCase 病例端账号。</p>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户类型" prop="userType" required>
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
        </el-form-item>
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" required>
          <el-input v-model="form.phone" type="tel" maxlength="11" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="短信验证码" prop="smsCode" required>
          <div class="sms-code-field">
            <el-input v-model="form.smsCode" maxlength="6" placeholder="请输入验证码" />
            <el-button
              type="primary"
              :disabled="smsCodeSending || smsCountdown > 0"
              :loading="smsCodeSending"
              @click="handleSendSmsCode"
            >
              {{ smsCountdown > 0 ? `${smsCountdown} 秒后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-button class="register-submit" type="primary" native-type="submit" :loading="loading">
          注册
        </el-button>
      </el-form>
      <div class="auth-actions">
        <router-link to="/login">已有账号，去登录</router-link>
      </div>
    </el-card>

    <el-dialog
      v-model="registerSuccessVisible"
      title="注册成功"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      align-center
    >
      <p class="register-success-message">
        账号注册成功，{{ remainingSeconds }} 秒后自动跳转到登录页面。
      </p>
      <template #footer>
        <el-button type="primary" @click="goToLogin">去登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import { startCountdown } from '@/utils/countdown'
import { isPasswordConfirmed } from '@/utils/register'
import { sendRegisterSmsCode } from '@/api/user/auth'
import {
  getPreferredUserType,
  getUserTypeTheme,
  setPreferredUserType,
  USER_TYPE_OPTIONS
} from '@/utils/userTypePreference'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const smsCodeSending = ref(false)
const smsCountdown = ref(0)
const registerSuccessVisible = ref(false)
const remainingSeconds = ref(3)
let stopCountdown
let stopSmsCountdown
let navigating = false

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  smsCode: '999999',
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

const requiredRule = (label) => [
  { required: true, message: `请输入${label}`, trigger: 'blur' }
]

const rules = {
  username: requiredRule('用户名'),
  password: requiredRule('密码'),
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        callback(isPasswordConfirmed(form.password, value)
          ? undefined
          : new Error('两次输入的密码不一致'))
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '短信验证码为6位数字', trigger: 'blur' }
  ],
  userType: requiredRule('用户类型')
}

async function handleSendSmsCode() {
  if (smsCodeSending.value || smsCountdown.value > 0) {
    return
  }

  const valid = await formRef.value?.validateField('phone').catch(() => false)
  if (!valid) {
    return
  }

  smsCodeSending.value = true
  try {
    await sendRegisterSmsCode(form.phone)
    ElMessage.success('验证码已发送')
    stopSmsCountdown?.()
    stopSmsCountdown = startCountdown(
      60,
      (seconds) => {
        smsCountdown.value = seconds
      },
      () => {
        smsCountdown.value = 0
      }
    )
  } finally {
    smsCodeSending.value = false
  }
}

async function handleRegister() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      password: form.password,
      phone: form.phone,
      smsCode: form.smsCode,
      userType: form.userType
    })
    registerSuccessVisible.value = true
    stopCountdown = startCountdown(
      3,
      (seconds) => {
        remainingSeconds.value = seconds
      },
      goToLogin
    )
  } finally {
    loading.value = false
  }
}

async function goToLogin() {
  if (navigating) {
    return
  }

  navigating = true
  stopCountdown?.()
  registerSuccessVisible.value = false
  await router.replace('/login')
}

onBeforeUnmount(() => {
  stopCountdown?.()
  stopSmsCountdown?.()
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--auth-background);
  transition: background 0.2s ease;
}

.auth-card {
  width: min(100%, 460px);
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

.auth-actions {
  margin-top: 16px;
  text-align: center;

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

.sms-code-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  width: 100%;
}

.register-submit {
  width: 100%;
}
</style>
