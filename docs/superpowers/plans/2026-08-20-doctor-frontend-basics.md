# Doctor Frontend Basics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated doctor-frontend foundation with token handling, user state, API response adaptation, request interception, expired-session handling, and dynamic document titles.

**Architecture:**
Keep doctor frontend completely separate from the admin frontend. The app will own its own token utility, Pinia user store, API client, route metadata, and auth guards. All cross-cutting behavior (success/error normalization, login expiry, title updates) will live in a small set of shared doctor-only utilities.

**Tech Stack:**
Vue 3, Element Plus, Vite, Pinia, Vue Router, Axios, Yarn.

---

### Task 1: Doctor auth token utilities

**Files:**
- Create: `src/utils/auth.js`
- Test: `src/utils/auth.spec.js` (if test tooling is added later; otherwise verify by unit usage in store/request)

- [ ] **Step 1: Write the failing test**

```js
import { clearToken, getToken, setToken } from '@/utils/auth'

test('token utilities persist and clear the doctor token', () => {
  clearToken()
  setToken('doctor-token')
  expect(getToken()).toBe('doctor-token')
  clearToken()
  expect(getToken()).toBe('')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/utils/auth.spec.js`
Expected: FAIL because the file and helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
const KEY = 'doctor_token'

export function getToken() {
  return localStorage.getItem(KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(KEY, token)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/utils/auth.spec.js`
Expected: PASS.

---

### Task 2: Doctor API response and request client

**Files:**
- Modify: `src/utils/request.js`
- Create: `src/utils/error.js`
- Create: `src/utils/response.js`
- Modify: `src/api/doctor/auth.js`

- [ ] **Step 1: Write the failing test**

```js
import { unwrapResponse } from '@/utils/response'

test('unwrapResponse returns data for success payloads', () => {
  expect(unwrapResponse({ code: 0, msg: '操作成功', data: 'token' })).toBe('token')
})

test('unwrapResponse throws when code is non-zero', () => {
  expect(() => unwrapResponse({ code: 2000007, msg: '医生账号不存在' })).toThrow('医生账号不存在')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/utils/response.spec.js`
Expected: FAIL because `unwrapResponse` is not implemented yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function unwrapResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('请求失败')
  }
  if (payload.code === 0) {
    return payload.data
  }
  throw new Error(payload.msg || payload.message || '请求失败')
}
```

```js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearToken } from './auth'
import { unwrapResponse } from './response'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

service.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => unwrapResponse(response.data),
  (error) => {
    const message = error.response?.data?.msg || error.response?.data?.message || error.message || '请求失败'
    if (error.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn build:prod`
Expected: PASS.

---

### Task 3: Doctor user Pinia store

**Files:**
- Create: `src/stores/user.js`
- Create: `src/api/doctor/index.js` if a single entry file is preferred later
- Modify: `src/router/index.js`

- [ ] **Step 1: Write the failing test**

```js
import { setActivePinia, createPinia } from 'pinia'
import useUserStore from '@/stores/user'

test('login stores doctor token and user info', async () => {
  setActivePinia(createPinia())
  const store = useUserStore()
  await store.setToken('doctor-token')
  expect(store.token).toBe('doctor-token')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/stores/user.spec.js`
Expected: FAIL because the store does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
import { defineStore } from 'pinia'
import { getToken, setToken, clearToken } from '@/utils/auth'

const useUserStore = defineStore('doctor-user', {
  state: () => ({
    token: getToken(),
    userInfo: null
  }),
  actions: {
    setToken(token) {
      this.token = token
      setToken(token)
    },
    logout() {
      this.token = ''
      this.userInfo = null
      clearToken()
    }
  }
})

export default useUserStore
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn build:prod`
Expected: PASS.

---

### Task 4: Doctor router guards, title, and auth pages

**Files:**
- Modify: `src/router/index.js`
- Create: `src/utils/title.js`
- Modify: `src/main.js`
- Modify: `src/views/auth/LoginView.vue`
- Modify: `src/views/auth/RegisterView.vue`

- [ ] **Step 1: Write the failing test**

```js
import { buildTitle } from '@/utils/title'

test('buildTitle appends app name', () => {
  expect(buildTitle('登录')).toBe('登录 - MedCase 病例端')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/utils/title.spec.js`
Expected: FAIL because the title helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function buildTitle(pageTitle) {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'MedCase 病例端'
  return pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
}
```

```js
router.beforeEach((to) => {
  document.title = buildTitle(to.meta?.title)
  return true
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn build:prod`
Expected: PASS.

---

### Task 5: Verification and cleanup

**Files:**
- Modify: `README.md`
- Modify: `.env.development` if needed

- [ ] **Step 1: Run production build**

Run: `yarn build:prod`
Expected: PASS with no unresolved imports.

- [ ] **Step 2: Confirm doctor-only isolation**

Run: `rg -n "medcase-admin|RuoYi-Vue3|admin" src README.md package.json`
Expected: no admin frontend implementation references in doctor source files.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: initialize doctor frontend foundation"
```
