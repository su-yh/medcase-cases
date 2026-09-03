<template>
  <main v-loading="loadingProfile" class="account-profile-page">
    <section class="account-profile-header">
      <div>
        <p class="account-profile-eyebrow">账户设置</p>
        <h1>个人信息</h1>
        <p class="account-profile-description">查看账户资料，维护可修改的账户信息。</p>
      </div>
      <div class="account-profile-header-actions">
        <el-tag :type="reviewStatusType">{{ reviewStatusText }}</el-tag>
        <div class="account-profile-actions">
          <el-button @click="openPhoneDialog">修改手机号</el-button>
          <el-button type="primary" @click="openPasswordDialog">修改密码</el-button>
        </div>
      </div>
    </section>

    <section class="account-panel">
      <div class="account-panel-heading">
        <div>
          <h2>账户资料</h2>
          <p>姓名和用户类型由注册资料确定。</p>
        </div>
      </div>
      <dl class="account-info-grid">
        <div>
          <dt>账号</dt>
          <dd>{{ account.username || '未设置' }}</dd>
        </div>
        <div>
          <dt>姓名</dt>
          <dd>{{ account.nickName || '未设置' }}</dd>
        </div>
        <div>
          <dt>用户类型</dt>
          <dd>{{ userTypeText }}</dd>
        </div>
        <div>
          <dt>手机号</dt>
          <dd>{{ account.phone || '未设置' }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="reviewEditable" class="account-panel">
      <div class="account-panel-heading">
        <div>
          <h2>审核资料</h2>
          <p>{{ reviewFailed ? '请根据拒绝原因修改资料后重新提交。' : '请完善资料后提交管理员审核。' }}</p>
        </div>
      </div>
      <el-alert
        v-if="reviewFailed && account.reviewReason"
        class="account-review-reason"
        title="审核拒绝原因"
        :description="account.reviewReason"
        type="error"
        :closable="false"
        show-icon
      />
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        label-position="top"
        @submit.prevent="submitReview"
      >
        <el-form-item label="邀请人" prop="supplierId" required>
          <el-select
            v-model="reviewForm.supplierId"
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
        <el-form-item label="身份证号码" prop="idCardNumber" required>
          <el-input
            v-model="reviewForm.idCardNumber"
            maxlength="30"
            placeholder="请输入身份证号码"
          />
        </el-form-item>
        <el-form-item v-if="isDoctor" label="职称" prop="title" required>
          <el-input v-model="reviewForm.title" maxlength="50" placeholder="请输入职称" />
        </el-form-item>
        <div class="account-attachment-grid">
          <el-form-item label="身份证正面图片" prop="idCardFront" required>
            <div class="account-attachment">
              <span>{{ attachmentName(reviewForm.idCardFront) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardFront', file)"
              >
                <el-button :loading="fieldUploading === 'idCardFront'">上传</el-button>
              </el-upload>
              <el-button
                v-if="reviewForm.idCardFront?.filePath"
                text
                type="primary"
                @click="openPreview(reviewForm.idCardFront)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="身份证反面图片" prop="idCardBack" required>
            <div class="account-attachment">
              <span>{{ attachmentName(reviewForm.idCardBack) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardBack', file)"
              >
                <el-button :loading="fieldUploading === 'idCardBack'">上传</el-button>
              </el-upload>
              <el-button
                v-if="reviewForm.idCardBack?.filePath"
                text
                type="primary"
                @click="openPreview(reviewForm.idCardBack)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="isDoctor" label="职业资格证图片" prop="qualificationCertificate" required>
            <div class="account-attachment">
              <span>{{ attachmentName(reviewForm.qualificationCertificate) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('qualificationCertificate', file)"
              >
                <el-button :loading="fieldUploading === 'qualificationCertificate'">上传</el-button>
              </el-upload>
              <el-button
                v-if="reviewForm.qualificationCertificate?.filePath"
                text
                type="primary"
                @click="openPreview(reviewForm.qualificationCertificate)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
        </div>
        <el-button
          type="primary"
          native-type="submit"
          :loading="submitting"
          :disabled="Boolean(fieldUploading)"
        >
          提交审核
        </el-button>
      </el-form>
    </section>

    <section v-else class="account-panel">
      <div class="account-panel-heading">
        <div>
          <h2>审核资料</h2>
          <p>审核资料已提交，当前不可修改。</p>
        </div>
      </div>
      <dl class="account-info-grid">
        <div>
          <dt>邀请人</dt>
          <dd>{{ supplierName }}</dd>
        </div>
        <div>
          <dt>身份证号码</dt>
          <dd>{{ account.idCardNumber || '未设置' }}</dd>
        </div>
        <div v-if="isDoctor">
          <dt>职称</dt>
          <dd>{{ account.title || '未设置' }}</dd>
        </div>
      </dl>
      <el-alert
        v-if="reviewFailed && account.reviewReason"
        class="account-review-reason"
        title="审核拒绝原因"
        :description="account.reviewReason"
        type="error"
        :closable="false"
        show-icon
      />
      <div class="account-readonly-attachments">
        <div v-for="item in readonlyAttachments" :key="item.label" class="account-readonly-attachment">
          <span>{{ item.label }}</span>
          <el-button
            v-if="item.attachment?.filePath"
            text
            type="primary"
            @click="openPreview(item.attachment)"
          >
            预览
          </el-button>
          <span v-else class="account-attachment-empty">未上传</span>
        </div>
      </div>
    </section>

    <div v-if="canDeleteAccount" class="account-danger-action">
      <el-button text type="danger" :loading="deleting" @click="handleDeleteAccount">
        删除账号
      </el-button>
    </div>

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
import { userTypeLabel } from '@/utils/userType'

const router = useRouter()
const userStore = useUserStore()
const loadingProfile = ref(false)
const submitting = ref(false)
const phoneSaving = ref(false)
const passwordSaving = ref(false)
const deleting = ref(false)
const phoneDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const previewOpen = ref(false)
const previewAttachment = ref(null)
const fieldUploading = ref('')
const reviewFormRef = ref()
const phoneFormRef = ref()
const passwordFormRef = ref()
const supplierOptions = ref([])
const visibleSupplierOptions = ref([])
const account = reactive({
  username: '',
  nickName: '',
  userType: null,
  phone: '',
  status: null,
  supplierId: null,
  idCardNumber: '',
  title: '',
  idCardFront: null,
  idCardBack: null,
  qualificationCertificate: null,
  reviewReason: ''
})
const reviewForm = reactive({
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

const normalizedStatus = computed(() => normalizeEnumCode(account.status))
const isDoctor = computed(() => normalizeEnumCode(account.userType) === USER_TYPE.DOCTOR)
const reviewEditable = computed(() => [
  USER_STATUS.REGISTER,
  USER_STATUS.REVIEW_FAILED
].includes(normalizedStatus.value))
const reviewFailed = computed(() => normalizedStatus.value === USER_STATUS.REVIEW_FAILED)
const canDeleteAccount = computed(() => [
  USER_STATUS.PENDING_REVIEW,
  USER_STATUS.REVIEW_FAILED,
  USER_STATUS.REGISTER
].includes(normalizedStatus.value))
const userTypeText = computed(() => userTypeLabel(account.userType))
const supplierName = computed(() => {
  const supplier = supplierOptions.value.find(item => item.id === account.supplierId)
  return supplier ? `${supplier.name}（${supplier.id}）` : account.supplierId || '未设置'
})
const reviewStatusText = computed(() => {
  if (normalizedStatus.value === USER_STATUS.PENDING_REVIEW) {
    return '待审核'
  }
  if (normalizedStatus.value === USER_STATUS.REVIEW_FAILED) {
    return '审核未通过'
  }
  if (normalizedStatus.value === USER_STATUS.OK) {
    return '审核通过'
  }
  return '待完善资料'
})
const reviewStatusType = computed(() => {
  if (normalizedStatus.value === USER_STATUS.REVIEW_FAILED) {
    return 'danger'
  }
  if (normalizedStatus.value === USER_STATUS.OK) {
    return 'success'
  }
  if (normalizedStatus.value === USER_STATUS.PENDING_REVIEW) {
    return 'warning'
  }
  return 'info'
})
const readonlyAttachments = computed(() => [
  { label: '身份证正面', attachment: account.idCardFront },
  { label: '身份证反面', attachment: account.idCardBack },
  ...(isDoctor.value
    ? [{ label: '职业资格证', attachment: account.qualificationCertificate }]
    : [])
])
const reviewRules = computed(() => ({
  supplierId: [{ required: true, message: '请选择邀请人', trigger: 'change' }],
  idCardNumber: [{ required: true, message: '请输入身份证号码', trigger: 'blur' }],
  title: isDoctor.value
    ? [{ required: true, message: '请输入职称', trigger: 'blur' }]
    : [],
  idCardFront: [{ required: true, message: '请上传身份证正面图片', trigger: 'change' }],
  idCardBack: [{ required: true, message: '请上传身份证反面图片', trigger: 'change' }],
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
    account.username = profile?.username || ''
    account.nickName = profile?.nickName || ''
    account.userType = profile?.userType || null
    account.phone = profile?.phone || ''
    account.status = profile?.status || null
    account.supplierId = profile?.supplierId || null
    account.idCardNumber = profile?.idCardNumber || ''
    account.title = profile?.title || ''
    account.idCardFront = profile?.idCardFront || null
    account.idCardBack = profile?.idCardBack || null
    account.qualificationCertificate = profile?.qualificationCertificate || null
    account.reviewReason = profile?.reviewReason || ''
    reviewForm.supplierId = account.supplierId
    reviewForm.idCardNumber = account.idCardNumber
    reviewForm.title = account.title
    reviewForm.idCardFront = account.idCardFront
    reviewForm.idCardBack = account.idCardBack
    reviewForm.qualificationCertificate = account.qualificationCertificate
    phoneForm.phone = account.phone
  } finally {
    loadingProfile.value = false
  }
}

async function submitReview() {
  if (fieldUploading.value) {
    ElMessage.warning('请等待附件上传完成')
    return
  }
  const valid = await reviewFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  submitting.value = true
  try {
    await userStore.submitProfile({
      nickName: account.nickName,
      phone: account.phone,
      supplierId: reviewForm.supplierId,
      idCardNumber: reviewForm.idCardNumber,
      title: isDoctor.value ? reviewForm.title : '',
      idCardFront: reviewForm.idCardFront,
      idCardBack: reviewForm.idCardBack,
      qualificationCertificate: isDoctor.value ? reviewForm.qualificationCertificate : null
    })
    await loadProfile()
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
    account.phone = phoneForm.phone
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
  const previousAttachment = reviewForm[field]
  fieldUploading.value = field
  try {
    reviewForm[field] = await uploadProfileAttachment(file)
  } catch (error) {
    reviewForm[field] = previousAttachment
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
  phoneForm.phone = account.phone
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
.account-profile-page {
  min-height: 100%;
  padding: 28px;
  background: var(--el-bg-color-page);
}

.account-profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin: 0 auto 22px;
  width: min(100%, 980px);
}

.account-profile-eyebrow {
  margin: 0 0 8px;
  color: var(--el-color-primary);
  font-size: 13px;
}

.account-profile-header h1 {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

.account-profile-description,
.account-panel-heading p {
  margin: 0;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.account-profile-header-actions {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 16px;
}

.account-profile-actions {
  display: flex;
  gap: 10px;
}

.account-panel {
  width: min(100%, 980px);
  margin: 0 auto 18px;
  padding: 24px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.account-panel-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
}

.account-panel-heading h2 {
  margin: 0 0 6px;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.account-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 36px;
  margin: 0;
}

.account-info-grid div {
  min-width: 0;
}

.account-info-grid dt {
  margin-bottom: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.account-info-grid dd {
  margin: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-review-reason {
  margin-bottom: 20px;
}

.account-attachment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 32px;
}

.account-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.account-attachment span {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-readonly-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin-top: 24px;
}

.account-readonly-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.account-attachment-empty {
  color: var(--el-text-color-placeholder);
}

.account-danger-action {
  width: min(100%, 980px);
  margin: 0 auto;
  text-align: right;
}

@media (max-width: 700px) {
  .account-profile-page {
    padding: 16px;
  }

  .account-profile-header {
    display: block;
  }

  .account-profile-header-actions {
    align-items: flex-start;
    margin-top: 18px;
  }

  .account-info-grid,
  .account-attachment-grid {
    grid-template-columns: 1fr;
  }

  .account-panel {
    padding: 18px;
  }
}
</style>
