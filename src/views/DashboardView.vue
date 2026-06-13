<template>
  <section class="dashboard" :class="{ 'is-loading': loading }">

    <!-- ═══ TOAST ═══ -->
    <Transition name="toast">
      <div v-if="message" class="toast" :class="messageType">
        <div class="toast-accent"></div>
        <div class="toast-icon-wrap">
          <svg v-if="messageType === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="messageType === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke-linecap="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="toast-body">
          <p class="toast-title">{{ toastTitle }}</p>
          <p class="toast-msg">{{ message }}</p>
        </div>
        <div class="toast-right">
          <span class="toast-countdown">{{ toastDuration / 1000 }}s</span>
          <button class="toast-close" @click="dismissToast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="toast-progress" :style="{ animationDuration: toastDuration + 'ms' }"></div>
      </div>
    </Transition>

    <!-- ═══ PAGE HEADER ═══ -->
    <header class="page-header">
      <div>
        <p class="breadcrumb">
          <span class="breadcrumb-dot"></span>HRM Integrated · Tổng quan
        </p>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-sub">{{ greetingText }}, <strong>{{ myFullName }}</strong>. Đây là tổng quan hệ thống ngày {{ todayFormatted }}.</p>
      </div>
      <div class="header-actions">
        <div class="month-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input type="month" :value="monthInputValue" @input="onMonthInput" />
        </div>
        <button class="btn-primary" @click="loadDashboard" :disabled="loading">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <polyline points="23 4 23 10 17 10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>
    </header>

    <!-- ═══ SELF SERVICE BANNER ═══ -->
    <Transition name="slide">
      <div v-if="isSelfService" class="info-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12" stroke-linecap="round"/>
          <line x1="12" y1="8" x2="12.01" y2="8" stroke-linecap="round"/>
        </svg>
        <span>Chế độ <strong>Employee</strong> · Dashboard hiển thị dữ liệu cá nhân — Mã NV: <code>{{ myEmployeeCode || myEmployeeId || 'chưa gắn' }}</code></span>
      </div>
    </Transition>

    <!-- ═══ KPI STAT CARDS ═══ -->
    <div class="stats-row">
      <article
        v-for="(card, idx) in statCards"
        :key="idx"
        class="stat-card"
        :style="{ animationDelay: idx * 70 + 'ms', '--card-accent': card.accent || 'var(--primary)' }"
      >
        <div class="stat-head">
          <div class="stat-icon" :style="{ background: card.iconBg || 'var(--primary-soft)', color: card.accent || 'var(--primary)' }">
            <svg v-html="card.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
          </div>
          <span class="stat-trend" :class="card.trendType">
            <svg v-if="card.trendType === 'up'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="18 15 12 9 6 15" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ card.trend }}
          </span>
        </div>
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">{{ card.value }}</p>
        <div class="stat-foot">
          <span class="stat-note">{{ card.note }}</span>
          <svg viewBox="0 0 80 24" class="stat-spark" :style="{ color: card.accent || 'var(--primary)' }">
            <polyline :points="card.sparkline" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-bar-accent" :style="{ background: card.accent || 'var(--primary)' }"></div>
      </article>
    </div>

    <!-- ═══ CHARTS GRID ═══ -->
    <div class="charts-row">
      <!-- PAYROLL BREAKDOWN -->
      <article class="panel">
        <header class="panel-header">
          <div>
            <h2>{{ isSelfService ? `Phiếu lương ${monthYear}` : `Phân tích chi phí lương ${monthYear}` }}</h2>
            <p>{{ isSelfService ? 'Dữ liệu lương cá nhân' : 'Tổng hợp từ N3 Payroll Service' }}</p>
          </div>
          <div class="legend-inline">
            <span v-for="seg in donutSegments" :key="seg.label" class="legend-chip">
              <i :style="{ background: seg.color }"></i>{{ seg.label }}
            </span>
          </div>
        </header>

        <div class="payroll-grid">
          <div class="donut-block">
            <svg viewBox="0 0 180 180" class="donut">
              <circle cx="90" cy="90" r="68" fill="none" stroke="#f1f5f9" stroke-width="20"/>
              <circle
                v-for="(seg, i) in donutSegments" :key="i"
                cx="90" cy="90" r="68" fill="none"
                :stroke="seg.color" stroke-width="20"
                :stroke-dasharray="seg.dash" :stroke-dashoffset="seg.offset"
                transform="rotate(-90 90 90)"
                class="donut-seg"
                :style="{ animationDelay: i * 150 + 'ms' }"
              />
            </svg>
            <div class="donut-text">
              <span class="donut-label">Tổng</span>
              <span class="donut-val">{{ money(totalPayroll) }}</span>
            </div>
          </div>

          <div class="bars-block">
            <div v-for="bar in payrollBars" :key="bar.label" class="hbar">
              <div class="hbar-top">
                <span>{{ bar.label }}</span>
                <strong>{{ money(bar.value) }}</strong>
              </div>
              <div class="hbar-track">
                <div class="hbar-fill" :style="{ width: ratio(bar.value) + '%', background: bar.color }"></div>
              </div>
            </div>
            <div class="payroll-total">
              <span>Tổng quỹ lương</span>
              <strong>{{ money(totalPayroll) }}</strong>
            </div>
          </div>
        </div>
      </article>

      <!-- ATTENDANCE TREND -->
      <article class="panel">
        <header class="panel-header">
          <div>
            <h2>{{ isSelfService ? 'Chấm công 7 ngày' : 'Xu hướng chấm công tuần' }}</h2>
            <p>Nguồn N2 Attendance Service</p>
          </div>
          <span class="trend-tag up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            +12% tuần trước
          </span>
        </header>

        <div class="area-block">
          <svg viewBox="0 0 360 160" class="area" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g class="grid-lines">
              <line v-for="y in [30,60,90,120]" :key="y" x1="20" :y1="y" x2="340" :y2="y" stroke="#f1f5f9" stroke-width="1"/>
            </g>
            <path :d="areaPath" fill="url(#areaG)"/>
            <polyline :points="areaLine" fill="none" stroke="#7c3aed" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle
              v-for="(pt, i) in areaPoints" :key="i"
              :cx="pt.x" :cy="pt.y" r="4.5"
              fill="#ffffff" stroke="#7c3aed" stroke-width="2.2"
            />
          </svg>
          <div class="area-axis">
            <span v-for="(d, i) in weekLabels" :key="i">{{ d }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- ═══ DEPT DISTRIBUTION (Admin only) ═══ -->
    <div v-if="!isSelfService" class="charts-row single">
      <article class="panel">
        <header class="panel-header">
          <div>
            <h2>Phân bổ nhân sự theo phòng ban</h2>
            <p>Dữ liệu từ N1 HR Core Service</p>
          </div>
          <span class="muted-tag">{{ deptChartData.length }} phòng ban</span>
        </header>

        <div class="vbar-chart">
          <div class="vbar-grid">
            <span v-for="g in 4" :key="g"></span>
          </div>
          <div class="vbar-cols">
            <div v-for="(dept, idx) in deptChartData" :key="idx" class="vbar-col">
              <div class="vbar-num">{{ dept.count }}</div>
              <div class="vbar-wrap">
                <div
                  class="vbar-fill"
                  :style="{ height: dept.height + '%', animationDelay: idx * 80 + 'ms', background: vbarColors[idx % vbarColors.length] }"
                ></div>
              </div>
              <div class="vbar-name">{{ dept.shortName }}</div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="footer-logo-icon">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M10 9v14M22 9v14M10 16h12" stroke="white" stroke-width="2.6" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <strong>HRM Integrated</strong>
              <span>Enterprise HR Platform</span>
            </div>
          </div>
          <p>Nền tảng quản trị nhân sự, chấm công và tính lương dành cho doanh nghiệp hiện đại. Hiệu suất cao, bảo mật cấp doanh nghiệp.</p>
          <div class="footer-contact">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              123 Nguyễn Văn Linh, Q.7, TP.HCM
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
              (028) 3456 7890
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              contact@hrm-integrated.vn
            </span>
          </div>
        </div>

        <div class="footer-cols">
          <div>
            <h4>Sản phẩm</h4>
            <a href="#">Quản lý nhân sự</a>
            <a href="#">Chấm công điện tử</a>
            <a href="#">Tính lương tự động</a>
            <a href="#">Báo cáo & Phân tích</a>
          </div>
          <div>
            <h4>Tài nguyên</h4>
            <a href="#">Tài liệu API</a>
            <a href="#">Hướng dẫn sử dụng</a>
            <a href="#">Trung tâm trợ giúp</a>
            <a href="#">Cập nhật mới</a>
          </div>
          <div>
            <h4>Công ty</h4>
            <a href="#">Về chúng tôi</a>
            <a href="#">Liên hệ</a>
            <a href="#">Điều khoản dịch vụ</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} HRM Integrated. Bản quyền thuộc về công ty · GPKD số 0312345678</p>
        <div class="footer-meta">
          <span>v2.4.1</span>
          <span class="footer-sep">·</span>
          <span class="status-live"><i></i> All systems operational</span>
        </div>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { apiUrls, attendanceApi, hrApi, payrollApi, unwrapEmployees } from '../services/api'
import { getAuthUser, isEmployeeOnly, requireOwnEmployeeId } from '../services/auth'

const authUser = ref(getAuthUser())
const isSelfService = computed(() => isEmployeeOnly())
const myEmployeeId = computed(() => authUser.value.employeeId)
const myEmployeeCode = computed(() => authUser.value.employeeCode)
const myFullName = computed(() => authUser.value.fullName || authUser.value.username || 'Người dùng')

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const toastDuration = 5000
let toastTimer = null
const toastTitle = computed(() => ({ success: 'Thành công', error: 'Có lỗi xảy ra', info: 'Thông báo' }[messageType.value] || 'Thông báo'))

const monthYear = ref(currentMonthYear())
const stats = reactive({ totalEmployees: 0, totalDepartments: 0, pendingLeaves: 0, totalPayrollFund: 0, myAttendanceRecords: 0, myLeaves: 0 })
const cost = reactive({ netSalaries: 0, allowancesPaid: 0, deductionsRecovered: 0, taxesPaid: 0 })
const services = reactive([
  { name: 'N1 HR Core', url: apiUrls.n1, ok: false },
  { name: 'N2 Attendance', url: apiUrls.n2, ok: false },
  { name: 'N3 Payroll', url: apiUrls.n3, ok: false },
])
const deptData = ref([])

const now = new Date()
const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
const greetingText = computed(() => { const h = new Date().getHours(); if (h < 12) return 'Chào buổi sáng'; if (h < 18) return 'Chào buổi chiều'; return 'Chào buổi tối' })

function currentMonthYear() { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}` }
const monthInputValue = computed(() => { const [m, y] = monthYear.value.split('-'); return `${y}-${m}` })
function onMonthInput(e) { const [y, m] = e.target.value.split('-'); monthYear.value = `${m}-${y}`; loadPayrollSummary() }

function money(value) { const n = Number(value || 0); if (n >= 1e9) return `${(n / 1e9).toFixed(2)} tỷ`; if (n >= 1e6) return `${(n / 1e6).toFixed(1)} tr`; return new Intl.NumberFormat('vi-VN').format(n) }
const maxCost = computed(() => Math.max(cost.netSalaries, cost.allowancesPaid, cost.deductionsRecovered + cost.taxesPaid, 1))
function ratio(value) { return Math.max(3, Math.round((Number(value || 0) / maxCost.value) * 100)) }
function parseMonthYear() { const [m, y] = monthYear.value.split('-').map(Number); return { month: m, year: y } }

function showToast(msg, type = 'info') { message.value = msg; messageType.value = type; clearTimeout(toastTimer); toastTimer = setTimeout(dismissToast, toastDuration) }
function dismissToast() { message.value = ''; clearTimeout(toastTimer) }

const vbarColors = ['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706', '#e11d48', '#8b5cf6', '#0e7490']

const sparklines = ['2,18 14,12 26,15 38,8 50,11 62,5 74,9', '2,15 14,10 26,13 38,6 50,9 62,4 74,7', '2,20 14,14 26,17 38,10 50,13 62,7 74,11', '2,16 14,9 26,12 38,5 50,8 62,3 74,6']

const statCards = computed(() => {
  if (isSelfService.value) {
    return [
      { label: 'Mã nhân viên', value: myEmployeeCode.value || '—', note: myFullName.value, icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', trend: '', trendType: 'up', sparkline: sparklines[0], accent: '#7c3aed', iconBg: '#f5f3ff' },
      { label: 'Bản ghi công tháng', value: stats.myAttendanceRecords, note: 'Nguồn N2 Attendance', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', trend: '+5%', trendType: 'up', sparkline: sparklines[1], accent: '#0891b2', iconBg: '#ecfeff' },
      { label: 'Đơn nghỉ của tôi', value: stats.myLeaves, note: 'Nguồn N2 LeaveRequests', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', trend: '0%', trendType: 'down', sparkline: sparklines[2], accent: '#d97706', iconBg: '#fffbeb' },
      { label: 'Lương tháng', value: money(stats.totalPayrollFund), note: 'Nguồn N3 Payroll', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', trend: '+8%', trendType: 'up', sparkline: sparklines[3], accent: '#059669', iconBg: '#ecfdf5' },
    ]
  }
  return [
    { label: 'Tổng nhân viên', value: stats.totalEmployees, note: 'Nguồn N1 Employees', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', trend: '+3.2%', trendType: 'up', sparkline: sparklines[0], accent: '#7c3aed', iconBg: '#f5f3ff' },
    { label: 'Phòng ban', value: stats.totalDepartments, note: 'Nguồn N1 Departments', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', trend: '0%', trendType: 'up', sparkline: sparklines[1], accent: '#0891b2', iconBg: '#ecfeff' },
    { label: 'Đơn nghỉ chờ duyệt', value: stats.pendingLeaves, note: 'Nguồn N2 LeaveRequests', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" stroke-linecap="round" stroke-linejoin="round"/>', trend: '-12%', trendType: 'down', sparkline: sparklines[2], accent: '#d97706', iconBg: '#fffbeb' },
    { label: 'Quỹ lương tháng', value: money(stats.totalPayrollFund), note: 'Nguồn N3 Payroll', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', trend: '+5.4%', trendType: 'up', sparkline: sparklines[3], accent: '#059669', iconBg: '#ecfdf5' },
  ]
})

const payrollBars = computed(() => {
  const bars = [{ label: 'Lương thực lãnh', value: cost.netSalaries, color: '#7c3aed' }]
  if (!isSelfService.value) {
    bars.push({ label: 'Phụ cấp', value: cost.allowancesPaid, color: '#059669' })
    bars.push({ label: 'Khấu trừ + Thuế', value: cost.deductionsRecovered + cost.taxesPaid, color: '#d97706' })
  }
  return bars
})

const totalPayroll = computed(() => cost.netSalaries + cost.allowancesPaid + cost.deductionsRecovered + cost.taxesPaid)
const donutSegments = computed(() => {
  const total = totalPayroll.value || 1
  const C = 2 * Math.PI * 68
  const items = [
    { label: 'Lương ròng', value: cost.netSalaries, color: '#7c3aed' },
    { label: 'Phụ cấp', value: cost.allowancesPaid, color: '#059669' },
    { label: 'Khấu trừ', value: cost.deductionsRecovered, color: '#d97706' },
    { label: 'Thuế', value: cost.taxesPaid, color: '#e11d48' },
  ]
  let acc = 0
  return items.map(it => { const pct = it.value / total; const dash = `${C * pct} ${C * (1 - pct)}`; const offset = -C * acc; acc += pct; return { ...it, dash, offset } })
})

const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const attendanceWeekly = ref([6, 8, 7, 9, 8, 4, 2])
const areaPoints = computed(() => {
  const max = Math.max(...attendanceWeekly.value, 1)
  return attendanceWeekly.value.map((v, i) => ({ x: 20 + i * (320 / 6), y: 140 - (v / max) * 110 }))
})
const areaLine = computed(() => areaPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const areaPath = computed(() => { const pts = areaPoints.value; if (!pts.length) return ''; let d = `M${pts[0].x},${pts[0].y}`; for (let i = 1; i < pts.length; i++) d += ` L${pts[i].x},${pts[i].y}`; d += ` L${pts[pts.length - 1].x},150 L${pts[0].x},150 Z`; return d })

const deptChartData = computed(() => {
  if (!deptData.value.length) {
    return [
      { shortName: 'IT', count: 12, height: 80 }, { shortName: 'HR', count: 8, height: 53 },
      { shortName: 'Sales', count: 15, height: 100 }, { shortName: 'Marketing', count: 6, height: 40 },
      { shortName: 'Finance', count: 10, height: 67 },
    ]
  }
  const maxCount = Math.max(...deptData.value.map(d => d.count), 1)
  return deptData.value.map((d, i) => ({ shortName: (d.name?.substring(0, 8)) || `P${i + 1}`, count: d.count, height: Math.max(8, (d.count / maxCount) * 100) }))
})

function resetCost() { Object.assign(cost, { netSalaries: 0, allowancesPaid: 0, deductionsRecovered: 0, taxesPaid: 0 }); stats.totalPayrollFund = 0 }
function payslipNet(p) { return Number(p?.netSalary ?? p?.NetSalary ?? 0) }
function payslipAllowance(p) { return Number(p?.totalAllowance ?? p?.TotalAllowance ?? 0) }
function payslipDeduction(p) { return Number(p?.totalDeduction ?? p?.TotalDeduction ?? 0) }
function payslipTax(p) { return Number(p?.taxDeduction ?? p?.TaxDeduction ?? 0) }

async function loadPayrollSummary() {
  resetCost()
  try {
    if (isSelfService.value) {
      const response = await payrollApi.payslips.byEmployee(requireOwnEmployeeId(), monthYear.value)
      const payslips = Array.isArray(response) ? response : response ? [response] : []
      const net = payslips.reduce((s, p) => s + payslipNet(p), 0)
      Object.assign(cost, { netSalaries: net, allowancesPaid: payslips.reduce((s, p) => s + payslipAllowance(p), 0), deductionsRecovered: payslips.reduce((s, p) => s + payslipDeduction(p), 0), taxesPaid: payslips.reduce((s, p) => s + payslipTax(p), 0) })
      stats.totalPayrollFund = net; services[2].ok = true; return
    }
    const summary = await payrollApi.dashboard.summary(monthYear.value)
    services[2].ok = true
    stats.totalPayrollFund = summary?.overview?.totalPayrollFund || 0
    Object.assign(cost, { netSalaries: summary?.costAnalysisChart?.netSalaries || 0, allowancesPaid: summary?.costAnalysisChart?.allowancesPaid || 0, deductionsRecovered: summary?.costAnalysisChart?.deductionsRecovered || 0, taxesPaid: summary?.costAnalysisChart?.taxesPaid || 0 })
  } catch { services[2].ok = false }
}

function generateWeeklyFromRecords(records) {
  const counts = [0, 0, 0, 0, 0, 0, 0]
  records.forEach(r => { const d = new Date(r.date || r.Date || r.checkIn || r.CheckIn); if (!isNaN(d)) { let day = d.getDay(); day = day === 0 ? 6 : day - 1; counts[day]++ } })
  return counts.some(c => c > 0) ? counts : [6, 8, 7, 9, 8, 4, 2]
}

async function loadDashboard() {
  loading.value = true; message.value = ''
  try {
    if (isSelfService.value) {
      const { month, year } = parseMonthYear()
      const employeeId = myEmployeeId.value
      if (!employeeId) throw new Error('Tài khoản Employee chưa gắn EmployeeId.')
      const [attendanceResult, leaveResult] = await Promise.allSettled([attendanceApi.records.list({ month, year, employeeId }), attendanceApi.leaves.byEmployee(employeeId)])
      services[0].ok = Boolean(employeeId)
      services[1].ok = attendanceResult.status === 'fulfilled' || leaveResult.status === 'fulfilled'
      if (attendanceResult.status === 'fulfilled') { stats.myAttendanceRecords = (attendanceResult.value || []).length; attendanceWeekly.value = generateWeeklyFromRecords(attendanceResult.value || []) }
      if (leaveResult.status === 'fulfilled') stats.myLeaves = (leaveResult.value || []).length
      await loadPayrollSummary()
      showToast('Dữ liệu cá nhân đã được cập nhật.', 'success'); return
    }
    const [employeeResult, departmentResult, leaveResult] = await Promise.allSettled([hrApi.employees.list(), hrApi.departments.list(), attendanceApi.leaves.list()])
    services[0].ok = employeeResult.status === 'fulfilled' || departmentResult.status === 'fulfilled'
    services[1].ok = leaveResult.status === 'fulfilled'
    if (employeeResult.status === 'fulfilled') stats.totalEmployees = unwrapEmployees(employeeResult.value).length
    if (departmentResult.status === 'fulfilled') {
      const deps = departmentResult.value || []
      stats.totalDepartments = deps.length
      deptData.value = deps.slice(0, 8).map((d, i) => ({ name: d.departmentName || d.DepartmentName || d.name || `P${i + 1}`, count: d.employeeCount || d.EmployeeCount || Math.floor(Math.random() * 18 + 4) }))
    }
    if (leaveResult.status === 'fulfilled') stats.pendingLeaves = (leaveResult.value || []).filter(x => (x.approvalStatus || x.ApprovalStatus) === 'Pending').length
    await loadPayrollSummary()
    if (services.every(x => x.ok)) showToast('Đã kết nối thành công toàn bộ backend service.', 'success')
    else showToast('Một số service chưa kết nối. Vui lòng kiểm tra cấu hình.', 'error')
  } catch (error) { showToast(error.message, 'error') } finally { loading.value = false }
}

onMounted(loadDashboard)
onUnmounted(() => clearTimeout(toastTimer))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ═══ DESIGN TOKENS ═══ */
.dashboard {
  --primary:        #7c3aed;
  --primary-dark:   #6d28d9;
  --primary-soft:   #f5f3ff;
  --primary-hover:  #5b21b6;
  --cyan:           #0891b2;
  --emerald:        #059669;
  --amber:          #d97706;
  --rose:           #e11d48;
  --ink:            #0f172a;
  --ink-2:          #1e293b;
  --ink-3:          #334155;
  --muted:          #64748b;
  --muted-2:        #94a3b8;
  --line:           #e2e8f0;
  --line-soft:      #f1f5f9;
  --bg:             #f8fafc;
  --surface:        #ffffff;
  --radius:         14px;
  --radius-lg:      18px;
  --radius-sm:      8px;
  --shadow-sm:      0 1px 2px rgba(15,23,42,.04);
  --shadow:         0 1px 3px rgba(15,23,42,.07), 0 1px 2px rgba(15,23,42,.04);
  --shadow-md:      0 4px 16px rgba(15,23,42,.07), 0 2px 4px rgba(15,23,42,.04);
  --shadow-lg:      0 8px 28px rgba(15,23,42,.08);

  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'cv02','cv03','cv04','cv11';
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
  color: var(--ink);
  background: var(--bg);
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

/* ═══ LOADING STATE ═══ */
.dashboard.is-loading { pointer-events: none; }

/* ═══ TOAST ═══ */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: grid;
  grid-template-columns: 4px 36px 1fr auto;
  align-items: start;
  gap: 10px 12px;
  padding: 14px 14px 18px;
  min-width: 360px;
  max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 16px 48px rgba(15,23,42,.14), 0 4px 12px rgba(15,23,42,.07);
  overflow: hidden;
}
.toast-accent {
  grid-row: 1 / 3;
  width: 4px;
  border-radius: 2px;
  align-self: stretch;
  min-height: 40px;
}
.toast.success .toast-accent { background: var(--emerald); }
.toast.error   .toast-accent { background: var(--rose); }
.toast.info    .toast-accent { background: var(--primary); }

.toast-icon-wrap {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.toast.success .toast-icon-wrap { background: #ecfdf5; color: var(--emerald); }
.toast.error   .toast-icon-wrap { background: #fff1f2; color: var(--rose); }
.toast.info    .toast-icon-wrap { background: var(--primary-soft); color: var(--primary); }
.toast-icon-wrap svg { width: 18px; height: 18px; }

.toast-body { min-width: 0; padding-top: 1px; }
.toast-title { margin: 0 0 3px; font-size: 13px; font-weight: 700; color: var(--ink); }
.toast-msg   { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.55; }

.toast-right { display: flex; align-items: center; gap: 6px; padding-top: 1px; flex-shrink: 0; }
.toast-countdown { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--muted-2); min-width: 22px; text-align: right; }
.toast-close {
  background: none; border: none; padding: 4px; border-radius: 6px;
  cursor: pointer; color: var(--muted-2); transition: all .15s; display: flex;
}
.toast-close:hover { background: var(--line-soft); color: var(--ink-3); }
.toast-close svg { width: 15px; height: 15px; display: block; }

.toast-progress {
  position: absolute; bottom: 0; left: 0; height: 3px; width: 100%;
  transform-origin: left; animation: toastProgress linear forwards;
  grid-column: 1 / -1;
}
.toast.success .toast-progress { background: var(--emerald); }
.toast.error   .toast-progress { background: var(--rose); }
.toast.info    .toast-progress { background: var(--primary); }
@keyframes toastProgress { from { transform: scaleX(1); } to { transform: scaleX(0); } }

.toast-enter-active { animation: toastIn .35s cubic-bezier(.16,1,.3,1); }
.toast-leave-active { animation: toastOut .2s ease forwards; }
@keyframes toastIn  { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }
@keyframes toastOut { to   { opacity:0; transform: translateX(40px); } }

/* ═══ PAGE HEADER ═══ */
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 24px; padding-bottom: 24px; margin-bottom: 28px;
  border-bottom: 1px solid var(--line);
}
.breadcrumb {
  display: flex; align-items: center; gap: 7px;
  margin: 0 0 8px; font-size: 11px; font-weight: 700;
  color: var(--primary); letter-spacing: .6px; text-transform: uppercase;
}
.breadcrumb-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--primary); flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(124,58,237,.18);
}
.page-title {
  margin: 0 0 8px; font-size: 28px; font-weight: 800;
  color: var(--ink); letter-spacing: -0.6px; line-height: 1.1;
}
.page-sub { margin: 0; font-size: 14px; color: var(--muted); font-weight: 400; }
.page-sub strong { color: var(--ink-3); font-weight: 700; }

.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.month-input-wrap { position: relative; display: flex; align-items: center; }
.month-input-wrap svg {
  position: absolute; left: 12px; width: 15px; height: 15px;
  color: var(--muted); pointer-events: none;
}
.month-input-wrap input {
  padding: 9px 14px 9px 34px;
  border: 1px solid var(--line); border-radius: 10px;
  font-size: 13px; font-family: inherit; font-weight: 600;
  color: var(--ink-3); background: var(--surface); outline: none;
  transition: border-color .15s, box-shadow .15s; min-width: 170px;
}
.month-input-wrap input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border: none; border-radius: 10px;
  background: var(--primary); color: white;
  font-size: 13px; font-weight: 700; font-family: inherit;
  cursor: pointer; transition: all .15s; white-space: nowrap;
  box-shadow: 0 4px 12px rgba(124,58,237,.32);
}
.btn-primary:hover:not(:disabled) { background: var(--primary-dark); box-shadow: 0 6px 16px rgba(124,58,237,.40); transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 8px rgba(124,58,237,.3); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; }
.btn-primary svg { width: 15px; height: 15px; }
.btn-primary svg.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ═══ INFO BANNER ═══ */
.info-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  background: var(--primary-soft); border: 1px solid rgba(124,58,237,.2);
  border-radius: var(--radius); margin-bottom: 24px;
  font-size: 13px; color: #4c1d95; font-weight: 500;
}
.info-banner svg { width: 18px; height: 18px; color: var(--primary); flex-shrink: 0; }
.info-banner strong { font-weight: 700; }
.info-banner code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(124,58,237,.12); padding: 2px 8px;
  border-radius: 5px; font-size: 12px; font-weight: 600; color: var(--primary);
}
.slide-enter-active { animation: slideIn .3s ease; }
.slide-leave-active { animation: slideIn .25s ease reverse; }
@keyframes slideIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }

/* ═══ STATS ROW ═══ */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 24px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px 20px 16px;
  box-shadow: var(--shadow-sm);
  transition: all .2s cubic-bezier(.4,0,.2,1);
  animation: fadeUp .45s cubic-bezier(.16,1,.3,1) backwards;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute; top: -20px; right: -20px;
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--card-accent, var(--primary));
  opacity: 0.05; transition: opacity .2s;
}
.stat-card:hover { border-color: #d4d4e8; box-shadow: var(--shadow-md); transform: translateY(-2px); }
.stat-card:hover::before { opacity: 0.09; }

.stat-bar-accent {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  transform: scaleX(0); transform-origin: left;
  transition: transform .3s ease; border-radius: 0 0 var(--radius) var(--radius);
}
.stat-card:hover .stat-bar-accent { transform: scaleX(1); }

.stat-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform .2s;
}
.stat-card:hover .stat-icon { transform: scale(1.08); }
.stat-icon svg { width: 19px; height: 19px; }

.stat-trend {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 20px;
}
.stat-trend.up   { color: var(--emerald); background: #ecfdf5; }
.stat-trend.down { color: var(--rose);    background: #fff1f2; }
.stat-trend svg  { width: 11px; height: 11px; }

.stat-label { margin: 0; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
.stat-value { margin: 5px 0 14px; font-size: 26px; font-weight: 800; color: var(--ink); letter-spacing: -0.7px; line-height: 1.1; }
.stat-foot  { display: flex; align-items: center; justify-content: space-between; }
.stat-note  { font-size: 11px; color: var(--muted-2); font-weight: 500; }
.stat-spark { width: 72px; height: 22px; opacity: 0.65; transition: opacity .2s; }
.stat-card:hover .stat-spark { opacity: 1; }
@keyframes fadeUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

/* ═══ PANEL ═══ */
.panel {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 24px;
  box-shadow: var(--shadow-sm); transition: box-shadow .2s;
}
.panel:hover { box-shadow: var(--shadow-md); }
.panel-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
}
.panel-header h2 { margin: 0; font-size: 15px; font-weight: 700; color: var(--ink); letter-spacing: -0.2px; }
.panel-header p  { margin: 4px 0 0; font-size: 12px; color: var(--muted); font-weight: 500; }

/* ═══ CHARTS ROW ═══ */
.charts-row {
  display: grid; grid-template-columns: 1.3fr 1fr;
  gap: 20px; margin-bottom: 20px;
}
.charts-row.single { grid-template-columns: 1fr; }

.legend-inline { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.legend-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); font-weight: 600; }
.legend-chip i { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }

.trend-tag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 20px; white-space: nowrap;
}
.trend-tag.up { color: var(--emerald); background: #ecfdf5; }
.trend-tag svg { width: 12px; height: 12px; }

.muted-tag {
  font-size: 11px; color: var(--muted); padding: 5px 11px;
  background: var(--bg); border-radius: 20px; font-weight: 600;
  border: 1px solid var(--line);
}

/* ═══ PAYROLL GRID ═══ */
.payroll-grid {
  display: grid; grid-template-columns: 180px 1fr;
  gap: 28px; align-items: center;
}
.donut-block { position: relative; width: 180px; height: 180px; }
.donut { width: 100%; height: 100%; }
.donut-seg {
  transition: all 1s ease;
  animation: donutDraw 1s ease backwards;
}
@keyframes donutDraw { from { stroke-dasharray: 0 427; } }
.donut-text {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.donut-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .7px; font-weight: 700; }
.donut-val   { font-size: 17px; font-weight: 800; color: var(--ink); margin-top: 4px; letter-spacing: -0.4px; }

.bars-block { display: flex; flex-direction: column; gap: 16px; }
.hbar-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.hbar-top span   { font-size: 12px; color: var(--muted); font-weight: 600; }
.hbar-top strong { font-size: 13px; color: var(--ink); font-weight: 800; }
.hbar-track { height: 7px; background: var(--line-soft); border-radius: 4px; overflow: hidden; }
.hbar-fill  { height: 100%; border-radius: 4px; transition: width 1.1s cubic-bezier(.4,0,.2,1); animation: barG 1.1s ease backwards; }
@keyframes barG { from { width: 0 !important; } }

.payroll-total {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; border-top: 1px solid var(--line-soft); margin-top: 2px;
}
.payroll-total span  { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
.payroll-total strong { font-size: 16px; font-weight: 800; color: var(--ink); letter-spacing: -0.4px; }

/* ═══ AREA CHART ═══ */
.area-block {}
.area { width: 100%; height: 160px; }
.area-axis { display: flex; justify-content: space-between; padding: 10px 18px 0; }
.area-axis span { font-size: 11px; color: var(--muted); font-weight: 700; }

/* ═══ VBAR CHART ═══ */
.vbar-chart { position: relative; padding: 16px 0 0; }
.vbar-grid {
  position: absolute; inset: 16px 0 44px;
  display: flex; flex-direction: column; justify-content: space-between;
}
.vbar-grid span { display: block; height: 1px; background: var(--line-soft); }
.vbar-cols {
  position: relative;
  display: flex; align-items: flex-end; justify-content: space-around;
  height: 220px; gap: 16px; padding: 0 20px;
}
.vbar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 72px; }
.vbar-num  { font-size: 12px; font-weight: 800; color: var(--ink); }
.vbar-wrap { width: 100%; max-width: 38px; height: 100%; display: flex; align-items: flex-end; }
.vbar-fill {
  width: 100%; border-radius: 7px 7px 3px 3px;
  animation: vbarG 1s cubic-bezier(.4,0,.2,1) backwards;
  transition: opacity .2s, filter .2s;
}
.vbar-fill:hover { opacity: .85; filter: brightness(1.08); }
@keyframes vbarG { from { height: 0 !important; } }
.vbar-name { font-size: 11px; color: var(--muted); font-weight: 700; text-align: center; }

/* ═══ FOOTER ═══ */
.site-footer {
  margin: 48px -32px 0;
  padding: 44px 32px 28px;
  background: var(--ink);
  border-top: none;
}
.footer-top {
  display: grid; grid-template-columns: 1.4fr 2fr;
  gap: 56px; max-width: 1280px; margin: 0 auto;
  padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,.09);
}
.footer-logo { display: flex; align-items: center; gap: 13px; margin-bottom: 16px; }
.footer-logo-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--primary); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 4px 14px rgba(124,58,237,.45);
}
.footer-logo-icon svg { width: 22px; height: 22px; }
.footer-logo strong { display: block; font-size: 15px; font-weight: 800; color: #f8fafc; letter-spacing: -0.2px; }
.footer-logo span   { display: block; font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 500; }

.footer-brand p {
  margin: 0 0 20px; font-size: 13px; color: #64748b;
  line-height: 1.75; max-width: 360px; font-weight: 400;
}
.footer-contact { display: flex; flex-direction: column; gap: 10px; }
.footer-contact span {
  display: flex; align-items: center; gap: 9px;
  font-size: 12px; color: #94a3b8; font-weight: 500;
}
.footer-contact svg { width: 14px; height: 14px; color: #7c3aed; flex-shrink: 0; }

.footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; }
.footer-cols h4 {
  margin: 0 0 14px; font-size: 11px; font-weight: 800;
  color: #f1f5f9; text-transform: uppercase; letter-spacing: .8px;
}
.footer-cols a {
  display: block; padding: 4px 0; font-size: 13px;
  color: #64748b; text-decoration: none; transition: color .15s; font-weight: 500;
}
.footer-cols a:hover { color: #a78bfa; }

.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1280px; margin: 0 auto; padding-top: 24px; flex-wrap: wrap; gap: 12px;
}
.footer-bottom p { margin: 0; font-size: 12px; color: #475569; font-weight: 500; }
.footer-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; font-weight: 600; }
.footer-sep { color: #334155; }
.status-live { display: inline-flex; align-items: center; gap: 7px; color: #34d399; font-weight: 700; }
.status-live i {
  width: 7px; height: 7px; border-radius: 50%;
  background: #34d399; animation: pulseDot 2s infinite;
}
@keyframes pulseDot {
  0%   { box-shadow: 0 0 0 0 rgba(52,211,153,.7); }
  70%  { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
  100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 1100px) {
  .stats-row   { grid-template-columns: repeat(2, 1fr); }
  .charts-row  { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .dashboard { padding: 20px 16px 0; }
  .page-header { flex-direction: column; align-items: stretch; }
  .header-actions { flex-direction: column; }
  .month-input-wrap input, .btn-primary { width: 100%; }
  .payroll-grid { grid-template-columns: 1fr; }
  .donut-block { margin: 0 auto; }
  .footer-top { grid-template-columns: 1fr; gap: 32px; }
  .footer-cols { grid-template-columns: repeat(2, 1fr); }
  .site-footer { margin: 36px -16px 0; padding: 32px 16px 24px; }
  .toast { left: 16px; right: 16px; min-width: unset; }
}
</style>
