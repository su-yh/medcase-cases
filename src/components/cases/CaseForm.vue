<template>
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

    <div class="form-footer">
      <el-button native-type="button" :disabled="isBusy" @click="emit('cancel')">取消</el-button>
      <el-button
        native-type="button"
        :loading="saving"
        :disabled="isBusy || hasUploadingAttachments"
        @click="handleSaveDraft"
      >
        保存草稿
      </el-button>
      <el-button
        type="primary"
        native-type="submit"
        :loading="submitting"
        :disabled="isBusy || hasUploadingAttachments || uploadedAttachments.length !== attachmentFiles.length"
      >
        提交病例
      </el-button>
    </div>
  </el-form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  buildCasePayload,
  MAX_CASE_ATTACHMENT_SIZE_MB,
  normalizeCaseFormData
} from '@/utils/caseForm'
import { uploadCaseAttachments } from '@/api/doctor/cases'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  detailLoading: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'save-draft', 'cancel'])

const form = reactive({
  title: '',
  remark: ''
})
const attachmentFiles = ref([])
const attachmentInput = ref(null)
const uploading = ref(false)

const allowedAttachmentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'jpg', 'jpeg', 'png']
const uploadedAttachments = computed(() => attachmentFiles.value
  .filter(file => file.attachment && !file.uploading)
  .map(file => file.attachment))
const hasUploadingAttachments = computed(() => attachmentFiles.value.some(file => file.uploading))
const isBusy = computed(() => (
  props.detailLoading || props.submitting || props.saving || uploading.value
))

watch(
  () => props.initialData,
  (initialData) => {
    const normalized = normalizeCaseFormData(initialData)
    form.title = normalized.title
    form.remark = normalized.remark
    attachmentFiles.value = normalized.attachments
  },
  { immediate: true }
)

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
    if (file.size / 1024 / 1024 > MAX_CASE_ATTACHMENT_SIZE_MB) {
      ElMessage.error(`${file.name}：单个附件不能超过 50 MB`)
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

function createPayload() {
  return buildCasePayload(form, attachmentFiles.value)
}

function handleSaveDraft() {
  if (validateForm()) {
    emit('save-draft', createPayload())
  }
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', createPayload())
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

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
