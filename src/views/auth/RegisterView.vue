<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h1>病例端注册</h1>
      <p>创建 MedCase 病例端账号。</p>
      <el-form
        ref="formRef"
        class="register-form-grid"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleRegister"
      >
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
        <el-form-item label="用户类型" prop="userType" required>
          <el-select v-model="form.userType" style="width: 100%" @change="handleUserTypeChange">
            <el-option label="医生" :value="USER_TYPE.DOCTOR" />
            <el-option label="患者" :value="USER_TYPE.PATIENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="nickName" required>
          <el-input v-model="form.nickName" maxlength="30" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="sex" required>
          <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="0" />
            <el-option label="女" value="1" />
            <el-option label="未知" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号码" prop="idCardNumber" required>
          <el-input v-model="form.idCardNumber" maxlength="30" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-form-item v-if="isDoctor" label="职称" prop="title" required>
          <el-input v-model="form.title" maxlength="50" placeholder="请输入职称" />
        </el-form-item>
        <el-form-item label="邀请码" prop="inviteCode" required>
          <el-input v-model="form.inviteCode" readonly />
        </el-form-item>
        <el-form-item label="身份证正面图片" prop="idCardFront" required>
          <el-upload
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :disabled="uploadingField === 'idCardFront'"
            :on-change="file => handleFileChange('idCardFront', file)"
            accept="image/*"
          >
            <el-button :loading="uploadingField === 'idCardFront'">选择图片</el-button>
          </el-upload>
          <span class="upload-name">{{ attachmentName(form.idCardFront) }}</span>
        </el-form-item>
        <el-form-item label="身份证反面图片" prop="idCardBack" required>
          <el-upload
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :disabled="uploadingField === 'idCardBack'"
            :on-change="file => handleFileChange('idCardBack', file)"
            accept="image/*"
          >
            <el-button :loading="uploadingField === 'idCardBack'">选择图片</el-button>
          </el-upload>
          <span class="upload-name">{{ attachmentName(form.idCardBack) }}</span>
        </el-form-item>
        <el-form-item v-if="isDoctor" label="医师职业资格证图片" prop="qualificationCertificate" required>
          <el-upload
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :disabled="uploadingField === 'qualificationCertificate'"
            :on-change="file => handleFileChange('qualificationCertificate', file)"
            accept="image/*"
          >
            <el-button :loading="uploadingField === 'qualificationCertificate'">
              选择图片
            </el-button>
          </el-upload>
          <span class="upload-name">{{ attachmentName(form.qualificationCertificate) }}</span>
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
      class="register-success-dialog"
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
import { sendRegisterSmsCode, uploadCaseRegistrationAttachment } from '@/api/user/auth'
import { USER_TYPE } from '@/constants/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const uploadingField = ref('')
const smsCodeSending = ref(false)
const smsCountdown = ref(0)
const registerSuccessVisible = ref(false)
const remainingSeconds = ref(3)
let stopCountdown
let stopSmsCountdown
let navigating = false
const isDoctor = computed(() => form.userType === USER_TYPE.DOCTOR)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  smsCode: '999999',
  userType: USER_TYPE.DOCTOR,
  nickName: '',
  sex: '',
  idCardNumber: '',
  title: '',
  inviteCode: '9999',
  idCardFront: null,
  idCardBack: null,
  qualificationCertificate: null
})

const requiredRule = (label) => [
  { required: true, message: `请输入${label}`, trigger: 'blur' }
]

const rules = computed(() => ({
  username: requiredRule('用户名'),
  password: requiredRule('密码'),
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (isPasswordConfirmed(form.password, value)) {
          callback()
          return
        }
        callback(new Error('两次输入的密码不一致'))
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
  userType: requiredRule('用户类型'),
  nickName: requiredRule('姓名'),
  sex: requiredRule('性别'),
  idCardNumber: requiredRule('身份证号码'),
  inviteCode: requiredRule('邀请码'),
  idCardFront: [{ required: true, message: '请上传身份证正面图片', trigger: 'change' }],
  idCardBack: [{ required: true, message: '请上传身份证反面图片', trigger: 'change' }],
  qualificationCertificate: isDoctor.value
    ? [{ required: true, message: '请上传医师职业资格证图片', trigger: 'change' }]
    : []
}))

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

async function handleFileChange(field, uploadFile) {
  const file = uploadFile?.raw
  if (!file) {
    return
  }

  uploadingField.value = field
  try {
    form[field] = await uploadCaseRegistrationAttachment(file, form.userType)
    await formRef.value?.validateField(field)
  } catch (error) {
    form[field] = null
    ElMessage.error(error.message || '证件图片上传失败')
  } finally {
    uploadingField.value = ''
  }
}

function attachmentName(attachment) {
  return attachment?.originalFilename || attachment?.filePath || '未上传'
}

function handleUserTypeChange(userType) {
  if (userType === USER_TYPE.PATIENT) {
    form.title = ''
    form.qualificationCertificate = null
  }
  formRef.value?.clearValidate(['title', 'qualificationCertificate'])
}

async function handleRegister() {
  if (uploadingField.value) {
    ElMessage.warning('请等待证件图片上传完成')
    return
  }

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
      userType: form.userType,
      nickName: form.nickName,
      sex: form.sex,
      idCardNumber: form.idCardNumber,
      title: form.title,
      inviteCode: form.inviteCode,
      idCardFront: form.idCardFront,
      idCardBack: form.idCardBack,
      qualificationCertificate: form.qualificationCertificate
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 880px;
  border: 1px solid #9adfd5;
  border-top: 4px solid #12a594;
  box-shadow: 0 16px 32px rgb(18 165 148 / 16%);
}

:deep(.el-button--primary) {
  --el-button-bg-color: #12a594;
  --el-button-border-color: #12a594;
  --el-button-hover-bg-color: #0e8c7e;
  --el-button-hover-border-color: #0e8c7e;
  --el-button-active-bg-color: #0b7369;
  --el-button-active-border-color: #0b7369;
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
    color: #0e8c7e;
  }
}

.register-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;
}

.sms-code-field {
  display: flex;
  gap: 8px;

  :deep(.el-input) {
    min-width: 0;
  }

  :deep(.el-button) {
    flex: 0 0 124px;
  }
}

.register-submit {
  grid-column: 1 / -1;
  width: 100%;
}

.upload-name {
  display: block;
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
}

.register-success-message {
  margin: 0;
  line-height: 1.6;
  color: #2f6f67;
}

:global(.register-success-dialog .el-dialog) {
  border-top: 4px solid #12a594;
}

:global(.register-success-dialog .el-dialog__title) {
  color: #0b7369;
}

@media (max-width: 767px) {
  .auth-page {
    align-items: flex-start;
    padding: 16px;
  }

  .auth-card {
    max-width: 420px;
  }

  .register-form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .register-submit {
    grid-column: auto;
  }
}
</style>
