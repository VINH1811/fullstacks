import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import EmployeeView from '../views/EmployeeView.vue'
import DepartmentView from '../views/DepartmentView.vue'
import AttendanceView from '../views/AttendanceView.vue'
import LeaveView from '../views/LeaveView.vue'
import PayrollView from '../views/PayrollView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { hasAnyRole, isAuthenticated } from '../services/auth'

const ADMIN = ['Admin']
const ADMIN_HR = ['Admin', 'HR']
const ALL = ['Admin', 'HR', 'Employee']

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginView, meta: { public: true, title: 'Đăng nhập' } },
  { path: '/register', component: RegisterView, meta: { public: true, title: 'Đăng ký nhân viên' } },
  { path: '/dashboard', component: DashboardView, meta: { title: 'Dashboard tổng quan', roles: ALL } },
  { path: '/employees', component: EmployeeView, meta: { title: 'HR Core - Hồ sơ nhân viên', roles: ADMIN_HR } },
  { path: '/departments', component: DepartmentView, meta: { title: 'HR Core - Cơ cấu phòng ban', roles: ADMIN_HR } },
  { path: '/attendance', component: AttendanceView, meta: { title: 'Attendance Service - Chấm công', roles: ALL } },
  { path: '/leave', component: LeaveView, meta: { title: 'Attendance Service - Nghỉ phép', roles: ALL } },
  { path: '/payroll', component: PayrollView, meta: { title: 'Payroll Service - Bảng lương', roles: ALL } },
  { path: '/reports', component: ReportsView, meta: { title: 'Báo cáo tổng hợp', roles: ADMIN_HR } },
  { path: '/settings', component: SettingsView, meta: { title: 'Quản trị hệ thống', roles: ADMIN } },
  { path: '/forbidden', redirect: '/dashboard' },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.public) {
    if (to.path === '/login' && isAuthenticated()) return '/dashboard'
    return true
  }

  if (!isAuthenticated()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const roles = to.meta.roles || []
  if (roles.length && !hasAnyRole(roles)) return '/dashboard'

  return true
})

export default router
