import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '../views/IndexView.vue'
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
  // Trang index mở đầu tiên khi chạy dự án
  {
    path: '/',
    name: 'home',
    component: IndexView,
    meta: {
      public: true,
      title: 'Trang chủ'
    }
  },

  // Đăng nhập
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      public: true,
      title: 'Đăng nhập'
    }
  },

  // Đăng ký
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      public: true,
      title: 'Đăng ký nhân viên'
    }
  },

  // Dashboard
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Dashboard tổng quan',
      roles: ALL
    }
  },

  // Quản lý nhân viên
  {
    path: '/employees',
    name: 'employees',
    component: EmployeeView,
    meta: {
      title: 'HR Core - Hồ sơ nhân viên',
      roles: ADMIN_HR
    }
  },

  // Quản lý phòng ban
  {
    path: '/departments',
    name: 'departments',
    component: DepartmentView,
    meta: {
      title: 'HR Core - Cơ cấu phòng ban',
      roles: ADMIN_HR
    }
  },

  // Chấm công
  {
    path: '/attendance',
    name: 'attendance',
    component: AttendanceView,
    meta: {
      title: 'Attendance Service - Chấm công',
      roles: ALL
    }
  },

  // Nghỉ phép
  {
    path: '/leave',
    name: 'leave',
    component: LeaveView,
    meta: {
      title: 'Attendance Service - Nghỉ phép',
      roles: ALL
    }
  },

  // Bảng lương
  {
    path: '/payroll',
    name: 'payroll',
    component: PayrollView,
    meta: {
      title: 'Payroll Service - Bảng lương',
      roles: ALL
    }
  },

  // Báo cáo
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: {
      title: 'Báo cáo tổng hợp',
      roles: ADMIN_HR
    }
  },

  // Cài đặt hệ thống
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Quản trị hệ thống',
      roles: ADMIN
    }
  },

  // Không có quyền
  {
    path: '/forbidden',
    name: 'forbidden',
    redirect: '/'
  },

  // Không tìm thấy đường dẫn
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  // Khi chuyển trang sẽ cuộn lên đầu trang
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 90
      }
    }

    return {
      top: 0,
      behavior: 'smooth'
    }
  }
})

router.beforeEach((to) => {
  // Đổi tiêu đề tab trình duyệt
  document.title = to.meta.title
    ? `${to.meta.title} | HR Management`
    : 'HR Management'

  // Cho phép truy cập các trang public
  if (to.meta.public) {
    // Người đã đăng nhập vẫn được phép xem trang index
    if (to.path === '/') {
      return true
    }

    // Người đã đăng nhập không cần vào lại trang login/register
    if (
      isAuthenticated() &&
      (to.path === '/login' || to.path === '/register')
    ) {
      return '/dashboard'
    }

    return true
  }

  // Chưa đăng nhập thì chuyển sang login
  if (!isAuthenticated()) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  // Kiểm tra quyền truy cập
  const roles = to.meta.roles || []

  if (roles.length && !hasAnyRole(roles)) {
    return '/dashboard'
  }

  return true
})

export default router
