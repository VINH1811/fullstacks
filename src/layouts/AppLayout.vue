<template>
  <RouterView v-if="isAuthPage" />

  <div v-else class="app-shell" :class="{ 'is-collapsed': collapsed }">

    <!-- ═══ SIDEBAR ═══ -->
    <aside class="sidebar">

      <!-- BRAND -->
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M10 9v14M22 9v14M10 16h12" stroke="white" stroke-width="2.6" stroke-linecap="round"/>
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
            <span class="role-badge" :class="roleTitle.toLowerCase()">{{ roleTitle }}</span>
          </div>
          <div v-if="employeeCode" class="role-code">{{ employeeCode }}</div>
        </div>
        <div v-else class="role-avatar-sm">{{ username.charAt(0).toUpperCase() }}</div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.svg"></svg>
          </div>
          <Transition name="label-fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </Transition>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <!-- SPACER -->
      <div class="sidebar-spacer"></div>

      <!-- COLLAPSE BTN -->
      <button class="collapse-btn" type="button" @click="collapsed = !collapsed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="collapsed"  d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
          <path v-else d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <Transition name="label-fade">
          <span v-if="!collapsed">Thu gọn</span>
        </Transition>
      </button>
    </aside>

    <!-- ═══ MAIN PANEL ═══ -->
    <main class="main-panel">

      <!-- TOPBAR -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="topbar-breadcrumb">
            <span>{{ systemSubtitle }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="breadcrumb-sep">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="breadcrumb-current">{{ route.meta.title || 'Dashboard' }}</span>
          </div>
          <h1 class="topbar-title">{{ route.meta.title || 'Dashboard' }}</h1>
        </div>

        <div class="topbar-actions">
          <!-- Notifications -->
          <button class="topbar-icon-btn" type="button" title="Thông báo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round"/>
            </svg>
            <span class="topbar-icon-dot"></span>
          </button>

          <!-- Divider -->
          <div class="topbar-divider"></div>

          <!-- User chip -->
          <div class="topbar-user">
            <div class="topbar-avatar">{{ username.charAt(0).toUpperCase() }}</div>
            <div class="topbar-user-info">
              <span class="topbar-username">{{ username }}</span>
              <span class="topbar-role">{{ roleTitle }}</span>
            </div>
          </div>

          <button class="btn-logout" type="button" @click="logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke-linecap="round"/>
              <polyline points="16 17 21 12 16 7" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke-linecap="round"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      <!-- PAGE CONTENT -->
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
    path: '/dashboard', label: 'Dashboard', roles: ['Admin', 'HR', 'Employee'],
    svg: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  },
  {
    path: '/employees', label: 'Nhân viên', roles: ['Admin', 'HR'],
    svg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    path: '/departments', label: 'Phòng ban', roles: ['Admin', 'HR'],
    svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    path: '/attendance', label: 'Chấm công', roles: ['Admin', 'HR', 'Employee'],
    svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke-linecap="round"/>',
  },
  {
    path: '/leave', label: 'Nghỉ phép', roles: ['Admin', 'HR', 'Employee'],
    svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  },
  {
    path: '/payroll', label: 'Lương', roles: ['Admin', 'HR', 'Employee'],
    svg: '<line x1="12" y1="1" x2="12" y2="23" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round"/>',
  },
  {
    path: '/reports', label: 'Báo cáo', roles: ['Admin', 'HR'],
    svg: '<line x1="18" y1="20" x2="18" y2="10" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke-linecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke-linecap="round"/>',
  },
  {
    path: '/settings', label: 'Quản trị', roles: ['Admin'],
    svg: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  },
]

const authUser = computed(() => getAuthUser())
const username = computed(() => authUser.value.username || 'Người dùng')
const employeeId = computed(() => authUser.value.employeeId)
const employeeCode = computed(() => authUser.value.employeeCode)
const isEmployeeRole = computed(() => isEmployeeOnly())
const roleTitle = computed(() => {
  if (hasAnyRole(['Admin'])) return 'Admin'
  if (hasAnyRole(['HR'])) return 'HR'
  return 'Employee'
})
const systemSubtitle = computed(() => (isEmployeeRole.value ? 'Employee self-service' : 'HRM Integrated'))
const isAuthPage = computed(() => route.meta.public)
const visibleNavItems = computed(() => navItems.filter((item) => hasAnyRole(item.roles)))

function shortId(value = '') {
  const text = String(value)
  return text.length > 12 ? `${text.slice(0, 8)}...` : text
}

function logout() {
  clearAuth()
  router.replace('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');

/* ═══ TOKENS ═══ */
.app-shell {
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 68px;
  --sidebar-bg: #0f172a;
  --sidebar-border: rgba(255,255,255,.06);
  --sidebar-item-hover: rgba(255,255,255,.05);
  --sidebar-item-active-bg: rgba(124,58,237,.18);
  --sidebar-item-active-text: #a78bfa;
  --sidebar-text: #64748b;
  --sidebar-text-hover: #cbd5e1;
  --accent: #7c3aed;
  --accent-soft: rgba(124,58,237,.15);
  --topbar-h: 60px;
  --radius: 12px;

  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f1f5f9;
}

/* ═══ SIDEBAR ═══ */
.sidebar {
  width: var(--sidebar-w);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width .25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  position: relative;
  z-index: 40;
}
.is-collapsed .sidebar { width: var(--sidebar-w-collapsed); }

/* BRAND */
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 14px;
  height: 64px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}
.brand-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(124,58,237,.4);
}
.brand-mark svg { width: 20px; height: 20px; }
.brand-text strong { display: block; font-size: 14px; font-weight: 800; color: #f8fafc; white-space: nowrap; letter-spacing: -0.2px; }
.brand-text span   { display: block; font-size: 10px; color: #475569; font-weight: 500; margin-top: 1px; white-space: nowrap; }

/* USER CARD */
.role-card {
  margin: 12px 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--sidebar-border);
  display: flex;
  align-items: center;
  gap: 10px;
}
.role-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white; flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(124,58,237,.35);
}
.role-avatar-sm {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white;
  margin: 12px auto;
  box-shadow: 0 3px 8px rgba(124,58,237,.35);
}
.role-info { flex: 1; min-width: 0; }
.role-info strong { display: block; font-size: 12px; font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.role-badge {
  display: inline-block; margin-top: 3px;
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
  padding: 2px 7px; border-radius: 20px;
}
.role-badge.admin    { background: rgba(124,58,237,.25); color: #a78bfa; }
.role-badge.hr       { background: rgba(8,145,178,.2);   color: #67e8f9; }
.role-badge.employee { background: rgba(5,150,105,.2);   color: #6ee7b7; }
.role-code { font-size: 10px; color: #475569; font-weight: 600; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

/* NAV DIVIDER */
.nav-divider {
  padding: 0 16px;
  margin-bottom: 4px;
}
.nav-divider span {
  font-size: 9px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .8px; color: #334155;
}

/* NAV LIST */
.nav-list {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0 8px; overflow-y: auto; overflow-x: hidden;
  flex: 1;
}
.nav-list::-webkit-scrollbar { width: 0; }

.nav-item {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 10px; border-radius: 10px;
  text-decoration: none; color: var(--sidebar-text);
  font-size: 13px; font-weight: 600;
  transition: all .15s cubic-bezier(.4,0,.2,1);
  white-space: nowrap; overflow: hidden;
  animation: navItemIn .35s ease backwards;
  position: relative;
}
.nav-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-hover);
}
.nav-item.router-link-active {
  background: var(--sidebar-item-active-bg);
  color: var(--sidebar-item-active-text);
}
.nav-item.router-link-active::before {
  content: '';
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 20px; border-radius: 0 2px 2px 0;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(124,58,237,.6);
}
@keyframes navItemIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }

.nav-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .15s;
}
.nav-icon svg { width: 16px; height: 16px; }
.nav-item.router-link-active .nav-icon {
  background: var(--accent);
  box-shadow: 0 3px 8px rgba(124,58,237,.4);
  color: white;
}
.nav-item.router-link-active .nav-icon svg { stroke: white; }

.nav-label { flex: 1; }
.nav-badge {
  flex-shrink: 0; min-width: 18px; height: 18px; padding: 0 5px;
  background: var(--accent); color: white;
  font-size: 9px; font-weight: 800; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
}

/* SPACER + COLLAPSE */
.sidebar-spacer { flex: 0 0 8px; }

.collapse-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 8px 10px 16px;
  padding: 9px 12px; border-radius: 10px;
  background: none; border: 1px solid var(--sidebar-border);
  color: #475569; font-size: 12px; font-weight: 600;
  font-family: inherit; cursor: pointer;
  transition: all .15s; white-space: nowrap; overflow: hidden;
}
.collapse-btn:hover { background: var(--sidebar-item-hover); color: #94a3b8; border-color: rgba(255,255,255,.1); }
.collapse-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

/* ═══ MAIN PANEL ═══ */
.main-panel {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ═══ TOPBAR ═══ */
.topbar {
  height: var(--topbar-h);
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; gap: 16px; flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(15,23,42,.05);
}
.topbar-left {}
.topbar-breadcrumb {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px;
}
.breadcrumb-sep { width: 12px; height: 12px; color: #cbd5e1; }
.breadcrumb-current { color: var(--accent); }
.topbar-title {
  margin: 0; font-size: 18px; font-weight: 800;
  color: #0f172a; letter-spacing: -0.4px; line-height: 1;
}

.topbar-actions {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.topbar-icon-btn {
  position: relative; width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b;
  cursor: pointer; transition: all .15s;
}
.topbar-icon-btn:hover { background: #f1f5f9; color: var(--accent); border-color: #c4b5fd; }
.topbar-icon-btn svg { width: 16px; height: 16px; }
.topbar-icon-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #e11d48; border: 2px solid white;
}
.topbar-divider { width: 1px; height: 28px; background: #e2e8f0; margin: 0 4px; }
.topbar-user {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 12px 5px 5px;
  border-radius: 10px; border: 1px solid transparent;
  transition: all .15s; cursor: default;
}
.topbar-user:hover { background: #f8fafc; border-color: #e2e8f0; }
.topbar-avatar {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
}
.topbar-username { display: block; font-size: 12px; font-weight: 700; color: #1e293b; line-height: 1.2; }
.topbar-role     { display: block; font-size: 10px; color: #94a3b8; font-weight: 600; line-height: 1.2; }

.btn-logout {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 10px; border: 1px solid #fecaca;
  background: #fff1f2; color: #e11d48;
  font-size: 12px; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-logout:hover { background: #e11d48; color: white; border-color: #e11d48; }
.btn-logout svg { width: 14px; height: 14px; }

/* ═══ PAGE CONTENT ═══ */
.page-content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  background: #f1f5f9;
}
.page-content::-webkit-scrollbar { width: 5px; }
.page-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

/* ═══ TRANSITIONS ═══ */
.label-fade-enter-active { transition: opacity .18s ease, transform .18s ease; }
.label-fade-leave-active { transition: opacity .12s ease, transform .12s ease; }
.label-fade-enter-from  { opacity: 0; transform: translateX(-6px); }
.label-fade-leave-to    { opacity: 0; transform: translateX(-6px); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .topbar-user-info { display: none; }
}
</style>
