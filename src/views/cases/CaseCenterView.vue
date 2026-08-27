<template xmlns="http://www.w3.org/1999/html">
  <div class="case-page">
    <div class="case-heading">
      <div>
        <h1>病例中心</h1>
        <p>查看病例提交记录及管理端反馈结果。</p>
      </div>
      <el-button type="primary" @click="router.push('/cases/submit')">提交新病例</el-button>
    </div>

    <div class="case-tabs" role="tablist" aria-label="病例状态">
      <button
        v-for="tab in CASE_STATUS_TABS"
        :key="tab.key || 'all'"
        type="button"
        role="tab"
        :aria-selected="String(activeStatus === tab.key)"
        @click="changeStatus(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <el-card shadow="never" class="case-search-card">
      <el-form inline @submit.prevent="searchCases">
        <el-form-item label="标题">
          <el-input v-model="filters.title" clearable placeholder="请输入病例标题" @keyup.enter="searchCases" />
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="filters.createTimeRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchCases">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="case-toolbar">
      <span>共 {{ total }} 条病例记录</span>
      <span>草稿支持修改，其他状态仅可查看</span>
    </div>

    <el-card shadow="never" class="case-table-card">
      <el-table v-loading="loading" :data="caseList" row-key="id">
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column label="标题" min-width="180" header-align="center" prop="title"/>
        <el-table-column label="当前状态" width="190">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ row.statusDesc || getCaseStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" prop="createTime"/>
        <el-table-column label="附件" min-width="220">
          <template #default="{ row }">
            <div v-if="row.attachments.length" class="table-attachments">
              <el-button
                v-for="attachment in row.attachments"
                :key="attachment.filePath"
                link
                type="primary"
                @click="downloadAttachment(attachment)"
              >
                {{ attachment.originalFilename || attachment.filePath }}
              </el-button>
            </div>
            <span v-else class="empty-attachment">无附件</span>
          </template>
        </el-table-column>
        <el-table-column label="审核" width="190">
          <template #default="{ row }">
            <div class="case-operator-info">
              <span>{{ row.reviewerNickname || '暂无' }}</span>
              <small>{{ formatDate(row.reviewTime) }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结算" width="190">
          <template #default="{ row }">
            <div class="case-operator-info">
              <span>{{ row.settlerNickname || '暂无' }}</span>
              <small>{{ formatDate(row.settledTime) }}</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'draft'"
              link
              type="primary"
              @click="openEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
              link
              type="danger"
              @click="removeDraft(row)"
            >
              删除
            </el-button>
            <el-button link type="primary" @click="openDetail(row)">
              {{ row.status === 'review_failed' ? '查看原因' : '查看详情' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无病例记录" />
        </template>
      </el-table>

      <div class="case-pagination">
        <el-pagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :hide-on-single-page="false"
          @current-change="loadCases"
          @size-change="loadCases"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="病例详情" width="680px">
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
      <template v-if="detail">
        <div class="detail-row">
          <span>病例标题</span>
          <strong>{{ detail.title }}</strong>
        </div>
        <div class="detail-row">
          <span>病例编号</span>
          <strong>#{{ detail.id }}</strong>
        </div>
        <div class="detail-row">
          <span>当前状态</span>
          <el-tag :type="getStatusTagType(detail.status)" effect="light">
            {{ detail.statusDesc || getCaseStatusLabel(detail.status) }}
          </el-tag>
        </div>
        <div v-if="detail.reviewReason" class="detail-reason">
          <span>审核失败原因</span>
          <p>{{ detail.reviewReason }}</p>
        </div>
        <div v-if="detail.remark" class="detail-content">
          <span>备注</span>
          <p>{{ detail.remark }}</p>
        </div>
        <div v-if="detail.attachments.length" class="detail-content">
          <span>附件</span>
          <div class="detail-attachments">
            <el-button
              v-for="attachment in detail.attachments"
              :key="attachment.filePath"
              link
              type="primary"
              @click="downloadAttachment(attachment)"
            >
              {{ attachment.originalFilename || attachment.filePath }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <CaseEditDialog
      v-model="editVisible"
      :case-item="editingCase"
      @changed="handleCaseChanged"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { deleteCase, getCasePage } from '@/api/doctor/cases'
import CaseEditDialog from '@/components/cases/CaseEditDialog.vue'
import {
  CASE_STATUS_TABS,
  getCaseStatusLabel,
  getCaseStatusClass
} from '@/utils/doctorCase'
import { downloadAttachment } from '@/utils/attachment'

const router = useRouter()
const loading = ref(false)
const activeStatus = ref('')
const filters = ref({
  title: '',
  createTimeRange: []
})
const caseList = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detail = ref(null)
const editVisible = ref(false)
const editingCase = ref(null)

const statusTagTypes = {
  draft: 'info',
  reviewing: 'warning',
  failed: 'danger',
  passed: 'success',
  settled: 'success'
}

function getStatusTagType(status) {
  return statusTagTypes[getCaseStatusClass(status)] || 'info'
}

function formatDate(value) {
  if (!value) {
    return '—'
  }
  return value.replace?.('T', ' ') || value
}

async function loadCases() {
  loading.value = true
  try {
    const result = await getCasePage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      titleLike: filters.value.title || undefined,
      status: activeStatus.value || undefined,
      createTimeLowerBound: filters.value.createTimeRange?.[0] || undefined,
      createTimeUpperBound: filters.value.createTimeRange?.[1] || undefined
    })
    caseList.value = result?.list || []
    total.value = Number(result?.total || 0)
  } finally {
    loading.value = false
  }
}

async function changeStatus(status) {
  activeStatus.value = status
  pageNo.value = 1
  await loadCases()
}

async function searchCases() {
  pageNo.value = 1
  await loadCases()
}

async function resetSearch() {
  filters.value = {
    title: '',
    createTimeRange: []
  }
  pageNo.value = 1
  await loadCases()
}

function openDetail(caseItem) {
  detail.value = caseItem
  detailVisible.value = true
}

function openEdit(caseItem) {
  if (caseItem.status !== 'draft') {
    return
  }
  editingCase.value = caseItem
  editVisible.value = true
}

async function removeDraft(caseItem) {
  if (caseItem.status !== 'draft') {
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除病例“${caseItem.title}”吗？删除后不可恢复。`,
      '删除草稿',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )
    await deleteCase(caseItem.id)
    ElMessage.success('草稿删除成功')
    await loadCases()
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }
    ElMessage.error(error.message || '草稿删除失败')
  }
}

async function handleCaseChanged() {
  editingCase.value = null
  await loadCases()
}

onMounted(loadCases)
</script>

<style scoped>
.case-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 500;
}

p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.case-tabs {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  border-bottom: 1px solid var(--el-border-color);
  margin-bottom: 18px;
}

.case-tabs button {
  position: relative;
  padding: 0 0 12px;
  color: var(--el-text-color-secondary);
  border: 0;
  background: transparent;
  white-space: nowrap;
  cursor: pointer;
  font: inherit;
}

.case-tabs button[aria-selected="true"] {
  color: var(--el-color-primary);
}

.case-tabs button[aria-selected="true"]::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--el-color-primary);
  content: "";
}

.case-search-card {
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color);
}

.case-search-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.case-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.case-table-card {
  border: 1px solid var(--el-border-color);
}

.table-attachments,
.detail-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.empty-attachment {
  color: var(--el-text-color-placeholder);
}

.case-operator-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.4;
}

.case-operator-info small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}


.case-name,
.case-id {
  display: block;
}

.case-name {
  font-weight: 500;
}

.case-id {
  margin-top: 4px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.case-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.detail-row > span,
.detail-reason > span,
.detail-content > span {
  color: var(--el-text-color-secondary);
}

.detail-row > span {
  width: 88px;
}

.detail-reason,
.detail-content {
  margin-top: 18px;
}

.detail-reason p,
.detail-content p {
  margin-top: 8px;
  padding: 12px;
  white-space: pre-wrap;
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

@media (max-width: 680px) {
  .case-heading {
    display: block;
  }

  .case-heading .el-button {
    margin-top: 16px;
  }

  .case-toolbar {
    display: block;
  }

  .case-toolbar span {
    display: block;
    margin-bottom: 6px;
  }

  .case-pagination {
    justify-content: center;
  }
}
</style>
