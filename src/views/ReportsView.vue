<template>
  <section class="page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <article class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>Dashboard & báo cáo tổng hợp</h2>
          <p>Lấy dữ liệu tổng hợp từ N3, đối chiếu nhân sự từ N1.</p>
        </div>
        <div class="toolbar">
          <input v-model="monthYear" style="max-width: 135px" />
          <button class="btn primary" @click="loadReports">Tải báo cáo</button>
        </div>
      </div>
    </article>

    <div class="grid cols-4">
      <article class="card stat-card"><p class="stat-label">Tổng nhân sự</p><p class="stat-value">{{ overview.totalEmployees }}</p><p class="stat-note">EmployeeReplicas</p></article>
      <article class="card stat-card"><p class="stat-label">Đã trả lương</p><p class="stat-value">{{ overview.employeesPaidThisMonth }}</p><p class="stat-note">Payslips</p></article>
      <article class="card stat-card"><p class="stat-label">Tổng quỹ lương</p><p class="stat-value">{{ money(overview.totalPayrollFund) }}</p><p class="stat-note">Net salary</p></article>
      <article class="card stat-card"><p class="stat-label">Phòng ban có lương</p><p class="stat-value">{{ departmentSummary.length }}</p><p class="stat-note">Group by department</p></article>
    </div>

    <div class="grid cols-2">
      <article class="card">
        <div class="card-header"><div class="card-title"><h2>Phân tích chi phí</h2><p>Các khoản được N3 tổng hợp.</p></div></div>
        <div class="grid">
          <div v-for="row in costRows" :key="row.label">
            <div class="toolbar" style="justify-content: space-between;"><span>{{ row.label }}</span><strong>{{ currency(row.value) }}</strong></div>
            <div class="progress-bar"><span :style="{ width: row.ratio + '%' }"></span></div>
          </div>
        </div>
      </article>

      <article class="card">
        <div class="card-header"><div class="card-title"><h2>Quỹ lương theo phòng ban</h2><p>GET /api/MonthlyPayslips/department-summary/{{ monthYear }}</p></div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Phòng ban</th><th>Số NV</th><th>Quỹ lương</th></tr></thead>
            <tbody>
              <tr v-for="row in departmentSummary" :key="row.departmentName">
                <td><strong>{{ row.departmentName }}</strong></td>
                <td>{{ row.totalEmployees }}</td>
                <td>{{ currency(row.totalSalaryFund) }}</td>
              </tr>
              <tr v-if="!departmentSummary.length"><td colspan="3" class="empty">Chưa có dữ liệu báo cáo tháng này.</td></tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { payrollApi } from '../services/api'

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const monthYear = ref(currentMonthYear())
const overview = reactive({ totalEmployees: 0, employeesPaidThisMonth: 0, totalPayrollFund: 0 })
const cost = reactive({ netSalaries: 0, allowancesPaid: 0, deductionsRecovered: 0, taxesPaid: 0 })
const departmentSummary = ref([])

const maxCost = computed(() => Math.max(cost.netSalaries, cost.allowancesPaid, cost.deductionsRecovered + cost.taxesPaid, 1))
const costRows = computed(() => [
  { label: 'Lương thực lãnh', value: cost.netSalaries },
  { label: 'Phụ cấp / OT', value: cost.allowancesPaid },
  { label: 'Khấu trừ', value: cost.deductionsRecovered },
  { label: 'Thuế TNCN', value: cost.taxesPaid },
].map(row => ({ ...row, ratio: Math.max(5, Math.round((row.value / maxCost.value) * 100)) })))

function currentMonthYear() { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}` }
function notify(text, type = 'success') { message.value = text; messageType.value = type; setTimeout(() => (message.value = ''), 3500) }
function currency(value) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0)) }
function money(value) { const n = Number(value || 0); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}tr` : new Intl.NumberFormat('vi-VN').format(n) }

async function loadReports() {
  loading.value = true
  try {
    const [summary, departments] = await Promise.all([
      payrollApi.dashboard.summary(monthYear.value),
      payrollApi.payslips.departmentSummary(monthYear.value),
    ])
    Object.assign(overview, summary?.overview || {})
    Object.assign(cost, summary?.costAnalysisChart || {})
    departmentSummary.value = departments || []
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

onMounted(loadReports)
</script>
