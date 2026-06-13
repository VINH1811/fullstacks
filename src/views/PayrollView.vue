<template>
  <section class="page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>
    <div v-if="isSelfService && !myEmployeeId" class="alert error">
      Tài khoản Employee chưa được gắn EmployeeId, nên không thể xem phiếu lương cá nhân.
    </div>

    <!-- Thẻ thống kê -->
    <div class="grid cols-4">
      <article class="card stat-card"><p class="stat-label">{{ canManage ? 'Nhân sự N1' : 'Nhân viên' }}</p><p class="stat-value">{{ canManage ? employees.length : (myEmployeeId ? 1 : 0) }}</p><p class="stat-note">{{ canManage ? 'Nguồn HR Core' : 'Dữ liệu cá nhân' }}</p></article>
      <article class="card stat-card"><p class="stat-label">Đã sync N3</p><p class="stat-value">{{ replicas.length }}</p><p class="stat-note">EmployeeReplicas</p></article>
      <article class="card stat-card"><p class="stat-label">Phiếu lương</p><p class="stat-value">{{ payslips.length }}</p><p class="stat-note">Tháng {{ monthYear }}</p></article>
      <article class="card stat-card"><p class="stat-label">{{ canManage ? 'Quỹ lương' : 'Thực lãnh' }}</p><p class="stat-value">{{ money(totalFund) }}</p><p class="stat-note">Net salary</p></article>
    </div>

    <!-- Luồng tích hợp + thanh công cụ -->
    <article class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>{{ canManage ? 'Luồng tích hợp N1 → N2 → N3' : 'Phiếu lương cá nhân' }}</h2>
          <p>{{ canManage ? 'Đồng bộ nhân sự, lấy công tháng từ Attendance Service, sau đó tính bảng lương.' : 'Employee chỉ được xem phiếu lương của EmployeeId gắn với tài khoản.' }}</p>
        </div>
        <div class="toolbar">
          <input v-model="monthYear" style="max-width: 135px" placeholder="06-2026" />
          <button class="btn ghost" @click="loadAll">Tải dữ liệu</button>
          <template v-if="canManage">
            <button class="btn primary" @click="syncEmployees">1. Sync N1 → N3</button>
            <button class="btn success" @click="calculatePayroll">2. Chốt công & tính lương</button>
          </template>
        </div>
      </div>

      <div v-if="canManage" class="service-flow">
        <div class="flow-step">Employees<br><small>N1</small></div><div class="flow-arrow">→</div>
        <div class="flow-step">Monthly Close<br><small>N2</small></div><div class="flow-arrow">→</div>
        <div class="flow-step">Payslips<br><small>N3</small></div>
      </div>
      <div v-else class="alert">
        Quyền Employee: chỉ xem lương của mã nhân viên <strong>{{ myEmployeeId || 'chưa gắn' }}</strong>; không được tính lương, duyệt, sửa hoặc xem lương người khác.
      </div>

      <!-- Hành động cấp tháng: duyệt cả tháng / hủy duyệt / gửi mail / xuất file -->
      <div v-if="canManage" class="toolbar" style="margin-top: 14px; flex-wrap: wrap; gap: 8px">
        <span class="pill">{{ approvedCount }}/{{ payslips.length }} đã duyệt</span>
        <button class="btn success" :disabled="!pendingCount" @click="approveMonth">Duyệt cả tháng ({{ pendingCount }})</button>
        <button class="btn warning" :disabled="!approvedCount" @click="unapproveMonth">Hủy duyệt cả tháng</button>
        <button class="btn ghost" :disabled="!payslips.length" @click="exportExcel">Tải Excel</button>
        <button class="btn ghost" :disabled="!payslips.length" @click="exportPdfSummary">Tải PDF tổng hợp</button>
        <button class="btn primary" :disabled="!approvedCount" @click="sendEmails">Gửi email lương (đã duyệt)</button>
      </div>
    </article>

    <!-- Cấu hình lương cơ bản -->
    <article v-if="canManage" class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>Cấu hình lương cơ bản</h2>
          <p>Lương cơ bản tự đồng bộ từ hợp đồng N1; có thể chỉnh tay tại đây.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nhân viên</th><th>Phòng ban</th><th>Lương cơ bản</th><th>Thao tác</th></tr></thead>
          <tbody>
            <tr v-for="emp in employees" :key="empId(emp)">
              <td class="name-cell"><strong>{{ empCode(emp) }} - {{ empName(emp) }}</strong><span>{{ empId(emp) }}</span></td>
              <td>{{ emp.departmentName || emp.DepartmentName || 'Chưa phân bổ' }}</td>
              <td><input v-model.number="salaryDraft[empId(emp)]" type="number" min="0" step="100000" /></td>
              <td><button class="btn small primary" @click="saveSalary(emp)">Lưu cấu hình</button></td>
            </tr>
            <tr v-if="!employees.length"><td colspan="4" class="empty">Chưa có nhân sự. Hãy bấm “Sync N1 → N3”.</td></tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- Bảng lương -->
    <article class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>{{ canManage ? `Bảng lương tháng ${monthYear}` : `Phiếu lương của tôi - ${monthYear}` }}</h2>
          <p>{{ canManage ? `GET /api/MonthlyPayslips/month/${monthYear}` : `GET /api/MonthlyPayslips/employee/{employeeId}/${monthYear}` }}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th><th>Phòng ban</th><th>Công</th><th>Nghỉ phép</th>
              <th>Tăng ca</th><th>Phụ cấp</th><th>Khấu trừ</th><th>Thuế</th><th>Thực lãnh</th>
              <th>Trạng thái</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payslips" :key="p.id || `${p.employeeId}-${p.monthYear}`">
              <td class="name-cell"><strong>{{ val(p,'employeeCode') || 'NV' }} - {{ val(p,'fullName') || employeeName(val(p,'employeeId')) }}</strong><span>{{ val(p,'employeeId') }}</span></td>
              <td>{{ val(p,'departmentName') || '—' }}</td>
              <td>{{ val(p,'actualDays') }}/{{ val(p,'standardDays') }}</td>
              <td>{{ val(p,'paidLeaveDays') }} có lương / {{ val(p,'unpaidLeaveDays') }} không lương</td>
              <td>{{ num(val(p,'overtimeHours')) }}h · {{ currency(val(p,'overtimeAmount')) }}</td>
              <td>{{ currency(val(p,'totalAllowance')) }}</td>
              <td>{{ currency(val(p,'totalDeduction')) }}</td>
              <td>{{ currency(val(p,'taxDeduction')) }}</td>
              <td><strong>{{ currency(val(p,'netSalary')) }}</strong></td>
              <td><span class="pill" :class="statusClass(val(p,'status'))">{{ val(p,'status') || 'Chờ duyệt' }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="btn small ghost" @click="downloadEmployeePdf(p)">PDF</button>
                  <template v-if="canManage">
                    <template v-if="val(p,'status') !== 'Đã duyệt'">
                      <button class="btn small success" @click="approveOne(p)">Duyệt</button>
                      <button class="btn small warning" @click="openEdit(p)">Sửa</button>
                      <button class="btn small danger" @click="rejectOne(p)">Từ chối</button>
                      <button class="btn small danger" @click="removePayslip(p)">Xóa</button>
                    </template>
                    <span v-else class="muted-note">Đã chốt</span>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!payslips.length"><td colspan="11" class="empty">{{ canManage ? 'Chưa có phiếu lương tháng này. Hãy sync nhân sự và bấm “Chốt công & tính lương”.' : 'Chưa có phiếu lương cá nhân tháng này.' }}</td></tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- Modal sửa phiếu lương -->
    <div v-if="editing" class="modal-backdrop" @click.self="editing = null">
      <div class="modal small-modal">
        <div class="modal-head">
          <div>
            <h2>Sửa phiếu lương</h2>
            <p class="modal-subtitle">{{ val(editing,'employeeCode') }} - {{ val(editing,'fullName') }} · Tháng {{ monthYear }}</p>
          </div>
          <button class="btn ghost small" @click="editing = null">✕</button>
        </div>
        <div class="form-grid">
          <label>Ngày công thực tế<input v-model.number="editForm.actualDays" type="number" min="0" /></label>
          <label>Nghỉ phép có lương<input v-model.number="editForm.paidLeaveDays" type="number" min="0" /></label>
          <label>Nghỉ không lương<input v-model.number="editForm.unpaidLeaveDays" type="number" min="0" /></label>
        </div>
        <p class="muted-note">Lưu xong hệ thống sẽ tự tính lại lương và đưa phiếu về trạng thái “Chờ duyệt”.</p>
        <div class="modal-foot">
          <button class="btn ghost" @click="editing = null">Hủy</button>
          <button class="btn primary" @click="saveEdit">Lưu & tính lại</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { attendanceApi, hrApi, payrollApi, toPayrollReplica, unwrapEmployees } from '../services/api'
import { canManagePayroll, getAuthUser, isEmployeeOnly, requireOwnEmployeeId } from '../services/auth'

const authUser = ref(getAuthUser())
const canManage = computed(() => canManagePayroll())
const isSelfService = computed(() => isEmployeeOnly())
const myEmployeeId = computed(() => authUser.value.employeeId)
const employees = ref([])
const replicas = ref([])
const salaryConfigs = ref([])
const payslips = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const monthYear = ref(currentMonthYear())
const salaryDraft = reactive({})
const editing = ref(null)
const editForm = reactive({ actualDays: 0, paidLeaveDays: 0, unpaidLeaveDays: 0 })

const totalFund = computed(() => payslips.value.reduce((s, p) => s + Number(val(p, 'netSalary') || 0), 0))
const approvedCount = computed(() => payslips.value.filter(p => val(p, 'status') === 'Đã duyệt').length)
const pendingCount = computed(() => payslips.value.filter(p => val(p, 'status') !== 'Đã duyệt').length)

// Helpers
function currentMonthYear() { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}` }
function notify(text, type = 'success') { message.value = text; messageType.value = type; setTimeout(() => (message.value = ''), 4500) }
function currency(value) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0)) }
function money(value) { const n = Number(value || 0); return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}tr` : new Intl.NumberFormat('vi-VN').format(n) }
function num(value) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value || 0)) }
function monthParts() { const [m, y] = monthYear.value.split('-').map(Number); return { month: m, year: y } }
function empId(emp) { return emp?.employeeId || emp?.EmployeeId || emp?.id || emp?.Id || '' }
function empCode(emp) { return emp?.employeeCode || emp?.EmployeeCode || emp?.code || emp?.Code || empId(emp) }
function empName(emp) { return emp?.fullName || emp?.FullName || emp?.name || emp?.Name || 'Không rõ tên' }
function employeeName(id) { const e = employees.value.find(x => empId(x) === id); return e ? `${empCode(e)} - ${empName(e)}` : (id || 'Không rõ') }
function unwrapOneOrMany(response) { if (!response) return []; if (Array.isArray(response)) return response; return [response] }
// Đọc field bất kể camelCase hay PascalCase từ backend
function val(obj, key) { if (!obj) return undefined; const pascal = key.charAt(0).toUpperCase() + key.slice(1); return obj[key] ?? obj[pascal] }
function statusClass(status) { if (status === 'Đã duyệt') return 'pill-success'; if (status === 'Từ chối') return 'pill-danger'; return 'pill-warning' }

async function loadAll() {
  loading.value = true
  try {
    if (isSelfService.value) {
      const employeeId = requireOwnEmployeeId()
      employees.value = [{ employeeId, employeeCode: employeeId, fullName: authUser.value.username || 'Tài khoản của tôi' }]
      try { employees.value = [await hrApi.employees.get(employeeId)] } catch { /* N1 có thể chặn Employee */ }
      const response = await payrollApi.payslips.byEmployee(employeeId, monthYear.value)
      payslips.value = unwrapOneOrMany(response)
      replicas.value = []
      salaryConfigs.value = []
      return
    }

    const [employeeRes, statusRes, configRes, payslipRes] = await Promise.allSettled([
      hrApi.employees.list(),
      payrollApi.sync.localStatus(),
      payrollApi.salaryConfigs.list(),
      payrollApi.payslips.list(monthYear.value),
    ])
    if (employeeRes.status === 'fulfilled') employees.value = unwrapEmployees(employeeRes.value)
    if (statusRes.status === 'fulfilled') replicas.value = statusRes.value?.employees || statusRes.value?.Employees || []
    if (configRes.status === 'fulfilled') salaryConfigs.value = configRes.value || []
    if (payslipRes.status === 'fulfilled') payslips.value = payslipRes.value || []

    employees.value.forEach(emp => {
      const id = empId(emp)
      const config = salaryConfigs.value.find(c => (c.employeeId || c.EmployeeId) === id)
      salaryDraft[id] = config?.basicSalary || config?.BasicSalary || salaryDraft[id] || 12000000
    })
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function syncEmployees() {
  if (!canManage.value) return
  loading.value = true
  try {
    const res = await payrollApi.sync.hrCore()
    notify(res?.message || 'Đã đồng bộ nhân sự + lương cơ bản từ N1 sang N3.')
    await loadAll()
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function saveSalary(emp) {
  if (!canManage.value) return
  const id = empId(emp)
  loading.value = true
  try {
    await payrollApi.salaryConfigs.save({ employeeId: id, basicSalary: Number(salaryDraft[id] || 0) })
    notify(`Đã lưu lương cơ bản cho ${empName(emp)}.`)
    await loadAll()
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function calculatePayroll() {
  if (!canManage.value) return
  loading.value = true
  try {
    const { month, year } = monthParts()
    // N3 tự kéo công từ N2 và tính — không cần FE ghép tay
    const res = await payrollApi.payslips.calculateFromAttendance(month, year, monthYear.value)
    notify(res?.message || 'Đã chốt công từ N2 và tính lương qua N3.')
    await loadAll()
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function approveOne(p) {
  if (!canManage.value) return
  loading.value = true
  try { await payrollApi.payslips.approve(val(p, 'id')); notify('Đã duyệt phiếu lương.'); await loadAll() }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function rejectOne(p) {
  if (!canManage.value) return
  const reason = prompt('Lý do từ chối phiếu lương này?', '')
  if (reason === null) return
  loading.value = true
  try { await payrollApi.payslips.reject(val(p, 'id'), reason); notify('Đã từ chối phiếu lương.'); await loadAll() }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function approveMonth() {
  if (!canManage.value) return
  if (!confirm(`Duyệt toàn bộ ${pendingCount.value} phiếu lương đang chờ của tháng ${monthYear.value}?`)) return
  loading.value = true
  try { const res = await payrollApi.payslips.approveMonth(monthYear.value); notify(res?.message || 'Đã duyệt cả tháng.'); await loadAll() }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function unapproveMonth() {
  if (!canManage.value) return
  if (!confirm('Hủy duyệt cả tháng để mở khóa sửa/tính lại?')) return
  loading.value = true
  try { const res = await payrollApi.payslips.unapproveMonth(monthYear.value); notify(res?.message || 'Đã hủy duyệt cả tháng.'); await loadAll() }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

function openEdit(p) {
  editing.value = p
  editForm.actualDays = Number(val(p, 'actualDays') || 0)
  editForm.paidLeaveDays = Number(val(p, 'paidLeaveDays') || 0)
  editForm.unpaidLeaveDays = Number(val(p, 'unpaidLeaveDays') || 0)
}

async function saveEdit() {
  if (!editing.value) return
  loading.value = true
  try {
    await payrollApi.payslips.update(val(editing.value, 'id'), { ...editForm })
    notify('Đã cập nhật và tính lại phiếu lương.')
    editing.value = null
    await loadAll()
  } catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function removePayslip(p) {
  if (!canManage.value) return
  if (!confirm('Xóa phiếu lương này?')) return
  loading.value = true
  try { await payrollApi.payslips.remove(val(p, 'id')); notify('Đã xóa phiếu lương.'); await loadAll() }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function sendEmails() {
  if (!canManage.value) return
  if (!confirm('Gửi email phiếu lương (chỉ các phiếu đã duyệt) cho nhân viên?')) return
  loading.value = true
  try { const res = await payrollApi.payslips.sendEmails(monthYear.value); notify(res?.message || 'Đã gửi email.') }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function exportExcel() {
  loading.value = true
  try { await payrollApi.reports.excel(monthYear.value); notify('Đã tải file Excel.') }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function exportPdfSummary() {
  loading.value = true
  try { await payrollApi.reports.pdfSummary(monthYear.value); notify('Đã tải PDF tổng hợp.') }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

async function downloadEmployeePdf(p) {
  loading.value = true
  try { await payrollApi.reports.pdfEmployee(val(p, 'employeeId'), monthYear.value); notify('Đã tải PDF phiếu lương.') }
  catch (error) { notify(error.message, 'error') } finally { loading.value = false }
}

onMounted(loadAll)
</script>

<style scoped>
.row-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.muted-note { color: var(--muted); font-size: 12px; }
.form-grid { display: grid; gap: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--muted); }
.form-grid input { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 10px; }
.pill-success { background: #dcfce7; color: #166534; }
.pill-warning { background: #fef9c3; color: #854d0e; }
.pill-danger { background: #fee2e2; color: #991b1b; }
</style>
