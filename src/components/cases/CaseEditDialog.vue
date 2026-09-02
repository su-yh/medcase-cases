<template>
  <el-dialog
    v-model="visible"
    title="编辑病例"
    width="680px"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <CaseForm
      :initial-data="detailData"
      :detail-loading="detailLoading"
      :submitting="submitting"
      :saving="saving"
      @cancel="visible = false"
      @save-draft="handleSaveDraft"
      @submit="handleSubmit"
    />
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getCaseDetail, saveDraftCase, submitCase } from '@/api/case/cases'
import CaseForm from '@/components/cases/CaseForm.vue'
import { addCaseIdToPayload } from '@/utils/caseForm'

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

const emit = defineEmits(['update:modelValue', 'changed'])

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const submitting = ref(false)
const saving = ref(false)
const detailLoading = ref(false)
const detailData = ref({})
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
  detailData.value = {}
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
    detailData.value = detail
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

function resetForm() {
  requestSequence += 1
  detailLoading.value = false
  detailData.value = {}
}

async function handleSubmit(payload) {
  if (detailLoading.value || !props.caseItem?.id) {
    return
  }

  submitting.value = true
  try {
    await submitCase({
      id: props.caseItem.id,
      ...payload
    })
    ElMessage.success('病例提交成功，请等待管理端审核')
    visible.value = false
    emit('changed')
  } finally {
    submitting.value = false
  }
}

async function handleSaveDraft(payload) {
  if (detailLoading.value || !props.caseItem?.id) {
    return
  }

  saving.value = true
  try {
    await saveDraftCase(addCaseIdToPayload(payload, props.caseItem.id))
    ElMessage.success('草稿保存成功')
    visible.value = false
    emit('changed')
  } finally {
    saving.value = false
  }
}
</script>
