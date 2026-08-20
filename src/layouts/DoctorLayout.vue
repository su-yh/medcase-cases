<template>
  <div class="doctor-layout">
    <aside class="doctor-sidebar">
      <div class="doctor-brand">
        <span class="doctor-brand-mark">M</span>
        <span>MedCase 医生端</span>
      </div>

      <nav class="doctor-nav" aria-label="医生端导航">
        <router-link to="/cases">病例中心</router-link>
        <router-link to="/cases/submit">提交病例</router-link>
      </nav>

      <div class="doctor-nav-caption">账户</div>
      <nav class="doctor-nav" aria-label="账户导航">
        <button type="button" @click="handleLogout">退出登录</button>
      </nav>

      <div class="doctor-account">
        <span class="doctor-avatar">医</span>
        <span>
          <strong>医生账号</strong>
          <small>MedCase</small>
        </span>
      </div>
    </aside>

    <main class="doctor-main">
      <header class="doctor-topbar">
        <strong>病例工作台</strong>
        <span>审核由管理端完成，医生端只查看结果</span>
      </header>
      <section class="doctor-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function handleLogout() {
  userStore.logout()
  await router.replace('/login')
}
</script>

<style scoped>
.doctor-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr);
  background: var(--el-bg-color-page);
}

.doctor-sidebar {
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color);
}

.doctor-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 10px 30px;
  font-weight: 500;
}

.doctor-brand-mark,
.doctor-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--el-color-primary);
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
}

.doctor-nav {
  display: grid;
  gap: 6px;
}

.doctor-nav a,
.doctor-nav button {
  width: 100%;
  padding: 11px 12px;
  color: var(--el-text-color-secondary);
  border: 0;
  border-radius: 9px;
  background: transparent;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  font: inherit;
}

.doctor-nav a:hover,
.doctor-nav a.router-link-active,
.doctor-nav button:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.doctor-nav-caption {
  margin: 22px 12px 8px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.doctor-account {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 16px 12px 0;
  border-top: 1px solid var(--el-border-color);
}

.doctor-account small {
  display: block;
  color: var(--el-text-color-placeholder);
}

.doctor-main {
  min-width: 0;
}

.doctor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.doctor-topbar span {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.doctor-content {
  padding: 30px;
}

@media (max-width: 760px) {
  .doctor-layout {
    grid-template-columns: 1fr;
  }

  .doctor-sidebar {
    padding: 16px;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color);
  }

  .doctor-nav {
    display: flex;
    overflow-x: auto;
  }

  .doctor-nav a,
  .doctor-nav button {
    min-width: max-content;
  }

  .doctor-nav-caption,
  .doctor-account {
    display: none;
  }

  .doctor-content {
    padding: 22px 16px;
  }
}
</style>
