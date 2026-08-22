<template>
  <el-dialog
    v-model="visible"
    title="编辑草稿"
    width="680px"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form v-loading="detailLoading" label-position="top" @submit.prevent="handleSubmit">
      <el-form-item label="标题" required>
        <el-input
          v-model="form.title"
          maxlength="100"
          show-word-limit
          placeholder="请输入病例标题"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          placeholder="请输入备注（可选）"
        />
      </el-form-item>
      <el-form-item label="附件">
        <input
          ref="attachmentInput"
          class="attachment-input"
          type="file"
          multiple
          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.pdf,.jpg,.jpeg,.png"
          @change="handleAttachmentChange"
        />
        <el-button
          type="primary"
          native-type="button"
          :loading="uploading"
          :disabled="isBusy"
          @click="openAttachmentPicker"
        >
          选择附件
        </el-button>
        <div class="attachment-tip">最多上传 5 个附件，单个文件不超过 5 MB</div>
        <ul v-if="attachmentFiles.length" class="attachment-list">
          <li v-for="(file, index) in attachmentFiles" :key="file.uid">
            <span>{{ file.name }}</span>
            <el-button
              link
              type="danger"
              native-type="button"
              :disabled="isBusy"
              @click="removeAttachment(index)"
            >
              删除
            </el-button>
          </li>
        </ul>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="isBusy" @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="isBusy || hasUploadingAttachments || uploadedAttachments.length !== attachmentFiles.length"
        @click="handleSubmit"
      >
        提交病例
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getCaseDetail, submitCase, uploadCaseAttachments } from '@/api/doctor/cases'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  caseItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const submitting = ref(false)
const uploading = ref(false)
const detailLoading = ref(false)
const attachmentInput = ref(null)
const attachmentFiles = ref([])
const form = reactive({
  title: '',
  remark: ''
})

const allowedAttachmentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
const uploadedAttachments = computed(() => attachmentFiles.value
  .filter(file => file.attachment && !file.uploading)
  .map(file => file.attachment))
const hasUploadingAttachments = computed(() => attachmentFiles.value.some(file => file.uploading))
const isBusy = computed(() => submitting.value || uploading.value || detailLoading.value)
let requestSequence = 0

watch(
  () => [props.modelValue, props.caseItem],
  ([isVisible, caseItem]) => {
    if (isVisible && caseItem?.id) {
      loadCaseDetail(caseItem)
    }
  },
  { immediate: true }
)

async function loadCaseDetail(caseItem) {
  const sequence = ++requestSequence
  detailLoading.value = true
  try {
    const detail = await getCaseDetail(caseItem.id)
    if (sequence !== requestSequence || !props.modelValue) {
      return
    }
    if (detail.status !== 'draft') {
      ElMessage.warning('当前病例不可修改')
      visible.value = false
      return
    }
    setCaseDetail(detail)
  } catch (error) {
    if (sequence !== requestSequence) {
      return
    }
    ElMessage.error(error.message || '病例详情加载失败')
    visible.value = false
  } finally {
    if (sequence === requestSequence) {
      detailLoading.value = false
    }
  }
}

function setCaseDetail(caseItem) {
  form.title = caseItem.title || ''
  form.remark = caseItem.remark || ''
  attachmentFiles.value = (caseItem.attachments || []).map((attachment, index) => ({
    uid: `existing-${attachment.url || index}`,
    name: attachment.originalFilename || attachment.newFileName || attachment.fileName || `附件${index + 1}`,
    raw: null,
    uploading: false,
    attachment
  }))
}

function resetForm() {
  requestSequence += 1
  detailLoading.value = false
  form.title = ''
  form.remark = ''
  attachmentFiles.value = []
}

function openAttachmentPicker() {
  attachmentInput.value?.click()
}

async function handleAttachmentChange(event) {
  const selectedFiles = Array.from(event.target.files || [])
  const remainingSlots = 5 - attachmentFiles.value.length
  if (selectedFiles.length > remainingSlots) {
    ElMessage.warning('最多上传 5 个附件')
  }

  const validFiles = selectedFiles.slice(0, remainingSlots).filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!allowedAttachmentExtensions.includes(extension)) {
      ElMessage.error(`${file.name}：不支持该附件格式`)
      return false
    }
    if (file.size / 1024 / 1024 > 5) {
      ElMessage.error(`${file.name}：单个附件不能超过 5 MB`)
      return false
    }
    return true
  })

  const newFiles = validFiles.map(raw => ({
    uid: `${raw.name}-${raw.lastModified}-${Math.random()}`,
    name: raw.name,
    raw,
    uploading: true,
    attachment: null
  }))
  attachmentFiles.value = attachmentFiles.value.concat(newFiles)
  event.target.value = ''

  if (!newFiles.length) {
    return
  }

  uploading.value = true
  try {
    const uploaded = await uploadCaseAttachments(newFiles.map(item => item.raw))
    if (uploaded.length !== newFiles.length) {
      throw new Error('附件上传结果异常')
    }
    newFiles.forEach((file, index) => {
      file.uploading = false
      file.attachment = uploaded[index]
    })
    ElMessage.success('附件上传成功')
  } catch (error) {
    attachmentFiles.value = attachmentFiles.value.filter(file => !newFiles.includes(file))
    ElMessage.error(error.message || '附件上传失败')
  } finally {
    uploading.value = false
  }
}

function removeAttachment(index) {
  attachmentFiles.value.splice(index, 1)
}

function validateForm() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入病例标题')
    return false
  }
  if (hasUploadingAttachments.value || uploadedAttachments.value.length !== attachmentFiles.value.length) {
    ElMessage.warning('请等待附件上传完成')
    return false
  }
  return true
}

async function handleSubmit() {
  if (detailLoading.value || !props.caseItem?.id || !validateForm()) {
    return
  }

  submitting.value = true
  try {
    await submitCase({
      id: props.caseItem.id,
      title: form.title,
      remark: form.remark,
      attachments: uploadedAttachments.value
    })
    ElMessage.success('病例提交成功，请等待管理端审核')
    visible.value = false
    emit('submitted')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.attachment-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.attachment-tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.attachment-list {
  max-width: 560px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.attachment-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.attachment-list li + li {
  margin-top: 8px;
}
</style>
