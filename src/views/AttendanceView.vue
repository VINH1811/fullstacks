<template>
  <section class="page attendance-page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>

    <article class="card attendance-card">
      <div class="attendance-head">
        <div>
          <h2>Chấm công</h2>
          <p>Lịch chuẩn: Thứ 2 - Thứ 7 đi làm, Chủ nhật nghỉ.</p>
        </div>

        <div class="head-actions">
          <button v-if="isSelfService" class="btn soft" @click="openFaceModal">
            Face ID
          </button>

          <select v-if="canManage" v-model="calendarEmployeeId">
            <option value="">Tất cả nhân viên</option>
            <option v-for="emp in employeeOptions" :key="empId(emp)" :value="empId(emp)">
              {{ empLabel(emp) }}
            </option>
          </select>

          <span v-else class="pill neutral">
            {{ myEmployeeLabel }}
          </span>

          <input v-model.number="filter.month" type="number" min="1" max="12" @change="loadAll" />
          <input v-model.number="filter.year" type="number" min="2020" @change="loadAll" />

          <button class="btn primary" @click="loadAll">
            Tải
          </button>
        </div>
      </div>

      <div class="work-layout">
        <div class="calendar-area">
          <div class="weekday-row">
            <span>Thứ 2</span>
            <span>Thứ 3</span>
            <span>Thứ 4</span>
            <span>Thứ 5</span>
            <span>Thứ 6</span>
            <span>Thứ 7</span>
            <span>CN</span>
          </div>

          <div class="work-calendar">
            <div v-for="slot in calendarDays" :key="slot.key" class="calendar-slot">
              <button
                v-if="!slot.empty"
                type="button"
                class="day-card"
                :class="[slot.className, { active: selectedDay?.key === slot.key }]"
                @click="openDay(slot)"
              >
                <div class="day-top">
                  <strong>{{ slot.day }}</strong>
                  <span>{{ slot.shortWeekday }}</span>
                </div>

                <p>{{ slot.label }}</p>

                <small v-if="slot.note">
                  {{ slot.note }}
                </small>

                <div v-if="slot.badges.length" class="day-badges">
                  <span v-for="badge in slot.badges" :key="badge" class="mini-badge">
                    {{ badge }}
                  </span>
                </div>
              </button>

              <div v-else class="calendar-empty"></div>
            </div>
          </div>
        </div>

        <aside class="day-panel">
          <template v-if="selectedDay">
            <div class="panel-head">
              <div>
                <span>Ngày chọn</span>
                <h3>{{ date(selectedDay.key) }}</h3>
              </div>

              <button class="close-btn" title="Đóng" @click="selectedDay = null">
                ×
              </button>
            </div>

            <div class="shift-box" :class="selectedDay.isSunday ? 'is-off' : 'is-work'">
              <span>Ca chuẩn</span>
              <strong>{{ selectedDay.isSunday ? 'Nghỉ' : '08:00 - 17:00' }}</strong>
            </div>

            <template v-if="canManage">
              <div class="panel-section">
                <div class="section-title">
                  Nhân sự đi làm
                  <span>{{ assignedEmployeesForSelectedDay.length }}</span>
                </div>

                <div class="employee-list">
                  <div v-for="emp in assignedEmployeesForSelectedDay" :key="empId(emp)" class="employee-chip">
                    {{ empLabel(emp) }}
                  </div>
                </div>
              </div>

              <div v-if="approvedRequestsForSelectedDay.length" class="panel-section">
                <div class="section-title">
                  Đã duyệt
                  <span>{{ approvedRequestsForSelectedDay.length }}</span>
                </div>

                <div class="request-list compact">
                  <div v-for="request in approvedRequestsForSelectedDay" :key="request.id" class="request-row">
                    <div>
                      <strong>{{ request.type === 'overtime' ? 'Tăng ca' : 'Nghỉ phép' }}</strong>
                      <small>{{ request.employeeLabel }}</small>
                    </div>
                    <span>{{ request.type === 'overtime' ? `${request.hours}h` : 'Đã duyệt' }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="panel-section">
                <div class="section-title">Yêu cầu của tôi</div>

                <div class="request-tabs">
                  <button
                    class="tab-btn"
                    :class="{ active: requestForm.type === 'overtime' }"
                    @click="requestForm.type = 'overtime'"
                  >
                    Tăng ca
                  </button>

                  <button
                    class="tab-btn"
                    :class="{ active: requestForm.type === 'leave' }"
                    @click="requestForm.type = 'leave'"
                  >
                    Nghỉ phép
                  </button>
                </div>

                <div v-if="requestForm.type === 'overtime'" class="request-form">
                  <label>Số giờ</label>
                  <input v-model.number="requestForm.hours" type="number" min="1" max="6" />

                  <label>Lý do</label>
                  <textarea v-model.trim="requestForm.reason" rows="3" placeholder="Nhập lý do tăng ca"></textarea>

                  <button class="btn primary full" :disabled="selectedDay.isSunday" @click="submitRequest">
                    Gửi tăng ca
                  </button>
                </div>

                <div v-else class="request-form">
                  <label>Loại nghỉ</label>
                  <select v-model="requestForm.leaveType">
                    <option value="FullDay">Nghỉ cả ngày</option>
                    <option value="HalfDay">Nghỉ nửa ngày</option>
                  </select>

                  <label>Lý do</label>
                  <textarea v-model.trim="requestForm.reason" rows="3" placeholder="Nhập lý do nghỉ phép"></textarea>

                  <button class="btn primary full" :disabled="selectedDay.isSunday" @click="submitRequest">
                    Gửi nghỉ phép
                  </button>
                </div>

                <div v-if="myRequestsForSelectedDay.length" class="request-list self">
                  <div v-for="request in myRequestsForSelectedDay" :key="request.id" class="request-row">
                    <div>
                      <strong>{{ request.type === 'overtime' ? 'Tăng ca' : 'Nghỉ phép' }}</strong>
                      <small>{{ request.reason || 'Không có ghi chú' }}</small>
                    </div>
                    <span :class="request.status.toLowerCase()">{{ requestStatusText(request.status) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </template>

          <div v-else class="empty-panel">
            <strong>Chọn một ngày</strong>
            <span>Xem ca làm, gửi yêu cầu hoặc duyệt yêu cầu.</span>
          </div>
        </aside>
      </div>
    </article>

    <article v-if="canManage && pendingRequests.length" class="card attendance-card approval-card">
      <div class="section-head">
        <h2>Yêu cầu chờ duyệt</h2>
        <span>{{ pendingRequests.length }}</span>
      </div>

      <div class="approval-grid">
        <div v-for="request in pendingRequests" :key="request.id" class="approval-item">
          <div>
            <strong>{{ request.employeeLabel }}</strong>
            <p>{{ request.type === 'overtime' ? `Tăng ca ${request.hours}h` : 'Nghỉ phép' }} · {{ date(request.date) }}</p>
            <small>{{ request.reason || 'Không có ghi chú' }}</small>
          </div>

          <div class="approval-actions">
            <button class="btn success small" @click="approveRequest(request)">
              Duyệt
            </button>
            <button class="btn danger small" @click="rejectRequest(request)">
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </article>

    <article class="card attendance-card history-card">
      <div class="history-head">
        <h2>Lịch sử chấm công</h2>

        <button class="btn primary" @click="exportExcel">
          Xuất Excel
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Ngày</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Giờ làm</th>
              <th>OT</th>
              <th>Trạng thái</th>
              <th v-if="canManage" class="text-right">Xóa</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredRecords" :key="recordId(item)">
              <td class="name-cell">
                <strong>{{ employeeLabel(recordEmployeeId(item)) }}</strong>
              </td>

              <td>{{ date(recordDate(item)) }}</td>
              <td>{{ time(recordCheckIn(item)) }}</td>
              <td>{{ time(recordCheckOut(item)) }}</td>
              <td>{{ workHours(item) }}h</td>
              <td>{{ recordOvertime(item) }}h</td>

              <td>
                <span class="pill" :class="statusClass(attendanceStatus(item))">
                  {{ attendanceStatus(item) }}
                </span>
              </td>

              <td v-if="canManage">
                <div class="actions right">
                  <button class="icon-action danger" title="Xóa" @click="removeRecord(item)">
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
                </div>
              </td>
            </tr>

            <tr v-if="!filteredRecords.length">
              <td :colspan="canManage ? 8 : 7" class="empty">
                Chưa có dữ liệu.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    

    <div v-if="showFaceModal" class="modal-backdrop">
      <div class="modal face-modal">
        <div class="modal-head">
          <div>
            <h2>Chấm công khuôn mặt</h2>
            <p class="modal-subtitle">{{ myEmployeeLabel }}</p>
          </div>

          <button class="btn ghost" @click="closeFaceModal">
            Đóng
          </button>
        </div>

        <div class="face-layout">
          <div class="face-box">
            <video
              v-if="camera.active && !facePreview"
              ref="videoRef"
              autoplay
              muted
              playsinline
            ></video>

            <img
              v-else-if="facePreview"
              :src="facePreview"
              alt="Ảnh xác thực khuôn mặt"
            />

            <div v-else class="face-placeholder">
              <strong>Camera</strong>
              <span>Chưa bật</span>
            </div>

            <canvas ref="canvasRef" width="420" height="280" hidden></canvas>
          </div>

          <div class="face-actions">
            <button class="btn ghost" @click="startCamera">
              Bật camera
            </button>

            <button class="btn soft" :disabled="!camera.active" @click="captureFace">
              Chụp mặt
            </button>

            <button class="btn success" :disabled="!canSubmitFace" @click="faceCheckIn">
              Check-in
            </button>

            <button class="btn primary" :disabled="!canSubmitFace" @click="faceCheckOut">
              Check-out
            </button>

            <button class="btn ghost" @click="resetFace">
              Làm lại
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { attendanceApi, hrApi, unwrapEmployees } from '../services/api'
import { canManageAttendance, getAuthUser, isEmployeeOnly, requireOwnEmployeeId } from '../services/auth'

const REQUEST_KEY = 'hrm_attendance_requests_v14'
const RECORD_KEY = 'hrm_attendance_records_v12'

const fallbackEmployees = [
  { employeeId: 'sample-nv01', employeeCode: 'NV01', fullName: 'Nguyễn Phương Nam' },
  { employeeId: 'sample-nv02', employeeCode: 'NV02', fullName: 'Phạm Văn Huy' },
  { employeeId: 'sample-nv05', employeeCode: 'NV05', fullName: 'Đỗ Trung Kiên' },
  { employeeId: 'sample-nv06', employeeCode: 'NV06', fullName: 'Lương Bạch' },
  { employeeId: 'sample-nv07', employeeCode: 'NV07', fullName: 'Mạnh Tiến' },
  { employeeId: 'sample-nv09', employeeCode: 'NV09', fullName: 'Bạch Ngọc Lương' },
  { employeeId: 'sample-nv10', employeeCode: 'NV10', fullName: 'Phạm Khắc Hoàng' },
]

const employees = ref([])
const records = ref(loadLocalRecords())
const requests = ref(loadRequests())
const backendLeaves = ref([])
const monthlyPayload = ref([])
const selectedDay = ref(null)
const message = ref('')
const messageType = ref('')
const loading = ref(false)
const showFaceModal = ref(false)

const now = new Date()

const filter = reactive({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
})

const requestForm = reactive({
  type: 'overtime',
  hours: 2,
  leaveType: 'FullDay',
  reason: '',
})

const calendarEmployeeId = ref('')

const videoRef = ref(null)
const canvasRef = ref(null)
const facePreview = ref('')

const camera = reactive({
  active: false,
  stream: null,
})

const authUser = computed(() => getAuthUser() || {})
const canManage = computed(() => canManageAttendance())
const isSelfService = computed(() => isEmployeeOnly())
const myEmployeeId = computed(() => authUser.value.employeeId || authUser.value.EmployeeId || '')

const myEmployeeLabel = computed(() => {
  const code = authUser.value.employeeCode || authUser.value.EmployeeCode || 'NV'
  const name = authUser.value.fullName || authUser.value.FullName || authUser.value.username || 'Employee'
  return `${code} - ${name}`
})

const canSubmitFace = computed(() => !!myEmployeeId.value && !!facePreview.value)

const employeeOptions = computed(() => {
  if (employees.value.length) return employees.value

  const directory = loadEmployeeDirectory()

  return directory.length ? directory : fallbackEmployees
})

const filteredRecords = computed(() => {
  const employeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value

  return records.value.filter((record) => {
    const d = new Date(recordDate(record))
    const sameMonth = d.getMonth() + 1 === Number(filter.month)
    const sameYear = d.getFullYear() === Number(filter.year)
    const sameEmployee = !employeeId || recordEmployeeId(record) === employeeId

    return sameMonth && sameYear && sameEmployee
  })
})

const calendarDays = computed(() => buildCalendar())

const pendingRequests = computed(() => {
  return requests.value
    .filter((request) => request.status === 'Pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const assignedEmployeesForSelectedDay = computed(() => {
  if (!selectedDay.value || selectedDay.value.isSunday) return []

  if (calendarEmployeeId.value) {
    const emp = employeeOptions.value.find((item) => empId(item) === calendarEmployeeId.value)
    return emp ? [emp] : []
  }

  return assignedEmployees(selectedDay.value.key)
})

const approvedRequestsForSelectedDay = computed(() => {
  if (!selectedDay.value) return []

  return requests.value.filter((request) => {
    const sameDate = request.date === selectedDay.value.key
    const sameEmployee = !calendarEmployeeId.value || request.employeeId === calendarEmployeeId.value

    return sameDate && sameEmployee && request.status === 'Approved'
  })
})

const myRequestsForSelectedDay = computed(() => {
  if (!selectedDay.value) return []

  return requests.value.filter((request) => {
    return request.employeeId === myEmployeeId.value && request.date === selectedDay.value.key
  })
})

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type

  setTimeout(() => {
    message.value = ''
  }, 3800)
}

function empId(emp = {}) {
  return emp.employeeId || emp.EmployeeId || emp.id || emp.Id || ''
}

function empCode(emp = {}) {
  return emp.employeeCode || emp.EmployeeCode || emp.code || '—'
}

function empName(emp = {}) {
  return emp.fullName || emp.FullName || emp.name || '—'
}

function empLabel(emp = {}) {
  return `${empCode(emp)} - ${empName(emp)}`
}

function employeeLabel(employeeId) {
  const emp = employeeOptions.value.find((item) => empId(item) === employeeId)

  if (emp) return empLabel(emp)
  if (employeeId === myEmployeeId.value) return myEmployeeLabel.value

  return shortId(employeeId)
}

function employeeCodeOnly(employeeId) {
  const emp = employeeOptions.value.find((item) => empId(item) === employeeId)

  if (emp) return empCode(emp)
  if (employeeId === myEmployeeId.value) return authUser.value.employeeCode || authUser.value.EmployeeCode || 'NV'

  return shortId(employeeId)
}

function shortId(value = '') {
  const text = String(value || '')
  return text.length > 10 ? `${text.slice(0, 6)}...` : text || '—'
}

function unwrapList(response) {
  if (Array.isArray(response)) return response
  return response?.data || response?.Data || response?.items || response?.Items || []
}

function recordId(record = {}) {
  return (
    record.attendanceId ||
    record.AttendanceId ||
    record.dailyAttendanceId ||
    record.DailyAttendanceId ||
    record.id ||
    record.Id ||
    record.localId
  )
}

function recordEmployeeId(record = {}) {
  return record.employeeId || record.EmployeeId || ''
}

function recordDate(record = {}) {
  return record.workingDate || record.WorkingDate || record.date || record.Date
}

function recordCheckIn(record = {}) {
  return record.checkInTime || record.CheckInTime
}

function recordCheckOut(record = {}) {
  return record.checkOutTime || record.CheckOutTime
}

function recordOvertime(record = {}) {
  return Number(record.overtimeHours ?? record.OvertimeHours ?? 0).toFixed(2)
}

function date(value) {
  if (!value) return '—'

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('vi-VN')
}

function time(value) {
  if (!value) return '—'

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime())
    ? String(value).slice(0, 5)
    : parsed.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
}

function workHours(record) {
  const start = new Date(recordCheckIn(record))
  const end = new Date(recordCheckOut(record))

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '0.00'
  }

  return Math.max(0, (end - start) / 36e5).toFixed(2)
}

function attendanceStatus(record) {
  const checkIn = new Date(recordCheckIn(record))
  const checkOut = new Date(recordCheckOut(record))
  const baseDate = new Date(recordDate(record) || recordCheckIn(record) || Date.now())

  const lateLimit = new Date(baseDate)
  lateLimit.setHours(8, 15, 0, 0)

  const earlyLimit = new Date(baseDate)
  earlyLimit.setHours(17, 0, 0, 0)

  const late = !Number.isNaN(checkIn.getTime()) && checkIn > lateLimit
  const early = !Number.isNaN(checkOut.getTime()) && checkOut < earlyLimit

  if (late && early) return 'Muộn + về sớm'
  if (late) return 'Muộn'
  if (early) return 'Về sớm'

  return 'Đúng giờ'
}

function statusClass(status) {
  const text = String(status)

  if (text.includes('Muộn') || text.includes('sớm')) {
    return 'warn'
  }

  return 'success'
}

function requestStatusText(status) {
  const map = {
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
  }

  return map[status] || status
}

function leaveStatus(leave = {}) {
  return leave.approvalStatus || leave.ApprovalStatus || 'Pending'
}

function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUEST_KEY) || '[]')
  } catch {
    return []
  }
}

function persistRequests() {
  localStorage.setItem(REQUEST_KEY, JSON.stringify(requests.value))
}

function loadLocalRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY) || '[]')
  } catch {
    return []
  }
}

function persistLocalRecords() {
  localStorage.setItem(RECORD_KEY, JSON.stringify(records.value))
}

function loadEmployeeDirectory() {
  try {
    const raw = JSON.parse(localStorage.getItem('hrm_employee_directory_v13') || '{}')

    return Object.entries(raw).map(([id, value]) => ({
      employeeId: id,
      employeeCode: value.employeeCode,
      fullName: value.fullName,
    }))
  } catch {
    return []
  }
}

function openDay(day) {
  selectedDay.value = day
  requestForm.reason = ''
  requestForm.hours = 2
}

function isSunday(dateValue) {
  return new Date(dateValue).getDay() === 0
}

function hashText(text) {
  let hash = 0

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  return hash
}

function assignedEmployees(dateValue) {
  if (isSunday(dateValue)) return []

  const list = employeeOptions.value

  if (!list.length) return []

  const count = Math.min(Math.max(5, Math.min(list.length, 5)), list.length)
  const start = hashText(dateValue) % list.length
  const result = []

  for (let i = 0; i < count; i += 1) {
    result.push(list[(start + i) % list.length])
  }

  return result
}

function approvedLeaveForEmployee(dateValue, employeeId) {
  return requests.value.some((request) => {
    return (
      request.type === 'leave' &&
      request.status === 'Approved' &&
      request.employeeId === employeeId &&
      request.date === dateValue
    )
  })
}

function backendApprovedLeaveForEmployee(dateValue, employeeId) {
  return backendLeaves.value.some((leave) => {
    const emp = leave.employeeId || leave.EmployeeId || ''
    const from = String(leave.fromDate || leave.FromDate || '').slice(0, 10)
    const to = String(leave.toDate || leave.ToDate || '').slice(0, 10)

    return emp === employeeId && from <= dateValue && to >= dateValue && leaveStatus(leave) === 'Approved'
  })
}

function buildCalendar() {
  const days = []
  const firstDate = new Date(filter.year, filter.month - 1, 1)
  const leadBlank = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1
  const lastDay = new Date(filter.year, filter.month, 0).getDate()

  for (let i = 0; i < leadBlank; i += 1) {
    days.push({
      key: `empty-${i}`,
      empty: true,
    })
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const dateValue = `${filter.year}-${String(filter.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dateObj = new Date(dateValue)
    const dayIsSunday = isSunday(dateValue)
    const selectedEmployeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value

    let label = dayIsSunday ? 'Nghỉ' : 'Đi làm'
    let note = ''
    let className = dayIsSunday ? 'holiday' : 'work'
    const badges = []

    if (selectedEmployeeId) {
      const hasLeave = approvedLeaveForEmployee(dateValue, selectedEmployeeId) || backendApprovedLeaveForEmployee(dateValue, selectedEmployeeId)

      if (hasLeave) {
        label = 'Nghỉ phép'
        className = 'leave'
      }

      note = employeeCodeOnly(selectedEmployeeId)
    } else if (!dayIsSunday) {
      const assigned = assignedEmployees(dateValue)
      note = assigned.length ? `${assigned.length} nhân viên` : 'Chưa có NV'
    }

    const approvedOvertime = requests.value.filter((request) => {
      return request.type === 'overtime' && request.status === 'Approved' && request.date === dateValue
    }).length

    const approvedLeave = requests.value.filter((request) => {
      return request.type === 'leave' && request.status === 'Approved' && request.date === dateValue
    }).length

    if (approvedOvertime) badges.push(`OT ${approvedOvertime}`)
    if (approvedLeave && !selectedEmployeeId) badges.push(`Nghỉ ${approvedLeave}`)

    days.push({
      key: dateValue,
      empty: false,
      day,
      isSunday: dayIsSunday,
      weekday: dateObj.toLocaleDateString('vi-VN', { weekday: 'long' }),
      shortWeekday: dateObj.toLocaleDateString('vi-VN', { weekday: 'short' }),
      label,
      note,
      className,
      badges,
    })
  }

  return days
}

function submitRequest() {
  if (!selectedDay.value) return notify('Chọn ngày trước.', 'error')
  if (selectedDay.value.isSunday) return notify('Chủ nhật là ngày nghỉ, không cần gửi yêu cầu.', 'error')
  if (!myEmployeeId.value) return notify('Tài khoản chưa gắn mã nhân viên.', 'error')

  if (!requestForm.reason.trim()) {
    return notify('Nhập lý do trước khi gửi.', 'error')
  }

  const request = {
    id: `req-${Date.now()}`,
    type: requestForm.type,
    employeeId: myEmployeeId.value,
    employeeLabel: myEmployeeLabel.value,
    date: selectedDay.value.key,
    hours: requestForm.type === 'overtime' ? Number(requestForm.hours || 0) : 0,
    leaveType: requestForm.type === 'leave' ? requestForm.leaveType : '',
    reason: requestForm.reason.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  requests.value.unshift(request)
  persistRequests()

  requestForm.reason = ''
  requestForm.hours = 2

  notify('Đã gửi yêu cầu, chờ HR/Admin duyệt.')
}

function approveRequest(request) {
  request.status = 'Approved'
  request.reviewedAt = new Date().toISOString()
  request.reviewedBy = authUser.value.username || 'Admin'

  persistRequests()
  notify('Đã duyệt yêu cầu.')
}

function rejectRequest(request) {
  request.status = 'Rejected'
  request.reviewedAt = new Date().toISOString()
  request.reviewedBy = authUser.value.username || 'Admin'

  persistRequests()
  notify('Đã từ chối yêu cầu.')
}

async function loadEmployees() {
  if (!canManage.value && !isSelfService.value) return

  try {
    employees.value = unwrapEmployees(await hrApi.employees.list({ pageSize: 1000 }))
    saveEmployeeDirectory(employees.value)
  } catch {
    employees.value = []
  }
}

function saveEmployeeDirectory(list = []) {
  const directory = {}

  list.forEach((emp) => {
    const id = empId(emp)

    if (id) {
      directory[id] = {
        employeeCode: empCode(emp),
        fullName: empName(emp),
      }
    }
  })

  localStorage.setItem('hrm_employee_directory_v13', JSON.stringify(directory))
}

async function loadRecords() {
  try {
    const params = {
      month: filter.month,
      year: filter.year,
    }

    if (isSelfService.value && myEmployeeId.value) {
      params.employeeId = requireOwnEmployeeId()
    }

    const apiRecords = unwrapList(await attendanceApi.records.list(params))

    records.value = apiRecords.length ? apiRecords : loadLocalRecords()
  } catch {
    records.value = loadLocalRecords()
  }
}

async function loadLeaves() {
  try {
    backendLeaves.value = unwrapList(
      isSelfService.value && myEmployeeId.value
        ? await attendanceApi.leaves.byEmployee(requireOwnEmployeeId())
        : await attendanceApi.leaves.list()
    )
  } catch {
    backendLeaves.value = []
  }
}

async function loadAll() {
  loading.value = true

  try {
    await Promise.all([loadEmployees(), loadRecords(), loadLeaves()])

    const todayKey = new Date().toISOString().slice(0, 10)
    const sameMonth = Number(todayKey.slice(5, 7)) === Number(filter.month)
    const sameYear = Number(todayKey.slice(0, 4)) === Number(filter.year)

    if (!selectedDay.value && sameMonth && sameYear) {
      selectedDay.value = calendarDays.value.find((day) => day.key === todayKey) || null
    }
  } finally {
    loading.value = false
  }
}

function openFaceModal() {
  showFaceModal.value = true
}

function closeFaceModal() {
  showFaceModal.value = false
  resetFace()
  stopCamera()
}

async function startCamera() {
  try {
    camera.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    camera.active = true
    facePreview.value = ''

    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = camera.stream
    }
  } catch {
    notify('Không mở được camera.', 'error')
  }
}

function captureFace() {
  if (!videoRef.value || !canvasRef.value) return

  const context = canvasRef.value.getContext('2d')
  context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)

  facePreview.value = canvasRef.value.toDataURL('image/jpeg', 0.86)

  stopCamera()
}

function resetFace() {
  facePreview.value = ''
}

function stopCamera() {
  if (camera.stream) {
    camera.stream.getTracks().forEach((track) => track.stop())
  }

  camera.stream = null
  camera.active = false
}

async function verifyFacePhoto() {
  if (!facePreview.value) {
    throw new Error('Bạn cần chụp mặt trước khi chấm công.')
  }

  return true
}

function upsertLocalRecord(type) {
  const today = new Date().toISOString().slice(0, 10)
  const existing = records.value.find((record) => {
    return recordEmployeeId(record) === myEmployeeId.value && String(recordDate(record)).slice(0, 10) === today
  })

  if (type === 'in') {
    if (!existing) {
      records.value.push({
        localId: `local-${myEmployeeId.value}-${Date.now()}`,
        employeeId: myEmployeeId.value,
        workingDate: today,
        checkInTime: new Date().toISOString(),
        status: 'Present',
        overtimeHours: approvedOvertimeHours(today, myEmployeeId.value),
      })
    }
  } else if (existing) {
    existing.checkOutTime = new Date().toISOString()
    existing.overtimeHours = approvedOvertimeHours(today, myEmployeeId.value)
  }

  persistLocalRecords()
}

function approvedOvertimeHours(dateValue, employeeId) {
  return requests.value
    .filter((request) => {
      return (
        request.type === 'overtime' &&
        request.status === 'Approved' &&
        request.employeeId === employeeId &&
        request.date === dateValue
      )
    })
    .reduce((sum, request) => sum + Number(request.hours || 0), 0)
}

async function faceCheckIn() {
  try {
    await verifyFacePhoto()

    try {
      await attendanceApi.records.checkIn(myEmployeeId.value, {
        checkInMethod: 'FaceID',
        checkInPhotoUrl: `face-checkin-${myEmployeeId.value}-${Date.now()}.jpg`,
      })
    } catch {
      // Cho phép chạy demo khi backend N2 chưa sẵn sàng.
    }

    upsertLocalRecord('in')
    notify('Check-in thành công.')
    closeFaceModal()
    await loadAll()
  } catch (error) {
    notify(error.message || 'Check-in thất bại.', 'error')
  }
}

async function faceCheckOut() {
  try {
    await verifyFacePhoto()

    try {
      await attendanceApi.records.checkOut(myEmployeeId.value)
    } catch {
      // Cho phép chạy demo khi backend N2 chưa sẵn sàng.
    }

    upsertLocalRecord('out')
    notify('Check-out thành công.')
    closeFaceModal()
    await loadAll()
  } catch (error) {
    notify(error.message || 'Check-out thất bại.', 'error')
  }
}

async function removeRecord(item) {
  if (!confirm('Xóa bản ghi chấm công này?')) return

  const id = recordId(item)

  try {
    if (String(id).startsWith('local-')) {
      records.value = records.value.filter((record) => recordId(record) !== id)
      persistLocalRecords()
    } else {
      await attendanceApi.records.remove(id)
      records.value = records.value.filter((record) => recordId(record) !== id)
    }

    notify('Đã xóa bản ghi.')
  } catch {
    notify('Không xóa được bản ghi này.', 'error')
  }
}

async function monthlyClose() {
  loading.value = true

  try {
    monthlyPayload.value = unwrapList(await attendanceApi.records.monthlyClose(filter.month, filter.year))
    notify('Đã chốt công.')
  } catch (error) {
    notify(error.message || 'Chốt công thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function exportExcel() {
  const rows = filteredRecords.value.map((record) => ({
    employee: employeeLabel(recordEmployeeId(record)),
    date: date(recordDate(record)),
    checkIn: time(recordCheckIn(record)),
    checkOut: time(recordCheckOut(record)),
    workHours: workHours(record),
    overtime: recordOvertime(record),
    status: attendanceStatus(record),
  }))

  const html = `<table>
    <tr>
      <th>Nhân viên</th>
      <th>Ngày</th>
      <th>Check-in</th>
      <th>Check-out</th>
      <th>Giờ làm</th>
      <th>OT</th>
      <th>Trạng thái</th>
    </tr>
    ${rows
      .map(
        (row) => `<tr>
          <td>${escapeHtml(row.employee)}</td>
          <td>${escapeHtml(row.date)}</td>
          <td>${escapeHtml(row.checkIn)}</td>
          <td>${escapeHtml(row.checkOut)}</td>
          <td>${escapeHtml(row.workHours)}</td>
          <td>${escapeHtml(row.overtime)}</td>
          <td>${escapeHtml(row.status)}</td>
        </tr>`
      )
      .join('')}
  </table>`

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel',
  })

  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = `attendance-${filter.month}-${filter.year}.xls`
  link.click()

  URL.revokeObjectURL(link.href)
}

onMounted(loadAll)

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.attendance-page {
  font-family: "Segoe UI", Arial, sans-serif;
}

.attendance-page :where(button, input, select, textarea, table) {
  font-family: "Segoe UI", Arial, sans-serif;
}

.attendance-card {
  border: 1px solid #dbe3ef;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.06);
}

.attendance-head,
.history-head,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.attendance-head h2,
.history-head h2,
.section-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.attendance-head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.head-actions,
.close-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.head-actions select,
.head-actions input,
.close-actions input,
.request-form input,
.request-form select,
.request-form textarea {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.head-actions select {
  min-width: 240px;
  height: 44px;
  padding: 0 13px;
}

.head-actions input,
.close-actions input {
  width: 88px;
  height: 44px;
  padding: 0 13px;
  text-align: center;
}

.btn.soft {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.work-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: start;
}

.calendar-area {
  min-width: 0;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.weekday-row span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
}

.work-calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.calendar-slot {
  min-width: 0;
}

.calendar-empty {
  min-height: 114px;
}

.day-card {
  width: 100%;
  min-height: 114px;
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  background: #ffffff;
  color: #0f172a;
  padding: 13px;
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
}

.day-card:hover {
  border-color: #bfdbfe;
  background: #f8fbff;
  transform: translateY(-1px);
}

.day-card.active {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.day-card.work {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.day-card.holiday {
  background: #f8fafc;
  color: #475569;
}

.day-card.leave {
  border-color: #fed7aa;
  background: #fff7ed;
}

.day-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.day-top strong {
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.day-top span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.day-card p {
  margin: 14px 0 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.day-card small {
  display: block;
  margin-top: 6px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.day-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.mini-badge {
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 800;
}

.day-panel {
  position: sticky;
  top: 14px;
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-head span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.panel-head h3 {
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #dbe3ef;
  border-radius: 11px;
  background: #ffffff;
  color: #334155;
  font-size: 22px;
  cursor: pointer;
}

.shift-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
  padding: 13px 14px;
  border-radius: 14px;
}

.shift-box span {
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.shift-box strong {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.shift-box.is-work {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}

.shift-box.is-off {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 10px;
}

.section-title span,
.section-head span {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

.employee-list {
  display: grid;
  gap: 8px;
}

.employee-chip {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  padding: 9px 10px;
  font-size: 13px;
  font-weight: 700;
}

.request-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-btn {
  height: 40px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.tab-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.request-form {
  display: grid;
  gap: 8px;
}

.request-form label {
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.request-form input,
.request-form select {
  height: 42px;
  padding: 0 12px;
}

.request-form textarea {
  resize: vertical;
  padding: 10px 12px;
}

.btn.full {
  width: 100%;
  margin-top: 4px;
}

.request-list {
  display: grid;
  gap: 8px;
}

.request-list.self {
  margin-top: 12px;
}

.request-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #f8fafc;
  padding: 10px 12px;
}

.request-row strong {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.request-row small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.request-row span {
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
}

.request-row span.pending {
  color: #c2410c;
}

.request-row span.approved {
  color: #15803d;
}

.request-row span.rejected {
  color: #dc2626;
}

.empty-panel {
  min-height: 240px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: #64748b;
  text-align: center;
}

.empty-panel strong {
  color: #0f172a;
  font-size: 18px;
}

.approval-card,
.history-card,
.close-card,
.schedule-card {
  padding: 22px 24px;
  margin-bottom: 20px;
}

.approval-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.approval-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  background: #f8fafc;
  padding: 14px;
}

.approval-item strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.approval-item p {
  margin: 4px 0;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.approval-item small {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.approval-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
}

.table-wrap td {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
}

.name-cell strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
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

.icon-action.danger {
  border-color: #fee2e2;
  background: #fff7f7;
  color: #dc2626;
}

.icon-action.danger:hover {
  border-color: #dc2626;
  background: #dc2626;
  color: #ffffff;
}

.pill.warn {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.payload-box {
  max-height: 220px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  font-size: 13px;
}

.face-modal {
  max-width: 760px;
}

.face-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 18px;
  align-items: stretch;
}

.face-box {
  min-height: 300px;
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  background: #f8fafc;
}

.face-box video,
.face-box img {
  width: 100%;
  height: 100%;
  min-height: 300px;
  object-fit: cover;
  display: block;
}

.face-placeholder {
  min-height: 300px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: #64748b;
}

.face-placeholder strong {
  color: #0f172a;
  font-size: 24px;
}

.face-placeholder span {
  font-size: 18px;
  font-weight: 700;
}

.face-actions {
  display: grid;
  gap: 10px;
  align-content: start;
}

@media (max-width: 1180px) {
  .work-layout {
    grid-template-columns: 1fr;
  }

  .day-panel {
    position: static;
  }

  .approval-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .attendance-head,
  .history-head,
  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .head-actions,
  .close-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .head-actions select {
    width: 100%;
    min-width: 0;
  }

  .weekday-row {
    display: none;
  }

  .work-calendar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .calendar-empty {
    display: none;
  }

  .day-card {
    min-height: 96px;
  }

  .face-layout {
    grid-template-columns: 1fr;
  }
}
</style>
