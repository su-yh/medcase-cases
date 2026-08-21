<template>
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

    <div class="case-toolbar">
      <span>共 {{ total }} 条病例记录</span>
      <span>列表只提供查看和详情入口</span>
    </div>

    <el-card shadow="never" class="case-table-card">
      <el-table v-loading="loading" :data="caseList" row-key="id">
        <el-table-column label="病例" min-width="260">
          <template #default="{ row }">
            <span class="case-name">病例 #{{ row.id }}</span>
            <span class="case-id">{{ formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="当前状态" width="190">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" effect="light">
              {{ row.statusDesc || getCaseStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核/结算时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.settledTime || row.reviewTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row.id)">
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
          layout="total, prev, pager, next"
          :total="total"
          @current-change="loadCases"
          @size-change="loadCases"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="病例详情" width="680px">
      <template v-if="detail">
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
        <div class="detail-content">
          <span>备注</span>
          <p>{{ detail.remark }}</p>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCaseDetail, getCasePage } from '@/api/doctor/cases'
import {
  CASE_STATUS_TABS,
  getCaseStatusLabel,
  getCaseStatusClass
} from '@/utils/doctorCase'

const router = useRouter()
const loading = ref(false)
const activeStatus = ref('')
const caseList = ref([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const detailVisible = ref(false)
const detail = ref(null)

const statusTagTypes = {
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
      status: activeStatus.value || undefined
    })
    caseList.value = result?.list || []
    total.value = result?.total || 0
  } finally {
    loading.value = false
  }
}

async function changeStatus(status) {
  activeStatus.value = status
  pageNo.value = 1
  await loadCases()
}

async function openDetail(id) {
  detail.value = await getCaseDetail(id)
  detailVisible.value = true
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
