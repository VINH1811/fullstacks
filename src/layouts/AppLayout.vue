<template>
  <RouterView v-if="isAuthPage" />

  <div v-else class="app-shell" :class="{ 'is-collapsed': collapsed }">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <!-- BRAND -->
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M10 9v14M22 9v14M10 16h12" stroke="white" stroke-width="2.6" stroke-linecap="round" />
          </svg>
        </div>

        <Transition name="label-fade">
          <div v-if="!collapsed" class="brand-text">
            <strong>WLPRO HRM</strong>
            <span>Integrated System</span>
          </div>
        </Transition>
      </div>

      <!-- USER CARD -->
      <Transition name="label-fade">
        <div v-if="!collapsed" class="role-card">
          <div class="role-avatar">{{ username.charAt(0).toUpperCase() }}</div>

          <div class="role-info">
            <strong>{{ username }}</strong>
            <span class="role-badge" :class="roleTitle.toLowerCase()">
              {{ roleTitle }}
            </span>
          </div>

          <div v-if="employeeCode" class="role-code">{{ employeeCode }}</div>
        </div>

        <div v-else class="role-avatar-sm">
          {{ username.charAt(0).toUpperCase() }}
        </div>
      </Transition>

      <!-- DIVIDER -->
      <div class="nav-divider">
        <span v-if="!collapsed">Menu</span>
      </div>

      <!-- NAV -->
      <nav class="nav-list">
        <RouterLink
          v-for="(item, idx) in visibleNavItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :style="{ animationDelay: idx * 40 + 'ms' }"
          :title="collapsed ? item.label : undefined"
        >
          <div class="nav-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              v-html="item.svg"
            ></svg>
          </div>

          <Transition name="label-fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </Transition>

          <span v-if="!collapsed && item.badge" class="nav-badge">
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <div class="sidebar-spacer"></div>

      <!-- COLLAPSE BUTTON -->
      <button class="collapse-btn" type="button" @click="collapsed = !collapsed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            v-if="collapsed"
            d="M9 18l6-6-6-6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M15 18l-6-6 6-6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <Transition name="label-fade">
          <span v-if="!collapsed">Thu gọn</span>
        </Transition>
      </button>
    </aside>

    <!-- MAIN -->
    <main class="main-panel">
      <!-- TOPBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="topbar-breadcrumb">
            <span>{{ systemSubtitle }}</span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="breadcrumb-sep"
            >
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <span class="breadcrumb-current">
              {{ route.meta.title || 'Dashboard' }}
            </span>
          </div>

          <h1 class="topbar-title">
            {{ route.meta.title || 'Dashboard' }}
          </h1>
        </div>

        <div class="topbar-actions">
          <button class="topbar-icon-btn" type="button" title="Thông báo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" />
            </svg>
            <span class="topbar-icon-dot"></span>
          </button>

          <div class="topbar-divider"></div>

          <div class="topbar-user">
            <div class="topbar-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </div>

            <div class="topbar-user-info">
              <span class="topbar-username">{{ username }}</span>
              <span class="topbar-role">{{ roleTitle }}</span>
            </div>
          </div>

          <button class="btn-logout" type="button" @click="logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round" />
              <polyline points="16 17 21 12 16 7" stroke-linecap="round" stroke-linejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { clearAuth, getAuthUser, hasAnyRole, isEmployeeOnly } from '../services/auth'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    roles: ['Admin', 'HR', 'Employee'],
    svg: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  },
  {
    path: '/employees',
    label: 'Nhân viên',
    roles: ['Admin', 'HR'],
    svg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    path: '/departments',
    label: 'Phòng ban',
    roles: ['Admin', 'HR'],
    svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    path: '/attendance',
    label: 'Chấm công',
    roles: ['Admin', 'HR', 'Employee'],
    svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke-linecap="round"/>',
  },
  {
    path: '/leave',
    label: 'Nghỉ phép',
    roles: ['Admin', 'HR', 'Employee'],
    svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  },
  {
    path: '/payroll',
    label: 'Lương',
    roles: ['Admin', 'HR', 'Employee'],
    svg: '<line x1="12" y1="1" x2="12" y2="23" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round"/>',
  },
  {
    path: '/reports',
    label: 'Báo cáo',
    roles: ['Admin', 'HR'],
    svg: '<line x1="18" y1="20" x2="18" y2="10" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke-linecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke-linecap="round"/>',
  },
  {
    path: '/settings',
    label: 'Quản trị',
    roles: ['Admin'],
    svg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  },
]

const authUser = computed(() => getAuthUser())
const username = computed(() => authUser.value.username || 'Người dùng')
const employeeCode = computed(() => authUser.value.employeeCode)

const isEmployeeRole = computed(() => isEmployeeOnly())

const roleTitle = computed(() => {
  if (hasAnyRole(['Admin'])) return 'Admin'
  if (hasAnyRole(['HR'])) return 'HR'
  return 'Employee'
})

const systemSubtitle = computed(() =>
  isEmployeeRole.value ? 'Employee Self-Service' : 'HRM Integrated'
)

const isAuthPage = computed(() => route.meta.public)
const visibleNavItems = computed(() => navItems.filter((item) => hasAnyRole(item.roles)))

function logout() {
  clearAuth()
  router.replace('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

.app-shell {
  --sidebar-w: 256px;
  --sidebar-w-collapsed: 82px;

  --sidebar-bg: #fbfdff;
  --sidebar-bg-2: #f3f7ff;
  --sidebar-border: #dbe5f4;

  --sidebar-item-hover: #eef4ff;
  --sidebar-item-active-bg: linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%);
  --sidebar-item-active-border: #a78bfa;
  --sidebar-item-active-text: #5b21b6;

  --sidebar-text: #64748b;
  --sidebar-text-hover: #172554;

  --accent: #7c3aed;
  --accent-2: #2563eb;
  --topbar-h: 72px;

  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;

  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  background: linear-gradient(135deg, #f7faff 0%, #eef4ff 100%);
  color: #0f172a;
}

/* SIDEBAR */
.sidebar {
  width: var(--sidebar-w);
  background:
    radial-gradient(circle at 30% 8%, rgba(124, 58, 237, .10), transparent 34%),
    linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-2) 100%);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 14px 0 35px rgba(15, 23, 42, .07);

  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  overflow: hidden;
  position: relative;
  z-index: 40;

  transition: width .24s cubic-bezier(.4, 0, .2, 1);
}

.is-collapsed .sidebar {
  width: var(--sidebar-w-collapsed);
}

/* BRAND */
.brand {
  height: 76px;
  padding: 0 18px;

  display: flex;
  align-items: center;
  gap: 12px;

  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.is-collapsed .brand {
  justify-content: center;
  padding: 0;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 13px;

  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  box-shadow: 0 12px 24px rgba(124, 58, 237, .22);
}

.brand-mark svg {
  width: 22px;
  height: 22px;
}

.brand-text strong {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  letter-spacing: -.35px;
}

.brand-text span {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
}

/* USER CARD */
.role-card {
  margin: 16px 14px 18px;
  padding: 13px;
  border-radius: 14px;

  background: rgba(255, 255, 255, .82);
  border: 1px solid #dde7f6;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .06);

  display: flex;
  align-items: center;
  gap: 11px;
}

.role-avatar,
.role-avatar-sm,
.topbar-avatar {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #fff;
}

.role-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;

  box-shadow: 0 10px 18px rgba(124, 58, 237, .20);
}

.role-avatar-sm {
  width: 42px;
  height: 42px;
  margin: 16px auto 18px;
  border-radius: 13px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 800;

  box-shadow: 0 10px 18px rgba(124, 58, 237, .20);
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-info strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  display: inline-block;
  margin-top: 4px;
  padding: 3px 9px;
  border-radius: 999px;

  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .55px;
}

.role-badge.admin {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #c4b5fd;
}

.role-badge.hr {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.role-badge.employee {
  background: #dcfce7;
  color: #047857;
  border: 1px solid #bbf7d0;
}

.role-code {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
}

/* NAV DIVIDER */
.nav-divider {
  padding: 0 20px;
  margin: 0 0 8px;
}

.nav-divider span {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
}

.is-collapsed .nav-divider {
  width: 42px;
  height: 1px;
  padding: 0;
  margin: 0 auto 12px;
  background: #dbe5f4;
}

.is-collapsed .nav-divider span {
  display: none;
}

/* NAV LIST */
.nav-list {
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 0 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-list::-webkit-scrollbar {
  width: 0;
}

.nav-item {
  min-height: 48px;
  padding: 8px 10px;
  border-radius: 14px;
  border: 1px solid transparent;

  display: flex;
  align-items: center;
  gap: 12px;

  text-decoration: none;
  color: var(--sidebar-text);
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;

  position: relative;
  animation: navItemIn .32s ease backwards;

  transition:
    transform .16s ease,
    background .16s ease,
    color .16s ease,
    border-color .16s ease,
    box-shadow .16s ease;
}

.nav-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-hover);
  transform: translateX(2px);
}

.nav-item.router-link-active {
  background: var(--sidebar-item-active-bg);
  color: var(--sidebar-item-active-text);
  border-color: var(--sidebar-item-active-border);
  box-shadow: 0 10px 24px rgba(124, 58, 237, .12);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
}

@keyframes navItemIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;

  transition: all .16s ease;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-item.router-link-active .nav-icon {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 10px 20px rgba(124, 58, 237, .22);
}

.nav-item.router-link-active .nav-icon svg {
  stroke: currentColor;
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;

  background: var(--accent);
  color: #fff;

  font-size: 10px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;
}

/* QUAN TRỌNG: SỬA LỖI THU GỌN BỊ CẮT ICON */
.is-collapsed .nav-list {
  padding: 0 14px;
  align-items: center;
}

.is-collapsed .nav-item {
  width: 52px;
  height: 52px;
  min-height: 52px;
  padding: 0;
  border-radius: 15px;

  justify-content: center;
  gap: 0;
}

.is-collapsed .nav-item:hover {
  transform: translateY(-1px);
}

.is-collapsed .nav-item.router-link-active::before {
  display: none;
}

.is-collapsed .nav-icon {
  width: 40px;
  height: 40px;
  margin: 0;
}

.is-collapsed .nav-label,
.is-collapsed .nav-badge {
  display: none;
}

/* COLLAPSE BUTTON */
.sidebar-spacer {
  flex: 0 0 10px;
}

.collapse-btn {
  min-height: 46px;
  margin: 10px 14px 18px;
  padding: 10px 12px;
  border-radius: 14px;

  background: rgba(255, 255, 255, .72);
  border: 1px solid #dbe5f4;
  color: #64748b;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-size: 13px;
  font-weight: 700;
  font-family: inherit;

  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;

  transition: all .16s ease;
}

.collapse-btn:hover {
  background: #eef4ff;
  color: var(--accent);
  border-color: #c4b5fd;
}

.collapse-btn svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.is-collapsed .collapse-btn {
  width: 52px;
  height: 52px;
  min-height: 52px;
  padding: 0;
  margin: 10px auto 18px;
}

/* MAIN PANEL */
.main-panel {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

/* TOPBAR */
.topbar {
  height: var(--topbar-h);
  padding: 0 28px;
  gap: 18px;

  background: rgba(255, 255, 255, .92);
  border-bottom: 1px solid #dbe5f4;
  box-shadow: 0 8px 28px rgba(15, 23, 42, .05);
  backdrop-filter: blur(16px);

  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-shrink: 0;
}

.topbar-left {
  min-width: 0;
}

.topbar-breadcrumb {
  margin-bottom: 4px;

  display: flex;
  align-items: center;
  gap: 6px;

  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .55px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-sep {
  width: 12px;
  height: 12px;
  color: #cbd5e1;
  flex-shrink: 0;
}

.breadcrumb-current {
  color: var(--accent);
}

.topbar-title {
  margin: 0;

  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -.45px;
  line-height: 1.05;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.topbar-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #f8fbff;
  border: 1px solid #dbe5f4;
  color: #475569;

  cursor: pointer;
  transition: all .16s ease;
}

.topbar-icon-btn:hover {
  background: #eef4ff;
  color: var(--accent);
  border-color: #c4b5fd;
}

.topbar-icon-btn svg {
  width: 17px;
  height: 17px;
}

.topbar-icon-dot {
  position: absolute;
  top: 7px;
  right: 7px;

  width: 8px;
  height: 8px;
  border-radius: 50%;

  background: #f43f5e;
  border: 2px solid #fff;
}

.topbar-divider {
  width: 1px;
  height: 28px;
  margin: 0 2px;
  background: #dbe5f4;
}

.topbar-user {
  padding: 6px 12px 6px 6px;
  border-radius: 14px;

  background: #fff;
  border: 1px solid #dbe5f4;
  box-shadow: 0 8px 20px rgba(15, 23, 42, .04);

  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.topbar-username {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.topbar-role {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  font-weight: 700;
  line-height: 1.2;
}

.btn-logout {
  padding: 10px 15px;
  border-radius: 13px;

  border: 1px solid #fecdd3;
  background: #fff5f6;
  color: #e11d48;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  font-size: 12px;
  font-weight: 800;
  font-family: inherit;

  cursor: pointer;
  white-space: nowrap;

  transition: all .16s ease;
}

.btn-logout:hover {
  background: #e11d48;
  color: #fff;
  border-color: #e11d48;
  transform: translateY(-1px);
}

.btn-logout svg {
  width: 15px;
  height: 15px;
}

/* PAGE CONTENT */
.page-content {
  flex: 1;

  overflow-y: auto;
  overflow-x: hidden;

  background:
    radial-gradient(circle at 12% 10%, rgba(124, 58, 237, .06), transparent 24%),
    linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.page-content::-webkit-scrollbar {
  width: 6px;
}

.page-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

/* TRANSITION */
.label-fade-enter-active {
  transition: opacity .16s ease, transform .16s ease;
}

.label-fade-leave-active {
  transition: opacity .10s ease, transform .10s ease;
}

.label-fade-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .topbar {
    padding: 0 18px;
  }

  .topbar-user-info {
    display: none;
  }

  .btn-logout {
    padding: 10px 12px;
  }
}

@media (max-width: 768px) {
  .app-shell {
    --sidebar-w: var(--sidebar-w-collapsed);
  }

  .sidebar {
    width: var(--sidebar-w-collapsed);
    position: relative;
  }

  .brand {
    justify-content: center;
    padding: 0;
  }

  .brand-text,
  .role-card,
  .nav-divider span,
  .nav-label,
  .nav-badge,
  .collapse-btn span,
  .topbar-breadcrumb,
  .topbar-divider {
    display: none !important;
  }

  .nav-divider {
    width: 42px;
    height: 1px;
    padding: 0;
    margin: 0 auto 12px;
    background: #dbe5f4;
  }

  .nav-list {
    padding: 0 14px;
    align-items: center;
  }

  .nav-item {
    width: 52px;
    height: 52px;
    min-height: 52px;
    padding: 0;
    justify-content: center;
    gap: 0;
  }

  .nav-item.router-link-active::before {
    display: none;
  }

  .collapse-btn {
    width: 52px;
    height: 52px;
    min-height: 52px;
    padding: 0;
    margin: 10px auto 18px;
  }

  .topbar {
    height: 64px;
    padding: 0 14px;
  }

  .topbar-title {
    font-size: 17px;
    max-width: 42vw;
  }

  .btn-logout {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    gap: 0;
    font-size: 0;
  }

  .btn-logout svg {
    width: 16px;
    height: 16px;
  }
}
</style>
