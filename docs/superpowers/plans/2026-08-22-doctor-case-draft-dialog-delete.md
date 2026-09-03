# Doctor Case Draft Dialog And Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete doctor case draft editing in a modal, allow deleting only draft cases, and align the API backend and frontend behavior.

**Architecture:** Keep `/cases/submit` for creating a new case. The case center owns the draft edit modal; the modal loads the latest detail by id, reuses the existing attachment upload flow, and submits the draft with its id. The backend exposes `DELETE /doctor/cases/{id}` and enforces doctor ownership plus draft status before MyBatis-Plus logical deletion.

**Tech Stack:** Vue 3, Element Plus, Vite, Vitest, Yarn, Node.js 22.23.2, Spring Boot, MyBatis-Plus, JUnit 5, Mockito.

---

### Task 1: Lock Down Frontend API Contracts

**Files:**
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/api/doctor/__tests__/cases.spec.js`
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/api/doctor/cases.js`

- [x] **Step 1: Add failing API contract assertions**

Add tests that assert:

```js
it('loads a case detail through the case resource endpoint', async () => {
  const { getCaseDetail } = await import('@/api/doctor/cases')

  getCaseDetail(42)

  expect(requestMock).toHaveBeenCalledWith({
    url: '/doctor/cases/42',
    method: 'get'
  })
})

it('submits an edited draft with its id', async () => {
  const { submitCase } = await import('@/api/doctor/cases')
  const payload = { id: 42, title: '病例', remark: '', attachments: [] }

  submitCase(payload)

  expect(requestMock).toHaveBeenCalledWith({
    url: '/doctor/cases',
    method: 'post',
    data: payload
  })
})
```

- [x] **Step 2: Run the focused frontend test**

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 22.23.2 && yarn test src/api/doctor/__tests__/cases.spec.js
```

Expected: PASS for the existing API methods and the new assertions. If the current implementation already satisfies the contract, keep the test as regression coverage and continue.

- [x] **Step 3: Confirm the API implementation normalizes detail attachments**

Keep `getCaseDetail` returning `normalizeCase(response)` so a missing `attachments` field becomes an empty array. Keep `deleteCase` as:

```js
export function deleteCase(id) {
  return request({
    url: `/doctor/cases/${id}`,
    method: 'delete'
  })
}
```

- [x] **Step 4: Run the focused test again**

Run the same command and expect the focused API suite to pass with zero failures.

### Task 2: Implement Detail-Loading Draft Edit Modal

**Files:**
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/components/cases/CaseEditDialog.vue`

- [x] **Step 1: Define the failing behavior checklist before implementation**

The modal must:

```text
open -> show loading state -> call getCaseDetail(caseItem.id)
detail.status !== "draft" -> warn, close, do not submit
detail.status === "draft" -> fill title, remark, existing attachments
submit -> POST /doctor/cases with id and current attachment list
load/submit failure -> keep modal state as appropriate and clear loading flags
```

- [x] **Step 2: Add detail loading state and import**

Add `getCaseDetail` to the API imports and add:

```js
const detailLoading = ref(false)
const isBusy = computed(() => submitting.value || uploading.value || detailLoading.value)
```

Do not populate from the list row alone.

- [x] **Step 3: Load the latest detail when the modal opens**

Replace the current watcher body with an async loader that:

```js
async function loadCaseDetail(caseItem) {
  detailLoading.value = true
  try {
    const detail = await getCaseDetail(caseItem.id)
    if (detail.status !== 'draft') {
      ElMessage.warning('当前病例不可修改')
      visible.value = false
      return
    }
    setCaseDetail(detail)
  } catch (error) {
    ElMessage.error(error.message || '病例详情加载失败')
    visible.value = false
  } finally {
    detailLoading.value = false
  }
}
```

Trigger it only when `modelValue` becomes true and `caseItem.id` exists. Preserve the existing `setCaseDetail` conversion so existing attachments are represented without a raw `File`.

- [x] **Step 4: Update the modal template states**

Add `v-loading="detailLoading"` to the dialog body/form area. Disable cancel, attachment selection, attachment removal, and submit while detail loading. Keep the submit button disabled when:

```vue
:disabled="isBusy || hasUploadingAttachments || uploadedAttachments.length !== attachmentFiles.length"
```

The modal footer remains “取消” and “提交病例”; there is no “保存草稿” action in edit mode.

- [x] **Step 5: Verify the component compiles**

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 22.23.2 && yarn build
```

Expected: Vite build exits with code 0.

### Task 3: Close the Case Center Interaction Loop

**Files:**
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/views/cases/CaseCenterView.vue`
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/views/cases/SubmitCaseView.vue`
- Test: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/api/doctor/__tests__/cases.spec.js`
- Test: `/Users/suyunhong/suyh-develop/github/medcase-cases/src/utils/__tests__/doctorCase.spec.js`

- [x] **Step 1: Keep new-case navigation and remove old edit-page behavior**

Keep the “提交新病例” button routed to `/cases/submit`. Do not add or retain query-based draft editing in `SubmitCaseView.vue`; the page must always create a new case and send payloads without `id`.

- [x] **Step 2: Keep draft-only edit and delete controls**

In `CaseCenterView.vue`, preserve:

```vue
<el-button v-if="row.status === 'draft'" link type="primary" @click="openEdit(row)">
  编辑
</el-button>
<el-button v-if="row.status === 'draft'" link type="danger" @click="removeDraft(row)">
  删除
</el-button>
```

`openEdit` must only set the selected row and open the dialog for drafts. `handleCaseChanged` must clear the selected row and reload the page.

- [x] **Step 3: Verify delete confirmation and refresh behavior**

Keep `ElMessageBox.confirm` with cancel handling for `'cancel'` and `'close'`. On confirmation call `deleteCase(row.id)`, show success, then reload the current page. On API failure show the error and leave the row/list unchanged.

- [x] **Step 4: Run frontend tests**

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 22.23.2 && yarn test
```

Expected: all Vitest suites pass, including draft status and API delete coverage.

### Task 4: Verify and Complete Backend Delete Endpoint

**Files:**
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-api/medcase-admin/src/main/java/com/ruoyi/web/controller/doctor/DoctorCaseController.java`
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-api/medcase-admin/src/main/java/com/ruoyi/web/service/DoctorCaseService.java`
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-api/medcase-admin/src/main/java/com/ruoyi/mvc/constants/enums/ErrorCodeEnums.java`
- Modify: `/Users/suyunhong/suyh-develop/github/medcase-api/medcase-admin/src/test/java/com/ruoyi/web/service/DoctorCaseServiceTest.java`

- [x] **Step 1: Add failing service tests for delete authorization**

Cover these behaviors:

```java
deleteRemovesOwnedDraft()
deleteRejectsNonDraftCase()
deleteRejectsCaseOwnedByAnotherDoctor()
deleteRejectsMissingCase()
deleteRejectsDeleteFailure()
```

For rejected cases verify `deleteById` is never called. For failures verify the expected `ErrorCodeEnums` value.

- [x] **Step 2: Run the focused backend test**

Run:

```bash
mvn -Dmaven.repo.local=/Users/suyunhong/.m2/repository \
  -pl medcase-admin \
  -Dtest=DoctorCaseServiceTest \
  -Dsurefire.failIfNoSpecifiedTests=false \
  test
```

Expected: new tests fail only where the endpoint/service behavior is missing or incorrect.

- [x] **Step 3: Implement the delete endpoint and service guard**

The controller exposes:

```java
@RequestMapping(value = "/cases/{id}", method = RequestMethod.DELETE)
public void delete(
        @CurrLoginUser(userType = UserTypeEnums.DOCTOR) LoginUser loginUser,
        @PathVariable Long id) {
    doctorCaseService.delete(loginUser, id);
}
```

The service must:

```java
DoctorCaseEntity entity = doctorCaseMapper.selectById(id);
if (entity == null) {
    throw ExceptionUtil.business(ErrorCodeEnums.DOCTOR_CASE_NOT_FOUND);
}
if (!entity.getDoctorId().equals(loginUser.getUserId())) {
    throw ExceptionUtil.business(ErrorCodeEnums.DOCTOR_UPDATE_REJECT);
}
if (entity.getStatus() != DoctorCaseStatusEnums.DRAFT) {
    throw ExceptionUtil.business(ErrorCodeEnums.DOCTOR_DELETE_STATUS_NOT_MATCH);
}
if (doctorCaseMapper.deleteById(id) <= 0) {
    throw ExceptionUtil.business(ErrorCodeEnums.DOCTOR_CASE_DELETE_FAILED);
}
```

Use the existing `@TableLogic deleteFlag` mapping; do not add a physical SQL delete.

- [x] **Step 4: Run the focused backend test again**

Run the same Maven command and expect all `DoctorCaseServiceTest` cases to pass.

### Task 5: Full Cross-Repository Verification

**Files:**
- Inspect only; no additional files unless a verification failure identifies a required fix.

- [x] **Step 1: Review diffs and check whitespace**

Run:

```bash
git diff --check
git status --short
```

Confirm the changes are limited to the doctor case workflow, tests, and the design/plan documents. Do not revert unrelated user changes.

- [x] **Step 2: Run the complete doctor frontend verification under Node 22.23.2**

Run:

```bash
source ~/.nvm/nvm.sh && nvm use 22.23.2 && yarn test && yarn build
```

Expected: Vitest and Vite both exit with code 0.

- [x] **Step 3: Run the backend targeted verification**

Run:

```bash
mvn -Dmaven.repo.local=/Users/suyunhong/.m2/repository \
  -pl medcase-admin \
  -Dtest=DoctorCaseServiceTest \
  -Dsurefire.failIfNoSpecifiedTests=false \
  test
```

Expected: Maven exits with code 0 and the service tests report no failures.

- [x] **Step 4: Report exact verification status**

Report the files changed, the Node version actually used, the frontend test/build results, the backend test result, and any pre-existing or environment failures that remain.
