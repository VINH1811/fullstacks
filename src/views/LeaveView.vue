<template>
  <section class="page leave-premium" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <div class="grid cols-4 compact-stats">
      <article class="card stat-card"><p class="stat-label">Tổng đơn</p><p class="stat-value">{{ leaves.length }}</p></article>
      <article class="card stat-card"><p class="stat-label">Pending</p><p class="stat-value">{{ countBy('Pending') }}</p></article>
      <article class="card stat-card"><p class="stat-label">Approved</p><p class="stat-value">{{ countBy('Approved') }}</p></article>
      <article class="card stat-card"><p class="stat-label">Rejected</p><p class="stat-value">{{ countBy('Rejected') }}</p></article>
    </div>

    <div class="grid cols-2">
      <article class="card premium-card">
        <div class="card-header">
          <div class="card-title">
            <h2>Nộp đơn nghỉ phép</h2>
            <p>{{ isSelfService ? 'Đơn cá nhân.' : 'Tạo đơn cho nhân viên.' }}</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-field full">
            <label>Nhân viên</label>
            <select v-if="canManage" v-model="form.employeeId">
              <option value="">Chọn nhân viên</option>
              <option v-for="emp in employees" :key="empId(emp)" :value="empId(emp)">
                {{ empLabel(emp) }}
              </option>
            </select>
            <div v-else class="locked-field">{{ myEmployeeLabel }}</div>
          </div>
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
            <textarea v-model="form.reason" placeholder="Lý do xin nghỉ"></textarea>
          </div>
        </div>

        <div class="toolbar" style="margin-top:14px">
          <button class="btn primary" @click="createLeave">Gửi đơn</button>
          <button class="btn ghost" @click="resetForm">Làm mới</button>
        </div>
      </article>

      <article class="card premium-card">
        <div class="card-header">
          <div class="card-title">
            <h2>Trạng thái duyệt</h2>
            <p>HR/Admin duyệt hoặc xóa đơn.</p>
          </div>
        </div>
        <div class="approval-summary">
          <div><strong>Pending</strong><span>Chờ duyệt</span></div>
          <div><strong>Approved</strong><span>Đã duyệt</span></div>
          <div><strong>Rejected</strong><span>Từ chối</span></div>
        </div>
      </article>
    </div>

    <article class="card premium-card">
      <div class="card-header">
        <div class="card-title">
          <h2>{{ isSelfService ? 'Đơn nghỉ của tôi' : 'Danh sách đơn nghỉ phép' }}</h2>
          <p>Hiển thị theo mã nhân viên và họ tên.</p>
        </div>
        <button class="btn ghost" @click="loadLeaves">Tải lại</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Thời gian</th>
              <th>Loại</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in leaves" :key="leaveId(item)">
              <td class="name-cell">
                <strong>{{ employeeName(leaveEmployeeId(item)) }}</strong>
                <span>{{ shortId(leaveEmployeeId(item)) }}</span>
              </td>
              <td>{{ date(leaveFrom(item)) }} → {{ date(leaveTo(item)) }}</td>
              <td>{{ leaveType(item) === 'Paid' ? 'Có lương' : 'Không lương' }}</td>
              <td>{{ leaveReason(item) || '—' }}</td>
              <td><span class="pill" :class="statusClass(leaveStatus(item))">{{ leaveStatus(item) }}</span></td>
              <td>
                <div class="actions">
                  <template v-if="canApprove">
                    <button class="btn small success" @click="approve(item, 'Approved')">Duyệt</button>
                    <button class="btn small warning" @click="approve(item, 'Rejected')">Từ chối</button>
                  </template>
                  <button v-if="canRemove(item)" class="btn small danger" @click="removeLeave(item)">Xóa</button>
                  <span v-if="!canApprove && !canRemove(item)" class="pill neutral">Chỉ xem</span>
                </div>
              </td>
            </tr>
            <tr v-if="!leaves.length">
              <td colspan="6" class="empty">Chưa có đơn nghỉ phép.</td>
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

const authUser = ref(getAuthUser())
const canManage = computed(() => canManageAttendance())
const canApprove = computed(() => canApproveLeave())
const isSelfService = computed(() => isEmployeeOnly())
const myEmployeeId = computed(() => authUser.value.employeeId)
const myEmployeeLabel = computed(() => `${authUser.value.employeeCode || 'NV'} - ${authUser.value.fullName || authUser.value.username || 'Employee'}`)
const employees = ref([])
const leaves = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('')
const today = new Date().toISOString().slice(0, 10)
const form = reactive({ employeeId: '', fromDate: today, toDate: today, leaveType: 'Paid', reason: '' })

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => (message.value = ''), 4200)
}
function resetForm() {
  Object.assign(form, { employeeId: isSelfService.value ? myEmployeeId.value : '', fromDate: today, toDate: today, leaveType: 'Paid', reason: '' })
}
function shortId(value = '') {
  const text = String(value || '')
  return text.length > 14 ? `${text.slice(0, 8)}...` : text || '—'
}
function date(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : '—' }
function countBy(status) { return leaves.value.filter((x) => leaveStatus(x) === status).length }
function empId(emp) { return emp?.employeeId || emp?.EmployeeId || emp?.id || emp?.Id || '' }
function empCode(emp) { return emp?.employeeCode || emp?.EmployeeCode || emp?.code || emp?.Code || '—' }
function empName(emp) { return emp?.fullName || emp?.FullName || emp?.name || emp?.Name || 'Không rõ tên' }
function empLabel(emp) { return `${empCode(emp)} - ${empName(emp)}` }
function employeeName(id) {
  const e = employees.value.find((x) => empId(x) === id)
  if (e) return empLabel(e)
  if (id === myEmployeeId.value) return myEmployeeLabel.value
  return shortId(id)
}
function leaveId(item) { return item.leaveId || item.LeaveId || item.id || item.Id }
function leaveEmployeeId(item) { return item.employeeId || item.EmployeeId || '' }
function leaveFrom(item) { return item.fromDate || item.FromDate }
function leaveTo(item) { return item.toDate || item.ToDate }
function leaveType(item) { return item.leaveType || item.LeaveType || 'Paid' }
function leaveReason(item) { return item.reason || item.Reason || '' }
function leaveStatus(item) { return item.approvalStatus || item.ApprovalStatus || 'Pending' }
function statusClass(status) { return status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'warn' }
function canRemove(item) { return canManage.value || (isSelfService.value && leaveEmployeeId(item) === myEmployeeId.value && leaveStatus(item) === 'Pending') }

async function loadEmployees() {
  if (isSelfService.value) {
    const id = myEmployeeId.value
    employees.value = id ? [{ employeeId: id, employeeCode: authUser.value.employeeCode || 'NV', fullName: authUser.value.fullName || authUser.value.username || 'Tài khoản của tôi' }] : []
    return
  }
  employees.value = unwrapEmployees(await hrApi.employees.list({ pageSize: 1000 }))
}
async function loadLeaves() {
  loading.value = true
  try {
    leaves.value = isSelfService.value ? await attendanceApi.leaves.byEmployee(requireOwnEmployeeId()) : await attendanceApi.leaves.list()
  } catch (error) {
    notify(error.message || 'Không tải được đơn nghỉ phép.', 'error')
  } finally {
    loading.value = false
  }
}
async function createLeave() {
  const employeeId = isSelfService.value ? myEmployeeId.value : form.employeeId
  if (!employeeId) return notify('Chọn nhân viên trước.', 'error')
  loading.value = true
  try {
    await attendanceApi.leaves.create({ ...form, employeeId })
    notify('Đã gửi đơn nghỉ phép.')
    resetForm()
    await loadLeaves()
  } catch (error) {
    notify(error.message || 'Gửi đơn thất bại.', 'error')
  } finally {
    loading.value = false
  }
}
async function approve(item, status) {
  if (!canApprove.value) return notify('Bạn không có quyền duyệt đơn nghỉ phép.', 'error')
  loading.value = true
  try {
    await attendanceApi.leaves.approve(leaveId(item), status)
    notify('Đã cập nhật trạng thái.')
    await loadLeaves()
  } catch (error) {
    notify(error.message || 'Duyệt đơn thất bại.', 'error')
  } finally {
    loading.value = false
  }
}
async function removeLeave(item) {
  if (!canRemove(item)) return notify('Bạn không có quyền xóa đơn này.', 'error')
  if (!confirm('Xóa đơn nghỉ phép này?')) return
  loading.value = true
  try {
    await attendanceApi.leaves.remove(leaveId(item))
    leaves.value = leaves.value.filter((x) => leaveId(x) !== leaveId(item))
    notify('Đã xóa đơn.')
  } catch (error) {
    notify('Azure N2 hiện chưa có DELETE /LeaveRequests. Source N2 trong bản zip đã thêm chức năng này, cần deploy để xóa thật trong database.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isSelfService.value) form.employeeId = myEmployeeId.value
  await loadEmployees().catch((error) => notify(error.message, 'error'))
  await loadLeaves()
})
</script>
