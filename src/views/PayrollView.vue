<template>
  <section class="payroll-page" :class="{ loading }">
    <!-- Toast -->
    <Transition name="toast">
      <div v-if="message" class="alert floating-alert" :class="messageType">
        <span class="alert-dot"></span>
        {{ message }}
      </div>
    </Transition>

    <div v-if="isSelfService && !myEmployeeId" class="alert error page-alert">
      Tài khoản Employee chưa được gắn EmployeeId, nên không thể xem phiếu lương cá nhân.
    </div>

    <!-- HEADER -->
    <header class="payroll-hero">
      <div class="hero-left">
        <p class="eyebrow">Payroll Service</p>
        <h1>{{ canManage ? 'Bảng lương tháng' : 'Phiếu lương của tôi' }}</h1>
        <p class="hero-desc">
          {{ canManage
            ? 'Quản lý đồng bộ nhân sự, chốt công, tính lương và phát hành phiếu lương.'
            : 'Theo dõi phiếu lương cá nhân theo tháng được gắn với tài khoản.'
          }}
        </p>
      </div>

      <div class="hero-actions">
        <div class="month-field">
          <span>Tháng</span>
          <input v-model="monthYear" placeholder="06-2026" />
        </div>

        <button class="btn soft" @click="loadAll">
          Tải dữ liệu
        </button>

        <button v-if="canManage" class="btn primary" @click="showMonthActions = true">
          Tác vụ tháng
        </button>
      </div>
    </header>



    <!-- COMPACT WORKFLOW -->
    <article v-if="canManage" class="workflow-card">
      <div class="workflow-info">
        <h2>Quy trình lương</h2>
        <p>Nhân sự N1 → Công tháng N2 → Phiếu lương N3</p>
      </div>

      <div class="workflow-steps">
        <div class="workflow-step">
          <strong>N1</strong>
          <span>Employees</span>
        </div>
        <div class="workflow-line"></div>
        <div class="workflow-step">
          <strong>N2</strong>
          <span>Monthly Close</span>
        </div>
        <div class="workflow-line"></div>
        <div class="workflow-step">
          <strong>N3</strong>
          <span>Payslips</span>
        </div>
      </div>

      <button class="btn soft" @click="showSalaryConfig = true">
        Cấu hình lương
      </button>
    </article>

    <article v-else class="self-card">
      <strong>Quyền Employee</strong>
      <span>
        Chỉ xem lương của mã nhân viên
        <b>{{ myEmployeeId || 'chưa gắn' }}</b>.
      </span>
    </article>

    <!-- TABLE CARD -->
    <article class="table-card">
      <div class="table-head">
        <div>
          <h2>{{ canManage ? `Bảng lương tháng ${monthYear}` : `Phiếu lương của tôi - ${monthYear}` }}</h2>
          <p>
            {{ canManage
              ? `GET /api/MonthlyPayslips/month/${monthYear}`
              : `GET /api/MonthlyPayslips/employee/{employeeId}/${monthYear}`
            }}
          </p>
        </div>

        <div class="table-tools">
          <input
            v-model="searchText"
            class="search-input"
            placeholder="Tìm nhân viên, mã NV, phòng ban..."
          />

          <select v-model="statusFilter" class="status-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div v-if="canManage" class="approval-strip">
        <div>
          <strong>{{ approvedCount }}/{{ payslips.length }}</strong>
          <span>phiếu đã duyệt</span>
        </div>
        <div>
          <strong>{{ pendingCount }}</strong>
          <span>phiếu cần xử lý</span>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Công</th>
              <th>Nghỉ phép</th>
              <th>Tăng ca</th>
              <th>Thực lãnh</th>
              <th>Trạng thái</th>
              <th class="right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in filteredPayslips" :key="val(p, 'id') || `${val(p, 'employeeId')}-${val(p, 'monthYear')}`">
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar">
                    {{ (val(p, 'employeeCode') || 'NV').slice(-1) }}
                  </div>
                  <div>
                    <strong>{{ val(p, 'employeeCode') || 'NV' }} - {{ val(p, 'fullName') || employeeName(val(p, 'employeeId')) }}</strong>
                    <span>{{ val(p, 'departmentName') || 'Chưa có phòng ban' }}</span>
                  </div>
                </div>
              </td>

              <td>
                <strong>{{ val(p, 'actualDays') }}/{{ val(p, 'standardDays') }}</strong>
                <span class="cell-note">ngày công</span>
              </td>

              <td>
                <strong>{{ val(p, 'paidLeaveDays') || 0 }} / {{ val(p, 'unpaidLeaveDays') || 0 }}</strong>
                <span class="cell-note">có lương / không lương</span>
              </td>

              <td>
                <strong>{{ num(val(p, 'overtimeHours')) }}h</strong>
                <span class="cell-note">{{ currency(val(p, 'overtimeAmount')) }}</span>
              </td>

              <td>
                <strong class="salary-text">{{ currency(val(p, 'netSalary')) }}</strong>
              </td>

              <td>
                <span class="pill" :class="statusClass(val(p, 'status'))">
                  {{ val(p, 'status') || 'Chờ duyệt' }}
                </span>
              </td>

              <td class="right">
                <div class="row-actions">
                  <button class="btn mini soft" @click="openDetail(p)">Chi tiết</button>
                  <button class="btn mini ghost" @click="downloadEmployeePdf(p)">PDF</button>

                  <template v-if="canManage && val(p, 'status') !== 'Đã duyệt'">
                    <button class="btn mini success" @click="approveOne(p)">Duyệt</button>
                  </template>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredPayslips.length">
              <td colspan="7" class="empty">
                {{ payslips.length
                  ? 'Không tìm thấy phiếu lương phù hợp bộ lọc.'
                  : canManage
                    ? 'Chưa có phiếu lương tháng này. Hãy mở “Tác vụ tháng” để sync và tính lương.'
                    : 'Chưa có phiếu lương cá nhân tháng này.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- MODAL: MONTH ACTIONS -->
    <div v-if="showMonthActions" class="modal-backdrop" @click.self="showMonthActions = false">
      <div class="modal action-modal">
        <div class="modal-head">
          <div>
            <h2>Tác vụ tháng {{ monthYear }}</h2>
            <p>Chỉ mở khi cần xử lý đồng bộ, duyệt, xuất file hoặc gửi email lương.</p>
          </div>

          <button class="icon-close" @click="showMonthActions = false">✕</button>
        </div>

        <div class="action-grid">
          <button class="action-tile" @click="syncEmployees">
            <strong>1. Sync N1 → N3</strong>
            <span>Đồng bộ nhân sự từ HR Core sang Payroll.</span>
          </button>

          <button class="action-tile primary-tile" @click="calculatePayroll">
            <strong>2. Chốt công & tính lương</strong>
            <span>Lấy công tháng từ Attendance Service và sinh phiếu lương.</span>
          </button>

          <button class="action-tile success-tile" :disabled="!pendingCount" @click="approveMonth">
            <strong>Duyệt cả tháng</strong>
            <span>{{ pendingCount }} phiếu đang chờ xử lý.</span>
          </button>

          <button class="action-tile warning-tile" :disabled="!approvedCount" @click="unapproveMonth">
            <strong>Hủy duyệt cả tháng</strong>
            <span>Mở khóa bảng lương để sửa hoặc tính lại.</span>
          </button>

          <button class="action-tile" :disabled="!payslips.length" @click="exportExcel">
            <strong>Tải Excel</strong>
            <span>Xuất bảng lương tổng hợp.</span>
          </button>

          <button class="action-tile" :disabled="!payslips.length" @click="exportPdfSummary">
            <strong>Tải PDF tổng hợp</strong>
            <span>Xuất báo cáo lương tháng.</span>
          </button>

          <button class="action-tile primary-tile wide" :disabled="!approvedCount" @click="sendEmails">
            <strong>Gửi email lương</strong>
            <span>Chỉ gửi các phiếu lương đã được duyệt.</span>
          </button>
        </div>

        <div class="modal-foot">
          <button class="btn soft" @click="showMonthActions = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- MODAL: SALARY CONFIG -->
    <div v-if="showSalaryConfig" class="modal-backdrop" @click.self="showSalaryConfig = false">
      <div class="modal large-modal">
        <div class="modal-head">
          <div>
            <h2>Cấu hình lương cơ bản</h2>
            <p>Lương cơ bản tự đồng bộ từ hợp đồng N1; chỉ mở phần này khi cần chỉnh.</p>
          </div>

          <button class="icon-close" @click="showSalaryConfig = false">✕</button>
        </div>

        <div class="table-wrap modal-table">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Lương cơ bản</th>
                <th class="right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="emp in employees" :key="empId(emp)">
                <td>
                  <div class="name-cell">
                    <strong>{{ empCode(emp) }} - {{ empName(emp) }}</strong>
                    <span>{{ empId(emp) }}</span>
                  </div>
                </td>

                <td>{{ emp.departmentName || emp.DepartmentName || 'Chưa phân bổ' }}</td>

                <td>
                  <input
                    v-model.number="salaryDraft[empId(emp)]"
                    class="salary-input"
                    type="number"
                    min="0"
                    step="100000"
                  />
                </td>

                <td class="right">
                  <button class="btn mini primary" @click="saveSalary(emp)">
                    Lưu cấu hình
                  </button>
                </td>
              </tr>

              <tr v-if="!employees.length">
                <td colspan="4" class="empty">
                  Chưa có nhân sự. Hãy mở “Tác vụ tháng” và bấm Sync N1 → N3.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-foot">
          <button class="btn soft" @click="showSalaryConfig = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- MODAL: PAYSLIP DETAIL -->
    <div v-if="selectedPayslip" class="modal-backdrop" @click.self="selectedPayslip = null">
      <div class="modal detail-modal">
        <div class="modal-head">
          <div>
            <h2>Chi tiết phiếu lương</h2>
            <p>
              {{ val(selectedPayslip, 'employeeCode') || 'NV' }}
              -
              {{ val(selectedPayslip, 'fullName') || employeeName(val(selectedPayslip, 'employeeId')) }}
              · {{ monthYear }}
            </p>
          </div>

          <button class="icon-close" @click="selectedPayslip = null">✕</button>
        </div>

        <div class="detail-summary">
          <div>
            <span>Thực lãnh</span>
            <strong>{{ currency(val(selectedPayslip, 'netSalary')) }}</strong>
          </div>

          <span class="pill" :class="statusClass(val(selectedPayslip, 'status'))">
            {{ val(selectedPayslip, 'status') || 'Chờ duyệt' }}
          </span>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <span>Ngày công</span>
            <strong>{{ val(selectedPayslip, 'actualDays') }}/{{ val(selectedPayslip, 'standardDays') }}</strong>
          </div>

          <div class="detail-item">
            <span>Nghỉ có lương</span>
            <strong>{{ val(selectedPayslip, 'paidLeaveDays') || 0 }}</strong>
          </div>

          <div class="detail-item">
            <span>Nghỉ không lương</span>
            <strong>{{ val(selectedPayslip, 'unpaidLeaveDays') || 0 }}</strong>
          </div>

          <div class="detail-item">
            <span>Tăng ca</span>
            <strong>{{ num(val(selectedPayslip, 'overtimeHours')) }}h</strong>
          </div>

          <div class="detail-item">
            <span>Tiền tăng ca</span>
            <strong>{{ currency(val(selectedPayslip, 'overtimeAmount')) }}</strong>
          </div>

          <div class="detail-item">
            <span>Phụ cấp</span>
            <strong>{{ currency(val(selectedPayslip, 'totalAllowance')) }}</strong>
          </div>

          <div class="detail-item">
            <span>Khấu trừ</span>
            <strong>{{ currency(val(selectedPayslip, 'totalDeduction')) }}</strong>
          </div>

          <div class="detail-item">
            <span>Thuế</span>
            <strong>{{ currency(val(selectedPayslip, 'taxDeduction')) }}</strong>
          </div>
        </div>

        <div class="modal-foot split">
          <button class="btn soft" @click="downloadEmployeePdf(selectedPayslip)">
            Tải PDF
          </button>

          <div v-if="canManage && val(selectedPayslip, 'status') !== 'Đã duyệt'" class="detail-actions">
            <button class="btn success" @click="approveOne(selectedPayslip)">Duyệt</button>
            <button class="btn warning" @click="openEdit(selectedPayslip)">Sửa</button>
            <button class="btn danger" @click="rejectOne(selectedPayslip)">Từ chối</button>
            <button class="btn danger ghost-danger" @click="removePayslip(selectedPayslip)">Xóa</button>
          </div>

          <span v-else-if="canManage" class="muted-note">Phiếu đã chốt, không thể sửa trực tiếp.</span>
        </div>
      </div>
    </div>

    <!-- MODAL: EDIT PAYSLIP -->
    <div v-if="editing" class="modal-backdrop" @click.self="editing = null">
      <div class="modal small-modal">
        <div class="modal-head">
          <div>
            <h2>Sửa phiếu lương</h2>
            <p>
              {{ val(editing, 'employeeCode') }}
              -
              {{ val(editing, 'fullName') }}
              · Tháng {{ monthYear }}
            </p>
          </div>

          <button class="icon-close" @click="editing = null">✕</button>
        </div>

        <div class="form-grid">
          <label>
            Ngày công thực tế
            <input v-model.number="editForm.actualDays" type="number" min="0" />
          </label>

          <label>
            Nghỉ phép có lương
            <input v-model.number="editForm.paidLeaveDays" type="number" min="0" />
          </label>

          <label>
            Nghỉ không lương
            <input v-model.number="editForm.unpaidLeaveDays" type="number" min="0" />
          </label>
        </div>

        <p class="muted-note">
          Lưu xong hệ thống sẽ tự tính lại lương và đưa phiếu về trạng thái “Chờ duyệt”.
        </p>

        <div class="modal-foot">
          <button class="btn soft" @click="editing = null">Hủy</button>
          <button class="btn primary" @click="saveEdit">Lưu & tính lại</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { hrApi, payrollApi, unwrapEmployees } from '../services/api'
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
const editForm = reactive({
  actualDays: 0,
  paidLeaveDays: 0,
  unpaidLeaveDays: 0,
})

const showSalaryConfig = ref(false)
const showMonthActions = ref(false)
const selectedPayslip = ref(null)

const searchText = ref('')
const statusFilter = ref('all')

const totalFund = computed(() =>
  payslips.value.reduce((s, p) => s + Number(val(p, 'netSalary') || 0), 0)
)

const approvedCount = computed(() =>
  payslips.value.filter((p) => val(p, 'status') === 'Đã duyệt').length
)

const pendingCount = computed(() =>
  payslips.value.filter((p) => val(p, 'status') !== 'Đã duyệt').length
)

const filteredPayslips = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()

  return payslips.value.filter((p) => {
    const status = val(p, 'status') || 'Chờ duyệt'

    if (statusFilter.value === 'approved' && status !== 'Đã duyệt') return false
    if (statusFilter.value === 'rejected' && status !== 'Từ chối') return false
    if (statusFilter.value === 'pending' && status === 'Đã duyệt') return false

    if (!keyword) return true

    const text = [
      val(p, 'employeeCode'),
      val(p, 'fullName'),
      val(p, 'employeeId'),
      val(p, 'departmentName'),
      status,
    ]
      .join(' ')
      .toLowerCase()

    return text.includes(keyword)
  })
})

function currentMonthYear() {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 4500)
}

function currency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function money(value) {
  const n = Number(value || 0)
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}tr`
    : new Intl.NumberFormat('vi-VN').format(n)
}

function num(value) {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function monthParts() {
  const [m, y] = monthYear.value.split('-').map(Number)
  return { month: m, year: y }
}

function empId(emp) {
  return emp?.employeeId || emp?.EmployeeId || emp?.id || emp?.Id || ''
}

function empCode(emp) {
  return emp?.employeeCode || emp?.EmployeeCode || emp?.code || emp?.Code || empId(emp)
}

function empName(emp) {
  return emp?.fullName || emp?.FullName || emp?.name || emp?.Name || 'Không rõ tên'
}

function employeeName(id) {
  const e = employees.value.find((x) => empId(x) === id)
  return e ? `${empCode(e)} - ${empName(e)}` : id || 'Không rõ'
}

function unwrapOneOrMany(response) {
  if (!response) return []
  if (Array.isArray(response)) return response
  return [response]
}

function val(obj, key) {
  if (!obj) return undefined
  const pascal = key.charAt(0).toUpperCase() + key.slice(1)
  return obj[key] ?? obj[pascal]
}

function statusClass(status) {
  if (status === 'Đã duyệt') return 'pill-success'
  if (status === 'Từ chối') return 'pill-danger'
  return 'pill-warning'
}

function openDetail(p) {
  selectedPayslip.value = p
}

async function loadAll() {
  loading.value = true

  try {
    if (isSelfService.value) {
      const employeeId = requireOwnEmployeeId()

      employees.value = [
        {
          employeeId,
          employeeCode: employeeId,
          fullName: authUser.value.username || 'Tài khoản của tôi',
        },
      ]

      try {
        employees.value = [await hrApi.employees.get(employeeId)]
      } catch {
        // N1 có thể chặn Employee
      }

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

    if (employeeRes.status === 'fulfilled') {
      employees.value = unwrapEmployees(employeeRes.value)
    }

    if (statusRes.status === 'fulfilled') {
      replicas.value = statusRes.value?.employees || statusRes.value?.Employees || []
    }

    if (configRes.status === 'fulfilled') {
      salaryConfigs.value = configRes.value || []
    }

    if (payslipRes.status === 'fulfilled') {
      payslips.value = payslipRes.value || []
    }

    employees.value.forEach((emp) => {
      const id = empId(emp)
      const config = salaryConfigs.value.find((c) => (c.employeeId || c.EmployeeId) === id)
      salaryDraft[id] = config?.basicSalary || config?.BasicSalary || salaryDraft[id] || 12000000
    })
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function syncEmployees() {
  if (!canManage.value) return

  loading.value = true

  try {
    const res = await payrollApi.sync.hrCore()
    notify(res?.message || 'Đã đồng bộ nhân sự và lương cơ bản từ N1 sang N3.')
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function saveSalary(emp) {
  if (!canManage.value) return

  const id = empId(emp)
  loading.value = true

  try {
    await payrollApi.salaryConfigs.save({
      employeeId: id,
      basicSalary: Number(salaryDraft[id] || 0),
    })

    notify(`Đã lưu lương cơ bản cho ${empName(emp)}.`)
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function calculatePayroll() {
  if (!canManage.value) return

  loading.value = true

  try {
    const { month, year } = monthParts()

    const res = await payrollApi.payslips.calculateFromAttendance(
      month,
      year,
      monthYear.value
    )

    notify(res?.message || 'Đã chốt công từ N2 và tính lương qua N3.')
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function approveOne(p) {
  if (!canManage.value) return

  loading.value = true

  try {
    await payrollApi.payslips.approve(val(p, 'id'))
    notify('Đã duyệt phiếu lương.')
    selectedPayslip.value = null
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function rejectOne(p) {
  if (!canManage.value) return

  const reason = prompt('Lý do từ chối phiếu lương này?', '')
  if (reason === null) return

  loading.value = true

  try {
    await payrollApi.payslips.reject(val(p, 'id'), reason)
    notify('Đã từ chối phiếu lương.')
    selectedPayslip.value = null
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function approveMonth() {
  if (!canManage.value) return

  if (!confirm(`Duyệt toàn bộ ${pendingCount.value} phiếu lương đang chờ của tháng ${monthYear.value}?`)) {
    return
  }

  loading.value = true

  try {
    const res = await payrollApi.payslips.approveMonth(monthYear.value)
    notify(res?.message || 'Đã duyệt cả tháng.')
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function unapproveMonth() {
  if (!canManage.value) return

  if (!confirm('Hủy duyệt cả tháng để mở khóa sửa hoặc tính lại?')) {
    return
  }

  loading.value = true

  try {
    const res = await payrollApi.payslips.unapproveMonth(monthYear.value)
    notify(res?.message || 'Đã hủy duyệt cả tháng.')
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

function openEdit(p) {
  selectedPayslip.value = null
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
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function removePayslip(p) {
  if (!canManage.value) return

  if (!confirm('Xóa phiếu lương này?')) return

  loading.value = true

  try {
    await payrollApi.payslips.remove(val(p, 'id'))
    notify('Đã xóa phiếu lương.')
    selectedPayslip.value = null
    await loadAll()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function sendEmails() {
  if (!canManage.value) return

  if (!confirm('Gửi email phiếu lương, chỉ các phiếu đã duyệt, cho nhân viên?')) {
    return
  }

  loading.value = true

  try {
    const res = await payrollApi.payslips.sendEmails(monthYear.value)
    notify(res?.message || 'Đã gửi email.')
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function exportExcel() {
  loading.value = true

  try {
    await payrollApi.reports.excel(monthYear.value)
    notify('Đã tải file Excel.')
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function exportPdfSummary() {
  loading.value = true

  try {
    await payrollApi.reports.pdfSummary(monthYear.value)
    notify('Đã tải PDF tổng hợp.')
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function downloadEmployeePdf(p) {
  loading.value = true

  try {
    await payrollApi.reports.pdfEmployee(val(p, 'employeeId'), monthYear.value)
    notify('Đã tải PDF phiếu lương.')
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.payroll-page {
  --bg: #f6f9ff;
  --card: #ffffff;
  --line: #e4ebf6;
  --text: #0f172a;
  --muted: #64748b;
  --muted-2: #94a3b8;
  --primary: #2563eb;
  --primary-2: #7c3aed;
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #ef4444;

  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at 12% 0%, rgba(124, 58, 237, .07), transparent 26%),
    linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
  color: var(--text);
  position: relative;
}

.payroll-page.loading {
  cursor: progress;
}

.payroll-page.loading::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--primary-2), var(--success));
  z-index: 999;
  animation: loadingBar 1.1s ease-in-out infinite;
}

@keyframes loadingBar {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ALERT */
.alert {
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  box-shadow: 0 14px 32px rgba(15, 23, 42, .08);
}

.floating-alert {
  position: fixed;
  top: 92px;
  right: 28px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  max-width: 420px;
}

.alert-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--success);
  flex-shrink: 0;
}

.alert.error .alert-dot,
.alert.error {
  color: #991b1b;
  background: #fff1f2;
  border-color: #fecdd3;
}

.alert.success {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.page-alert {
  margin-bottom: 16px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all .2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* HEADER */
.payroll-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 18px;
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, .92);
  border: 1px solid var(--line);
  box-shadow: 0 16px 40px rgba(15, 23, 42, .06);
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .9px;
  text-transform: uppercase;
  color: var(--primary-2);
}

.hero-left h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -.8px;
  font-weight: 900;
}

.hero-desc {
  margin: 8px 0 0;
  max-width: 620px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.month-field {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid var(--line);
}

.month-field span {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
}

.month-field input {
  width: 94px;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
}

/* BUTTON */
.btn {
  border: 0;
  outline: none;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 13px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  transition: all .16s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: .48;
  cursor: not-allowed;
}

.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 12px 22px rgba(37, 99, 235, .22);
}

.btn.success {
  color: #fff;
  background: #16a34a;
}

.btn.warning {
  color: #fff;
  background: #f59e0b;
}

.btn.danger {
  color: #fff;
  background: #ef4444;
}

.btn.soft {
  color: #1e293b;
  background: #f8fbff;
  border: 1px solid var(--line);
}

.btn.ghost {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.btn.ghost-danger {
  color: #dc2626;
  background: #fff1f2;
  border: 1px solid #fecdd3;
}

.btn.mini {
  min-height: 34px;
  padding: 0 11px;
  border-radius: 10px;
  font-size: 12px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 14px 34px rgba(15, 23, 42, .055);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 21px;
  height: 21px;
  stroke-width: 2.2;
}

.stat-icon.purple {
  color: #7c3aed;
  background: #f3e8ff;
}

.stat-icon.blue {
  color: #2563eb;
  background: #dbeafe;
}

.stat-icon.amber {
  color: #d97706;
  background: #fef3c7;
}

.stat-icon.green {
  color: #059669;
  background: #dcfce7;
}

.stat-label {
  margin: 0;
  font-size: 12px;
  font-weight: 850;
  color: var(--muted);
}

.stat-card h3 {
  margin: 4px 0;
  font-size: 26px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -.7px;
}

.stat-card span {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted-2);
}

/* WORKFLOW */
.workflow-card,
.self-card,
.table-card {
  border-radius: 22px;
  background: rgba(255, 255, 255, .95);
  border: 1px solid var(--line);
  box-shadow: 0 16px 40px rgba(15, 23, 42, .055);
}

.workflow-card {
  display: grid;
  grid-template-columns: 240px 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

.workflow-info h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.workflow-info p {
  margin: 5px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.workflow-step {
  min-width: 130px;
  padding: 13px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid var(--line);
  text-align: center;
}

.workflow-step strong {
  display: block;
  font-size: 16px;
  font-weight: 950;
  color: var(--primary);
}

.workflow-step span {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 800;
}

.workflow-line {
  height: 2px;
  width: 54px;
  background: linear-gradient(90deg, #cbd5e1, #93c5fd);
}

.self-card {
  margin-bottom: 18px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
}

.self-card strong {
  color: var(--text);
}

/* TABLE */
.table-card {
  padding: 18px;
}

.table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.table-head h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -.45px;
}

.table-head p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.table-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.search-input,
.status-select,
.salary-input,
.form-grid input {
  height: 42px;
  border-radius: 13px;
  border: 1px solid var(--line);
  background: #f8fbff;
  color: var(--text);
  outline: none;
  padding: 0 13px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
}

.search-input {
  width: 260px;
}

.status-select {
  width: 170px;
}

.approval-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.approval-strip div {
  min-width: 150px;
  padding: 10px 13px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid var(--line);
}

.approval-strip strong {
  margin-right: 5px;
  color: var(--primary);
}

.approval-strip span {
  font-size: 12px;
  color: var(--muted);
  font-weight: 750;
}

.table-wrap {
  width: 100%;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid var(--line);
}

.table-wrap table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  background: #fff;
}

.table-wrap th {
  padding: 14px 16px;
  background: #f8fbff;
  color: #334155;
  font-size: 11px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .45px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.table-wrap td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
  font-size: 13px;
  color: #172033;
}

.table-wrap tbody tr:hover {
  background: #fbfdff;
}

.table-wrap tbody tr:last-child td {
  border-bottom: 0;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 250px;
}

.employee-avatar {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.employee-cell strong,
.name-cell strong {
  display: block;
  color: var(--text);
  font-size: 13px;
  font-weight: 900;
}

.employee-cell span,
.name-cell span,
.cell-note {
  display: block;
  margin-top: 3px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
}

.salary-text {
  color: #0f172a;
  font-size: 14px;
}

.right {
  text-align: right !important;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  flex-wrap: wrap;
}

.empty {
  text-align: center;
  padding: 34px 20px !important;
  color: var(--muted) !important;
  font-weight: 800;
}

/* PILL */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.pill-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.pill-warning {
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde68a;
}

.pill-danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  padding: 28px;
  background: rgba(15, 23, 42, .36);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 56px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, .7);
  box-shadow: 0 30px 80px rgba(15, 23, 42, .26);
}

.large-modal {
  width: min(1050px, 100%);
}

.small-modal {
  width: min(520px, 100%);
}

.detail-modal {
  width: min(700px, 100%);
}

.action-modal {
  width: min(780px, 100%);
}

.modal-head {
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.modal-head h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -.4px;
}

.modal-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.5;
}

.icon-close {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #f8fbff;
  color: var(--muted);
  cursor: pointer;
  font-weight: 900;
}

.icon-close:hover {
  color: #dc2626;
  background: #fff1f2;
  border-color: #fecdd3;
}

.modal-foot {
  padding: 16px 22px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-foot.split {
  justify-content: space-between;
  align-items: center;
}

.modal-table {
  margin: 18px 22px;
  max-height: 58vh;
}

.modal-table table {
  min-width: 760px;
}

/* ACTION MODAL */
.action-grid {
  padding: 20px 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow: auto;
}

.action-tile {
  min-height: 92px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: #f8fbff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: all .16s ease;
}

.action-tile:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, .08);
}

.action-tile:disabled {
  opacity: .48;
  cursor: not-allowed;
}

.action-tile strong {
  display: block;
  font-size: 14px;
  color: var(--text);
  font-weight: 950;
}

.action-tile span {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
  font-weight: 650;
}

.primary-tile {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.success-tile {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.warning-tile {
  background: #fffbeb;
  border-color: #fde68a;
}

.action-tile.wide {
  grid-column: 1 / -1;
}

/* DETAIL */
.detail-summary {
  margin: 20px 22px 12px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.detail-summary span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
}

.detail-summary strong {
  display: block;
  margin-top: 4px;
  font-size: 26px;
  font-weight: 950;
  color: var(--text);
}

.detail-grid {
  padding: 0 22px 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  overflow: auto;
}

.detail-item {
  padding: 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid var(--line);
}

.detail-item span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.detail-item strong {
  display: block;
  margin-top: 5px;
  color: var(--text);
  font-size: 15px;
  font-weight: 950;
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* FORM */
.form-grid {
  padding: 20px 22px;
  display: grid;
  gap: 14px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 850;
}

.form-grid input {
  width: 100%;
}

.muted-note {
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
  line-height: 1.45;
}

.small-modal .muted-note {
  padding: 0 22px 18px;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workflow-card {
    grid-template-columns: 1fr;
  }

  .workflow-steps {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 768px) {
  .payroll-page {
    padding: 16px;
  }

  .payroll-hero,
  .table-head {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions,
  .table-tools {
    justify-content: stretch;
  }

  .month-field,
  .btn,
  .search-input,
  .status-select {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .workflow-line {
    width: 32px;
  }

  .workflow-step {
    min-width: 118px;
  }

  .action-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-backdrop {
    padding: 14px;
  }

  .modal-foot.split {
    align-items: stretch;
  }

  .detail-actions,
  .modal-foot,
  .row-actions {
    justify-content: stretch;
  }

  .detail-actions .btn,
  .modal-foot .btn,
  .row-actions .btn {
    flex: 1;
  }
}
</style>
