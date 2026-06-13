<template>
  <section class="page leave-page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>

    <article class="card leave-card">
      <div class="leave-head">
        <div>
          <h2>{{ canReview ? 'Duyệt nghỉ phép' : 'Xin nghỉ phép' }}</h2>
          <p>{{ canReview ? 'Danh sách đơn đang chờ xử lý.' : 'Gửi yêu cầu nghỉ phép để HR/Admin duyệt.' }}</p>
        </div>

        <div v-if="canReview" class="head-actions">
          <select v-model="filters.status">
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>

          <button class="btn ghost" @click="loadLeaves">
            Tải lại
          </button>
        </div>
      </div>

      <template v-if="!canReview">
        <div class="request-form-card">
          <div class="form-grid">
            <div class="form-field">
              <label>Từ ngày</label>
              <input v-model="form.fromDate" type="date" />
            </div>

            <div class="form-field">
              <label>Đến ngày</label>
              <input v-model="form.toDate" type="date" />
            </div>

            <div class="form-field">
              <label>Loại nghỉ</label>
              <select v-model="form.leaveType">
                <option value="Paid">Có lương</option>
                <option value="Unpaid">Không lương</option>
              </select>
            </div>

            <div class="form-field full">
              <label>Lý do</label>
              <textarea v-model.trim="form.reason" rows="4" placeholder="Nhập lý do xin nghỉ"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn primary" @click="createLeave">
              Gửi yêu cầu
            </button>

            <button class="btn ghost" @click="resetForm">
              Làm mới
            </button>
          </div>
        </div>

        <div class="sub-head">
          <h3>Đơn của tôi</h3>
          <button class="btn ghost small" @click="loadLeaves">
            Tải lại
          </button>
        </div>
      </template>

      <div v-else class="review-note">
        <span>{{ filteredLeaves.length }} đơn</span>
        <strong>{{ pendingCount }} chờ duyệt</strong>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th v-if="canReview">Nhân viên</th>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredLeaves" :key="leaveId(item)">
              <td v-if="canReview" class="name-cell">
                <strong>{{ employeeName(leaveEmployeeId(item)) }}</strong>
              </td>

              <td>{{ date(leaveFrom(item)) }} → {{ date(leaveTo(item)) }}</td>

              <td>
                {{ leaveType(item) === 'Paid' ? 'Có lương' : 'Không lương' }}
              </td>

              <td class="reason-cell">
                {{ leaveReason(item) || '—' }}
              </td>

              <td>
                <span class="pill" :class="statusClass(leaveStatus(item))">
                  {{ statusText(leaveStatus(item)) }}
                </span>
              </td>

              <td>
                <div class="actions right">
                  <template v-if="canReview">
                    <button
                      v-if="leaveStatus(item) === 'Pending'"
                      class="icon-action success"
                      title="Duyệt"
                      @click="approve(item, 'Approved')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>

                    <button
                      v-if="leaveStatus(item) === 'Pending'"
                      class="icon-action warning"
                      title="Từ chối"
                      @click="approve(item, 'Rejected')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                      </svg>
                    </button>

                    <button class="icon-action danger" title="Xóa" @click="removeLeave(item)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 7h12M10 11v6M14 11v6M9 7l1-3h4l1 3M8 7l1 13h6l1-13"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </template>

                  <template v-else>
                    <button
                      v-if="canRemoveOwn(item)"
                      class="icon-action danger"
                      title="Xóa đơn chờ duyệt"
                      @click="removeLeave(item)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 7h12M10 11v6M14 11v6M9 7l1-3h4l1 3M8 7l1 13h6l1-13"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>

                    <span v-else class="pill neutral">
                      Chỉ xem
                    </span>
                  </template>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredLeaves.length">
              <td :colspan="canReview ? 6 : 5" class="empty">
                {{ canReview ? 'Chưa có đơn nghỉ phép.' : 'Bạn chưa gửi đơn nghỉ phép.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { attendanceApi, hrApi, unwrapEmployees } from '../services/api'
import { canApproveLeave, canManageAttendance, getAuthUser, isEmployeeOnly, requireOwnEmployeeId } from '../services/auth'

const authUser = ref(getAuthUser() || {})
const employees = ref([])
const leaves = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  employeeId: '',
  fromDate: today,
  toDate: today,
  leaveType: 'Paid',
  reason: '',
})

const filters = reactive({
  status: '',
})

const canReview = computed(() => {
  return (canApproveLeave() || canManageAttendance()) && !isEmployeeOnly()
})

const isSelfService = computed(() => isEmployeeOnly())

const myEmployeeId = computed(() => {
  return authUser.value.employeeId || authUser.value.EmployeeId || ''
})

const myEmployeeLabel = computed(() => {
  const code = authUser.value.employeeCode || authUser.value.EmployeeCode || 'NV'
  const name = authUser.value.fullName || authUser.value.FullName || authUser.value.username || 'Employee'
  return `${code} - ${name}`
})

const filteredLeaves = computed(() => {
  let list = [...leaves.value]

  if (filters.status) {
    list = list.filter((item) => leaveStatus(item) === filters.status)
  }

  return list.sort((a, b) => {
    const statusOrder = { Pending: 0, Approved: 1, Rejected: 2 }
    const statusA = statusOrder[leaveStatus(a)] ?? 9
    const statusB = statusOrder[leaveStatus(b)] ?? 9

    if (statusA !== statusB) return statusA - statusB

    return new Date(leaveFrom(b) || 0) - new Date(leaveFrom(a) || 0)
  })
})

const pendingCount = computed(() => {
  return leaves.value.filter((item) => leaveStatus(item) === 'Pending').length
})

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type

  setTimeout(() => {
    message.value = ''
  }, 3800)
}

function unwrapList(response) {
  if (Array.isArray(response)) return response
  return response?.data || response?.Data || response?.items || response?.Items || []
}

function resetForm() {
  Object.assign(form, {
    employeeId: myEmployeeId.value,
    fromDate: today,
    toDate: today,
    leaveType: 'Paid',
    reason: '',
  })
}

function empId(emp = {}) {
  return emp.employeeId || emp.EmployeeId || emp.id || emp.Id || ''
}

function empCode(emp = {}) {
  return emp.employeeCode || emp.EmployeeCode || emp.code || emp.Code || 'NV'
}

function empName(emp = {}) {
  return emp.fullName || emp.FullName || emp.name || emp.Name || 'Không rõ tên'
}

function empLabel(emp = {}) {
  return `${empCode(emp)} - ${empName(emp)}`
}

function employeeName(employeeId) {
  const employee = employees.value.find((item) => empId(item) === employeeId)

  if (employee) return empLabel(employee)
  if (employeeId === myEmployeeId.value) return myEmployeeLabel.value

  return 'Không rõ nhân viên'
}

function leaveId(item = {}) {
  return item.leaveId || item.LeaveId || item.id || item.Id || `${leaveEmployeeId(item)}-${leaveFrom(item)}-${leaveTo(item)}`
}

function leaveEmployeeId(item = {}) {
  return item.employeeId || item.EmployeeId || ''
}

function leaveFrom(item = {}) {
  return item.fromDate || item.FromDate || ''
}

function leaveTo(item = {}) {
  return item.toDate || item.ToDate || ''
}

function leaveType(item = {}) {
  return item.leaveType || item.LeaveType || 'Paid'
}

function leaveReason(item = {}) {
  return item.reason || item.Reason || ''
}

function leaveStatus(item = {}) {
  return item.approvalStatus || item.ApprovalStatus || item.status || item.Status || 'Pending'
}

function date(value) {
  if (!value) return '—'

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('vi-VN')
}

function statusText(status) {
  const map = {
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
  }

  return map[status] || status
}

function statusClass(status) {
  if (status === 'Approved') return 'success'
  if (status === 'Rejected') return 'danger'
  return 'warn'
}

function canRemoveOwn(item) {
  return isSelfService.value && leaveEmployeeId(item) === myEmployeeId.value && leaveStatus(item) === 'Pending'
}

function validateLeaveForm() {
  const employeeId = myEmployeeId.value
  const from = new Date(form.fromDate)
  const to = new Date(form.toDate)

  if (!employeeId) return 'Tài khoản chưa gắn mã nhân viên.'
  if (!form.fromDate || !form.toDate) return 'Vui lòng chọn thời gian nghỉ.'
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 'Ngày nghỉ không hợp lệ.'
  if (to < from) return 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.'
  if (!form.reason.trim()) return 'Vui lòng nhập lý do xin nghỉ.'

  const duplicated = leaves.value.some((item) => {
    const status = leaveStatus(item)
    const sameEmployee = leaveEmployeeId(item) === employeeId
    const itemFrom = new Date(leaveFrom(item))
    const itemTo = new Date(leaveTo(item))
    const overlap = from <= itemTo && to >= itemFrom

    return sameEmployee && ['Pending', 'Approved'].includes(status) && overlap
  })

  if (duplicated) return 'Bạn đã có đơn nghỉ trùng thời gian này.'

  return ''
}

async function loadEmployees() {
  if (!canReview.value) {
    employees.value = myEmployeeId.value
      ? [
          {
            employeeId: myEmployeeId.value,
            employeeCode: authUser.value.employeeCode || authUser.value.EmployeeCode || 'NV',
            fullName: authUser.value.fullName || authUser.value.FullName || authUser.value.username || 'Tài khoản của tôi',
          },
        ]
      : []

    return
  }

  try {
    employees.value = unwrapEmployees(await hrApi.employees.list({ pageSize: 1000 }))
  } catch {
    employees.value = []
  }
}

async function loadLeaves() {
  loading.value = true

  try {
    const response = canReview.value
      ? await attendanceApi.leaves.list()
      : await attendanceApi.leaves.byEmployee(requireOwnEmployeeId())

    leaves.value = unwrapList(response)
  } catch (error) {
    notify(error.message || 'Không tải được đơn nghỉ phép.', 'error')
  } finally {
    loading.value = false
  }
}

async function createLeave() {
  if (canReview.value) return

  const validation = validateLeaveForm()

  if (validation) {
    return notify(validation, 'error')
  }

  loading.value = true

  try {
    await attendanceApi.leaves.create({
      employeeId: myEmployeeId.value,
      fromDate: form.fromDate,
      toDate: form.toDate,
      leaveType: form.leaveType,
      reason: form.reason.trim(),
      approvalStatus: 'Pending',
    })

    notify('Đã gửi yêu cầu nghỉ phép.')
    resetForm()
    await loadLeaves()
  } catch (error) {
    notify(error.message || 'Gửi yêu cầu thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

async function approve(item, status) {
  if (!canReview.value) {
    return notify('Bạn không có quyền duyệt đơn.', 'error')
  }

  if (leaveStatus(item) !== 'Pending') {
    return notify('Chỉ xử lý đơn đang chờ duyệt.', 'error')
  }

  loading.value = true

  try {
    await attendanceApi.leaves.approve(leaveId(item), status)
    notify(status === 'Approved' ? 'Đã duyệt đơn.' : 'Đã từ chối đơn.')
    await loadLeaves()
  } catch (error) {
    notify(error.message || 'Cập nhật trạng thái thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

async function removeLeave(item) {
  const allowed = canReview.value || canRemoveOwn(item)

  if (!allowed) {
    return notify('Bạn không có quyền xóa đơn này.', 'error')
  }

  if (!confirm('Xóa đơn nghỉ phép này?')) return

  loading.value = true

  try {
    await attendanceApi.leaves.remove(leaveId(item))
    leaves.value = leaves.value.filter((leave) => leaveId(leave) !== leaveId(item))
    notify('Đã xóa đơn.')
  } catch (error) {
    notify(error.message || 'Không xóa được đơn. Vui lòng kiểm tra lại dịch vụ.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  resetForm()
  await loadEmployees()
  await loadLeaves()
})
</script>

<style scoped>
.leave-page {
  font-family: "Segoe UI", Arial, sans-serif;
}

.leave-page :where(button, input, select, textarea, table) {
  font-family: "Segoe UI", Arial, sans-serif;
}

.leave-card {
  width: 100%;
  padding: 24px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
}

.leave-head,
.sub-head,
.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.leave-head h2,
.sub-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.leave-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.head-actions select {
  width: 190px;
  height: 44px;
  border: 1px solid #dbe3ef;
  border-radius: 13px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  padding: 0 12px;
  outline: none;
}

.request-form-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #f8fafc;
  padding: 18px;
  margin-bottom: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: grid;
  gap: 7px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 13px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.form-field input,
.form-field select {
  height: 44px;
  padding: 0 13px;
}

.form-field textarea {
  resize: vertical;
  min-height: 96px;
  padding: 12px 13px;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus,
.head-actions select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.sub-head {
  padding-top: 4px;
}

.sub-head h3 {
  font-size: 22px;
}

.review-note {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.review-note span,
.review-note strong {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  background: #f8fafc;
  padding: 0 12px;
}

.review-note strong {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.table-wrap {
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.table-wrap table {
  width: 100%;
  border-collapse: collapse;
}

.table-wrap th {
  background: #f8fafc;
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.table-wrap td {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  vertical-align: middle;
}

.name-cell strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.reason-cell {
  max-width: 280px;
  color: #334155;
}

.text-right {
  text-align: right;
}

.actions.right {
  justify-content: flex-end;
}

.icon-action {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #f8fafc;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.18s ease;
}

.icon-action.success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.icon-action.warning {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.icon-action.danger {
  border-color: #fecaca;
  background: #fff7f7;
  color: #dc2626;
}

.icon-action:hover {
  transform: translateY(-1px);
}

.icon-action.success:hover {
  background: #16a34a;
  border-color: #16a34a;
  color: #ffffff;
}

.icon-action.warning:hover {
  background: #f97316;
  border-color: #f97316;
  color: #ffffff;
}

.icon-action.danger:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
}

.pill.warn {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.pill.danger {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

@media (max-width: 900px) {
  .leave-head,
  .sub-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions select {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
