<template>
  <main class="profile-page">
    <el-card v-loading="loadingProfile" class="profile-card" shadow="never">
      <div class="profile-header">
        <header class="profile-heading">
          <span v-if="reviewFailed" class="profile-state-label">审核未通过</span>
          <h1>个人信息</h1>
          <p>{{ reviewEditable ? '请完善审核资料后提交管理员审核。' : '审核资料已提交，以下内容不可修改。' }}</p>
        </header>
        <div class="profile-actions">
          <el-button @click="openPhoneDialog">修改手机号</el-button>
          <el-button type="primary" @click="openPasswordDialog">修改密码</el-button>
        </div>
      </div>

      <el-alert
        v-if="reviewFailed && userStore.userInfo?.reviewReason"
        class="review-reason"
        title="审核拒绝原因"
        :description="userStore.userInfo.reviewReason"
        type="error"
        :closable="false"
        show-icon
      />

      <section class="profile-section">
        <h2>审核资料</h2>
        <el-form
          ref="profileFormRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="姓名" prop="nickName" required>
            <el-input
              v-model="form.nickName"
              :disabled="!reviewEditable"
              maxlength="30"
              show-word-limit
              placeholder="请输入姓名"
            />
          </el-form-item>
          <el-form-item label="用户类型">
            <el-input :model-value="isDoctor ? '医生' : '患者'" disabled />
          </el-form-item>
          <el-form-item label="邀请人" prop="supplierId" required>
            <el-select
              v-model="form.supplierId"
              :disabled="!reviewEditable"
              filterable
              clearable
              :filter-method="filterSupplierOptions"
              placeholder="请输入邀请人编号或姓名"
              style="width: 100%"
              @visible-change="handleSupplierSelectVisible"
            >
              <el-option
                v-for="supplier in visibleSupplierOptions"
                :key="supplier.id"
                :label="`${supplier.name}（${supplier.id}）`"
                :value="supplier.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" prop="phone" required>
            <el-input
              v-model="form.phone"
              :disabled="!reviewEditable"
              maxlength="20"
              placeholder="请输入手机号"
            />
          </el-form-item>
          <el-form-item label="身份证号码" prop="idCardNumber" required>
            <el-input
              v-model="form.idCardNumber"
              :disabled="!reviewEditable"
              maxlength="30"
              placeholder="请输入身份证号码"
            />
          </el-form-item>
          <el-form-item v-if="isDoctor" label="职称" prop="title" required>
            <el-input
              v-model="form.title"
              :disabled="!reviewEditable"
              maxlength="50"
              placeholder="请输入职称"
            />
          </el-form-item>
          <el-form-item label="身份证正面图片" prop="idCardFront">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.idCardFront) }}</span>
              <el-upload
                v-if="reviewEditable"
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardFront', file)"
              >
                <el-button :loading="fieldUploading === 'idCardFront'">上传</el-button>
              </el-upload>
              <el-button
                v-if="form.idCardFront?.filePath"
                text
                type="primary"
                @click="openPreview(form.idCardFront)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="身份证反面图片" prop="idCardBack">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.idCardBack) }}</span>
              <el-upload
                v-if="reviewEditable"
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardBack', file)"
              >
                <el-button :loading="fieldUploading === 'idCardBack'">上传</el-button>
              </el-upload>
              <el-button
                v-if="form.idCardBack?.filePath"
                text
                type="primary"
                @click="openPreview(form.idCardBack)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="isDoctor" label="医师职业资格证图片" prop="qualificationCertificate">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.qualificationCertificate) }}</span>
              <el-upload
                v-if="reviewEditable"
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('qualificationCertificate', file)"
              >
                <el-button :loading="fieldUploading === 'qualificationCertificate'">
                  上传
                </el-button>
              </el-upload>
              <el-button
                v-if="form.qualificationCertificate?.filePath"
                text
                type="primary"
                @click="openPreview(form.qualificationCertificate)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-button
            v-if="reviewEditable"
            type="primary"
            native-type="submit"
            :loading="submitting"
            style="width: 100%"
          >
            提交审核
          </el-button>
        </el-form>
      </section>

      <div class="profile-footer">
        <el-button
          v-if="canDeleteAccount"
          text
          type="danger"
          :loading="deleting"
          @click="handleDeleteAccount"
        >
          删除账号
        </el-button>
      </div>
    </el-card>

    <AttachmentPreviewDialog
      v-model="previewOpen"
      :attachment="previewAttachment"
    />

    <el-dialog v-model="phoneDialogVisible" title="修改手机号" width="420px">
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-position="top"
        @submit.prevent="handlePhoneUpdate"
      >
        <el-form-item label="手机号" prop="phone" required>
          <el-input v-model="phoneForm.phone" maxlength="20" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="phoneSaving" @click="handlePhoneUpdate">
          保存
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-position="top"
        @submit.prevent="handlePasswordUpdate"
      >
        <el-form-item label="旧密码" prop="oldPassword" required>
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword" required>
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword" required>
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordSaving" @click="handlePasswordUpdate">
          保存
        </el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import AttachmentPreviewDialog from '@/components/attachments/AttachmentPreviewDialog.vue'
import { getSupplierOptions } from '@/api/user/supplier'
import { uploadProfileAttachment } from '@/api/user/profile'
import { normalizeEnumCode, USER_STATUS, USER_TYPE } from '@/constants/user'

const router = useRouter()
const userStore = useUserStore()
const profileFormRef = ref()
const phoneFormRef = ref()
const passwordFormRef = ref()
const phoneDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const loadingProfile = ref(false)
const submitting = ref(false)
const phoneSaving = ref(false)
const passwordSaving = ref(false)
const deleting = ref(false)
const previewOpen = ref(false)
const previewAttachment = ref(null)
const fieldUploading = ref('')
const supplierOptions = ref([])
const visibleSupplierOptions = ref([])
const form = reactive({
  nickName: '',
  phone: '',
  supplierId: null,
  idCardNumber: '',
  title: '',
  idCardFront: null,
  idCardBack: null,
  qualificationCertificate: null
})
const phoneForm = reactive({
  phone: ''
})
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileStatus = computed(() => userStore.userInfo?.status)
const normalizedProfileStatus = computed(() => normalizeEnumCode(profileStatus.value))
const isDoctor = computed(() => normalizeEnumCode(userStore.userInfo?.userType) === USER_TYPE.DOCTOR)
const reviewEditable = computed(() => [
  USER_STATUS.REGISTER,
  USER_STATUS.REVIEW_FAILED
].includes(normalizedProfileStatus.value))
const reviewFailed = computed(() => normalizedProfileStatus.value === USER_STATUS.REVIEW_FAILED)
const canDeleteAccount = computed(() => [
  USER_STATUS.PENDING_REVIEW,
  USER_STATUS.REVIEW_FAILED,
  USER_STATUS.REGISTER
].includes(normalizedProfileStatus.value))

const rules = computed(() => ({
  nickName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  supplierId: [{ required: true, message: '请选择邀请人', trigger: 'change' }],
  idCardNumber: [{ required: true, message: '请输入身份证号码', trigger: 'blur' }],
  idCardFront: [{ required: true, message: '请上传身份证正面图片', trigger: 'change' }],
  idCardBack: [{ required: true, message: '请上传身份证反面图片', trigger: 'change' }],
  title: isDoctor.value
    ? [{ required: true, message: '请输入职称', trigger: 'blur' }]
    : [],
  qualificationCertificate: isDoctor.value
    ? [{ required: true, message: '请上传职业资格证图片', trigger: 'change' }]
    : []
}))
const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        callback(value === passwordForm.newPassword
          ? undefined
          : new Error('两次输入的新密码不一致'))
      },
      trigger: 'blur'
    }
  ]
}

async function loadProfile() {
  loadingProfile.value = true
  try {
    const profile = await userStore.loadProfile()
    form.nickName = profile?.nickName || ''
    form.phone = profile?.phone || ''
    form.supplierId = profile?.supplierId || null
    form.idCardNumber = profile?.idCardNumber || ''
    form.title = profile?.title || ''
    form.idCardFront = profile?.idCardFront || null
    form.idCardBack = profile?.idCardBack || null
    form.qualificationCertificate = profile?.qualificationCertificate || null
    phoneForm.phone = profile?.phone || ''
  } finally {
    loadingProfile.value = false
  }
}

async function handleSubmit() {
  if (fieldUploading.value) {
    ElMessage.warning('请等待证件图片上传完成')
    return
  }
  const valid = await profileFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  submitting.value = true
  try {
    await userStore.submitProfile({
      nickName: form.nickName,
      phone: form.phone,
      supplierId: form.supplierId,
      idCardNumber: form.idCardNumber,
      title: isDoctor.value ? form.title : '',
      idCardFront: form.idCardFront,
      idCardBack: form.idCardBack,
      qualificationCertificate: isDoctor.value ? form.qualificationCertificate : null
    })
    ElMessage.success('资料已提交，等待管理员审核')
  } finally {
    submitting.value = false
  }
}

async function handlePhoneUpdate() {
  const valid = await phoneFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  phoneSaving.value = true
  try {
    await userStore.updateProfilePhone({ phone: phoneForm.phone })
    phoneDialogVisible.value = false
    ElMessage.success('手机号修改成功')
  } finally {
    phoneSaving.value = false
  }
}

async function handlePasswordUpdate() {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  passwordSaving.value = true
  try {
    await userStore.updateProfilePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordDialogVisible.value = false
    ElMessage.success('密码修改成功')
  } finally {
    passwordSaving.value = false
  }
}

function filterSupplierOptions(keyword) {
  const value = keyword.trim()
  if (!value) {
    visibleSupplierOptions.value = supplierOptions.value
    return
  }

  if (/^\d+$/.test(value)) {
    visibleSupplierOptions.value = supplierOptions.value.filter(
      supplier => String(supplier.id) === value
    )
    return
  }

  visibleSupplierOptions.value = supplierOptions.value.filter(
    supplier => supplier.name.includes(value)
  )
}

function handleSupplierSelectVisible(visible) {
  if (visible) {
    visibleSupplierOptions.value = supplierOptions.value
  }
}

function attachmentName(attachment) {
  return attachment?.originalFilename || attachment?.filePath || '未上传'
}

async function handleAttachmentChange(field, uploadFile) {
  const file = uploadFile?.raw
  if (!file) {
    return
  }

  const previousAttachment = form[field]
  fieldUploading.value = field
  try {
    form[field] = await uploadProfileAttachment(file)
  } catch (error) {
    form[field] = previousAttachment
    ElMessage.error(error.message || '附件上传失败')
  } finally {
    fieldUploading.value = ''
  }
}

function openPreview(attachment) {
  previewAttachment.value = attachment
  previewOpen.value = true
}

function openPhoneDialog() {
  phoneForm.phone = form.phone
  phoneDialogVisible.value = true
}

function openPasswordDialog() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '删除账号后将无法恢复，确定要删除当前账号吗？',
      '删除账号',
      {
        confirmButtonText: '删除账号',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  deleting.value = true
  try {
    await userStore.deleteAccount()
    ElMessage.success('账号已删除')
    await router.replace('/login')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadProfile(),
    getSupplierOptions().then(options => {
      supplierOptions.value = options || []
      visibleSupplierOptions.value = supplierOptions.value
    })
  ])
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100%;
  padding: 28px;
  background: var(--el-bg-color-page);
}

.profile-card {
  width: min(100%, 920px);
  margin: 0 auto;
  border-radius: 8px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.profile-heading {
  margin-bottom: 24px;

  h1 {
    margin: 6px 0 8px;
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.profile-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.profile-section {
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);

  & + .profile-section {
    margin-top: 24px;
  }

  h2 {
    margin: 0 0 20px;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }
}

.review-reason {
  margin: 0 0 24px;
}

.profile-state-label {
  color: var(--el-color-danger);
  font-size: 13px;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.profile-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
}

.profile-attachment span {
  overflow: hidden;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .profile-page {
    padding: 16px;
  }

  .profile-header {
    display: block;
  }

  .profile-actions {
    margin-bottom: 24px;
  }
}
</style>
