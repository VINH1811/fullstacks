<template>
  <section class="page attendance-premium" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <div class="grid cols-4 compact-stats">
      <article class="card stat-card"><p class="stat-label">Bản ghi</p><p class="stat-value">{{ records.length }}</p></article>
      <article class="card stat-card"><p class="stat-label">Đi làm</p><p class="stat-value">{{ presentDays }}</p></article>
      <article class="card stat-card"><p class="stat-label">Tăng ca</p><p class="stat-value">{{ overtimeHours }}h</p></article>
      <article class="card stat-card"><p class="stat-label">Muộn/sớm</p><p class="stat-value">{{ lateEarlyCount }}</p></article>
    </div>

    <article v-if="isSelfService" class="card premium-card face-attendance-card">
      <div class="card-header">
        <div class="card-title">
          <h2>Chấm công khuôn mặt</h2>
          <p>Chụp mặt trước khi check-in hoặc check-out.</p>
        </div>
        <span class="pill neutral">{{ myEmployeeLabel }}</span>
      </div>

      <div class="camera-workspace">
        <div class="camera-main">
          <div
            class="camera-viewport"
            :class="{
              'is-active': camera.active && !facePreview,
              'has-preview': !!facePreview,
              'has-error': !!camera.error,
            }"
          >
            <video
              v-if="camera.active && !facePreview"
              ref="videoRef"
              autoplay
              muted
              playsinline
              @loadedmetadata="handleCameraReady"
            ></video>

            <img
              v-else-if="facePreview"
              :src="facePreview"
              alt="Ảnh xác thực khuôn mặt"
            />

            <div v-else class="camera-placeholder">
              <div class="camera-placeholder-icon" aria-hidden="true">📷</div>
              <strong>Camera chưa bật</strong>
              <small>Nhấn “Bật camera” để bắt đầu xác thực khuôn mặt.</small>
            </div>

            <div v-if="camera.active && !facePreview" class="face-guide" aria-hidden="true">
              <span class="face-guide-oval"></span>
              <span class="guide-corner top-left"></span>
              <span class="guide-corner top-right"></span>
              <span class="guide-corner bottom-left"></span>
              <span class="guide-corner bottom-right"></span>
            </div>

            <div class="camera-status" :class="cameraStatusClass">
              <span class="status-dot"></span>
              {{ cameraStatusText }}
            </div>
          </div>

          <canvas ref="canvasRef" width="720" height="540" hidden></canvas>

          <div class="camera-hints">
            <span>Đặt khuôn mặt ở giữa khung</span>
            <span>Giữ khoảng cách khoảng 40–70 cm</span>
            <span>Đảm bảo khuôn mặt đủ sáng</span>
          </div>
        </div>

        <aside class="camera-control-panel">
          <div class="camera-employee">
            <span class="camera-employee-label">Nhân viên đang chấm công</span>
            <strong>{{ myEmployeeLabel }}</strong>
          </div>

          <div class="camera-instruction">
            <strong>{{ facePreview ? 'Ảnh đã sẵn sàng' : 'Hướng dẫn' }}</strong>
            <p v-if="facePreview">
              Kiểm tra ảnh rõ mặt trước khi thực hiện check-in hoặc check-out.
            </p>
            <p v-else>
              Bật camera, nhìn thẳng vào khung hướng dẫn rồi nhấn chụp mặt.
            </p>
          </div>

          <div class="face-actions">
            <button class="btn ghost" :disabled="camera.active" @click="startCamera">
              Bật camera
            </button>
            <button class="btn warning" :disabled="!camera.ready || !!facePreview" @click="captureFace">
              Chụp mặt
            </button>
            <button class="btn success" :disabled="!canSubmitFace" @click="faceCheckIn">
              Face check-in
            </button>
            <button class="btn primary" :disabled="!canSubmitFace" @click="faceCheckOut">
              Face check-out
            </button>
            <button class="btn ghost camera-action-wide" @click="retakeFace">
              {{ facePreview ? 'Chụp lại ảnh' : 'Làm mới camera' }}
            </button>
          </div>

          <small class="camera-note">
            Ảnh chỉ được dùng cho bước xác thực chấm công hiện tại.
          </small>
        </aside>
      </div>
    </article>

    <article class="card premium-card">
      <div class="card-header calendar-top">
        <div class="card-title">
          <h2>Lịch ngày làm / ngày nghỉ</h2>
          <p>Nhấn trực tiếp vào ngày để xem hoặc xóa dữ liệu.</p>
        </div>

        <div class="toolbar compact-filter">
          <select v-if="canManage" v-model="calendarEmployeeId">
            <option value="">Tất cả nhân viên</option>
            <option v-for="emp in employees" :key="empId(emp)" :value="empId(emp)">
              {{ empLabel(emp) }}
            </option>
          </select>
          <span v-else class="pill neutral">{{ myEmployeeLabel }}</span>
          <input v-model.number="filter.month" type="number" min="1" max="12" @change="loadAll" />
          <input v-model.number="filter.year" type="number" min="2020" @change="loadAll" />
          <button class="btn ghost" @click="loadAll">Tải</button>
        </div>
      </div>

      <div class="calendar-workspace">
        <div class="calendar-grid professional-calendar">
          <div
            v-for="day in calendarDays"
            :key="day.key"
            class="calendar-day"
            :class="[day.className, { active: selectedDay?.key === day.key }]"
            @click="openDay(day)"
          >
            <div class="calendar-day-head">
              <strong>{{ day.day }}</strong>
              <span>{{ day.weekday }}</span>
            </div>
            <p>{{ day.label }}</p>
            <small>{{ day.note }}</small>
          </div>
        </div>

        <aside v-if="selectedDay" class="day-inspector">
          <div class="inspector-head">
            <div>
              <span class="eyebrow">Ngày đã chọn</span>
              <h3>{{ date(selectedDay.key) }}</h3>
            </div>
            <button class="btn ghost small" @click="selectedDay = null">Đóng</button>
          </div>

          <div class="inspector-section schedule-editor">
            <strong>Đăng ký lịch làm</strong>

            <EmployeePicker v-if="canManage" v-model="scheduleForm.employeeId" :employees="employees" />
            <div v-else class="locked-field">{{ myEmployeeLabel }}</div>

            <div class="form-field">
              <label>Trạng thái</label>
              <select v-model="scheduleForm.shift">
                <option value="Work">Đi làm</option>
                <option value="Off">Nghỉ</option>
              </select>
            </div>

            <div class="actions">
              <button class="btn primary" @click="saveSchedule">Lưu lịch</button>
              <button class="btn danger" @click="deleteSchedule">Xóa lịch</button>
            </div>

            <p>{{ selectedSchedule ? `Hiện tại: ${scheduleLabel(selectedSchedule.shift)}` : 'Chưa có lịch.' }}</p>
          </div>

          <div class="inspector-section">
            <strong>Nghỉ phép</strong>
            <div v-if="selectedLeaves.length" class="mini-list">
              <div v-for="leave in selectedLeaves" :key="leaveId(leave)" class="mini-row">
                <span>{{ employeeLabel(leaveEmployeeId(leave)) }}</span>
                <small>{{ leaveStatus(leave) }}</small>
              </div>
            </div>
            <p v-else>Không có đơn nghỉ phép.</p>
          </div>
        </aside>
      </div>
    </article>

    <article class="card premium-card">
      <div class="card-header">
        <div class="card-title">
          <h2>Lịch sử chấm công</h2>
          <p>Hiển thị theo mã nhân viên và họ tên.</p>
        </div>
        <button class="btn primary" @click="exportExcel">Xuất Excel</button>
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
              <th v-if="canManage">Xóa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRecords" :key="recordId(item)">
              <td class="name-cell">
                <strong>{{ employeeLabel(recordEmployeeId(item)) }}</strong>
                <span>{{ shortId(recordEmployeeId(item)) }}</span>
              </td>
              <td>{{ date(recordDate(item)) }}</td>
              <td>{{ time(recordCheckIn(item)) }}</td>
              <td>{{ time(recordCheckOut(item)) }}</td>
              <td>{{ workHours(item) }}h</td>
              <td>{{ recordOvertime(item) }}h</td>
              <td><span class="pill" :class="statusClass(attendanceStatus(item))">{{ attendanceStatus(item) }}</span></td>
              <td v-if="canManage"><button class="btn small danger" @click="removeRecord(item)">Xóa</button></td>
            </tr>
            <tr v-if="!filteredRecords.length">
              <td :colspan="canManage ? 8 : 7" class="empty">Chưa có dữ liệu.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article v-if="canManage" class="card premium-card">
      <div class="card-header">
        <div class="card-title">
          <h2>Chốt công cuối tháng</h2>
          <p>Dữ liệu N2 dùng để kích hoạt tính lương N3.</p>
        </div>
        <div class="toolbar compact-filter">
          <input v-model.number="filter.month" type="number" min="1" max="12" />
          <input v-model.number="filter.year" type="number" min="2020" />
          <button class="btn primary" @click="monthlyClose">Chốt công</button>
        </div>
      </div>
      <pre v-if="monthlyPayload.length" class="payload-box">{{ JSON.stringify(monthlyPayload, null, 2) }}</pre>
    </article>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { attendanceApi, hrApi, unwrapEmployees } from '../services/api'
import { canManageAttendance, getAuthUser, isEmployeeOnly, requireOwnEmployeeId } from '../services/auth'

const EmployeePicker = defineComponent({
  props: { modelValue: String, employees: { type: Array, default: () => [] } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', { class: 'form-field compact-picker' }, [
      h('label', 'Nhân viên'),
      h('select', { value: props.modelValue, onChange: (e) => emit('update:modelValue', e.target.value) }, [
        h('option', { value: '' }, 'Chọn nhân viên'),
        ...props.employees.map((emp) => h('option', { value: empId(emp), key: empId(emp) }, empLabel(emp))),
      ]),
    ])
  },
})

const employees = ref([])
const records = ref(loadLocalRecords())
const leaves = ref([])
const schedules = ref(loadSchedules())
const monthlyPayload = ref([])
const selectedDay = ref(null)
const message = ref('')
const messageType = ref('')
const loading = ref(false)

const now = new Date()
const filter = reactive({ month: now.getMonth() + 1, year: now.getFullYear() })
const scheduleForm = reactive({
  employeeId: '',
  date: new Date().toISOString().slice(0, 10),
  shift: 'Work',
})
const calendarEmployeeId = ref('')

const videoRef = ref(null)
const canvasRef = ref(null)
const facePreview = ref('')
const camera = reactive({ active: false, ready: false, stream: null, error: '' })

const authUser = computed(() => getAuthUser())
const canManage = computed(() => canManageAttendance())
const isSelfService = computed(() => isEmployeeOnly())
const myEmployeeId = computed(() => authUser.value.employeeId)
const myEmployeeLabel = computed(() => {
  const code = authUser.value.employeeCode || 'NV'
  const name = authUser.value.fullName || authUser.value.username || 'Employee'
  return `${code} - ${name}`
})
const canSubmitFace = computed(() => !!myEmployeeId.value && !!facePreview.value)
const cameraStatusText = computed(() => {
  if (facePreview.value) return 'Đã chụp ảnh'
  if (camera.error) return 'Camera gặp lỗi'
  if (camera.ready) return 'Camera sẵn sàng'
  if (camera.active) return 'Đang khởi động camera'
  return 'Camera đang tắt'
})
const cameraStatusClass = computed(() => {
  if (facePreview.value) return 'success'
  if (camera.error) return 'error'
  if (camera.ready) return 'live'
  return 'idle'
})

const filteredRecords = computed(() => {
  const employeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value
  return records.value.filter((r) => !employeeId || recordEmployeeId(r) === employeeId)
})

const presentDays = computed(() => filteredRecords.value.filter((r) => String(r.status || r.Status || '').toLowerCase() === 'present').length)
const overtimeHours = computed(() => filteredRecords.value.reduce((sum, r) => sum + Number(recordOvertime(r) || 0), 0).toFixed(2))
const lateEarlyCount = computed(() => filteredRecords.value.filter((r) => ['Muộn', 'Về sớm', 'Muộn + về sớm'].includes(attendanceStatus(r))).length)
const calendarDays = computed(() => buildCalendar())

const selectedSchedule = computed(() => {
  if (!selectedDay.value) return null
  const employeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value
  return schedules.value.find((s) => (!employeeId || s.employeeId === employeeId) && s.date === selectedDay.value.key)
})
const selectedLeaves = computed(() => {
  if (!selectedDay.value) return []
  const employeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value
  return leaves.value.filter((l) => {
    const emp = leaveEmployeeId(l)
    const from = String(l.fromDate || l.FromDate || '').slice(0, 10)
    const to = String(l.toDate || l.ToDate || '').slice(0, 10)
    return (!employeeId || emp === employeeId) && from <= selectedDay.value.key && to >= selectedDay.value.key
  })
})

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 4200)
}

function shortId(value = '') {
  const text = String(value || '')
  return text.length > 14 ? `${text.slice(0, 8)}...` : text || '—'
}

function empId(emp = {}) { return emp.employeeId || emp.EmployeeId || emp.id || emp.Id || '' }
function empCode(emp = {}) { return emp.employeeCode || emp.EmployeeCode || emp.code || '—' }
function empName(emp = {}) { return emp.fullName || emp.FullName || emp.name || '—' }
function empLabel(emp = {}) { return `${empCode(emp)} - ${empName(emp)}` }
function employeeLabel(employeeId) {
  const emp = employees.value.find((e) => empId(e) === employeeId)
  if (emp) return empLabel(emp)
  if (employeeId === myEmployeeId.value) return myEmployeeLabel.value
  return shortId(employeeId)
}

function unwrapList(response) {
  if (Array.isArray(response)) return response
  return response?.data || response?.Data || response?.items || response?.Items || []
}

function recordId(r) { return r.attendanceId || r.AttendanceId || r.dailyAttendanceId || r.DailyAttendanceId || r.id || r.Id || r.localId }
function recordEmployeeId(r) { return r.employeeId || r.EmployeeId || '' }
function recordDate(r) { return r.workingDate || r.WorkingDate || r.date || r.Date }
function recordCheckIn(r) { return r.checkInTime || r.CheckInTime }
function recordCheckOut(r) { return r.checkOutTime || r.CheckOutTime }
function recordOvertime(r) { return Number(r.overtimeHours ?? r.OvertimeHours ?? 0).toFixed(2) }
function leaveId(l) { return l.leaveId || l.LeaveId || l.id || l.Id }
function leaveEmployeeId(l) { return l.employeeId || l.EmployeeId || '' }
function leaveStatus(l) { return l.approvalStatus || l.ApprovalStatus || 'Pending' }

function date(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('vi-VN')
}
function time(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value).slice(0, 5) : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
function workHours(r) {
  const start = new Date(recordCheckIn(r))
  const end = new Date(recordCheckOut(r))
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '0.00'
  return Math.max(0, (end - start) / 36e5).toFixed(2)
}
function attendanceStatus(r) {
  const checkIn = new Date(recordCheckIn(r))
  const checkOut = new Date(recordCheckOut(r))
  const baseDate = new Date(recordDate(r) || recordCheckIn(r) || Date.now())
  const lateLimit = new Date(baseDate); lateLimit.setHours(8, 15, 0, 0)
  const earlyLimit = new Date(baseDate); earlyLimit.setHours(17, 0, 0, 0)
  const late = !Number.isNaN(checkIn.getTime()) && checkIn > lateLimit
  const early = !Number.isNaN(checkOut.getTime()) && checkOut < earlyLimit
  if (late && early) return 'Muộn + về sớm'
  if (late) return 'Muộn'
  if (early) return 'Về sớm'
  return 'Đúng giờ'
}
function statusClass(status) {
  if (String(status).includes('Muộn') || String(status).includes('sớm')) return 'warn'
  return 'success'
}

function loadSchedules() {
  try { return JSON.parse(localStorage.getItem('hrm_work_schedules_v12') || '[]') } catch { return [] }
}
function persistSchedules() {
  localStorage.setItem('hrm_work_schedules_v12', JSON.stringify(schedules.value))
}
function loadLocalRecords() {
  try { return JSON.parse(localStorage.getItem('hrm_attendance_records_v12') || '[]') } catch { return [] }
}
function persistLocalRecords() {
  localStorage.setItem('hrm_attendance_records_v12', JSON.stringify(records.value))
}
function scheduleKey(employeeId, dateValue) {
  return `${employeeId || 'all'}__${dateValue}`
}
function scheduleLabel(value) {
  return value === 'Work' ? 'Đi làm' : 'Nghỉ'
}
function saveSchedule() {
  if (isSelfService.value) scheduleForm.employeeId = myEmployeeId.value
  if (selectedDay.value) scheduleForm.date = selectedDay.value.key

  if (!scheduleForm.employeeId) return notify('Chọn nhân viên trước.', 'error')
  if (!scheduleForm.date) return notify('Chọn ngày trước.', 'error')

  const key = scheduleKey(scheduleForm.employeeId, scheduleForm.date)
  schedules.value = schedules.value.filter((s) => s.key !== key)
  schedules.value.push({ key, employeeId: scheduleForm.employeeId, date: scheduleForm.date, shift: scheduleForm.shift })
  persistSchedules()
  notify('Đã lưu lịch làm.')
}
function deleteSchedule() {
  if (isSelfService.value) scheduleForm.employeeId = myEmployeeId.value
  if (selectedDay.value) scheduleForm.date = selectedDay.value.key

  const key = scheduleKey(scheduleForm.employeeId, scheduleForm.date)
  const before = schedules.value.length
  schedules.value = schedules.value.filter((s) => s.key !== key)
  persistSchedules()
  notify(before === schedules.value.length ? 'Không có lịch để xóa.' : 'Đã xóa lịch.')
}
function deleteSelectedSchedule() {
  if (!selectedSchedule.value) return
  schedules.value = schedules.value.filter((s) => s.key !== selectedSchedule.value.key)
  persistSchedules()
  notify('Đã xóa lịch ngày này.')
}
function openDay(day) {
  selectedDay.value = day
  scheduleForm.date = day.key

  if (isSelfService.value) {
    scheduleForm.employeeId = myEmployeeId.value
  } else if (calendarEmployeeId.value) {
    scheduleForm.employeeId = calendarEmployeeId.value
  }

  const existing = schedules.value.find((s) => s.employeeId === scheduleForm.employeeId && s.date === day.key)
  scheduleForm.shift = existing?.shift || 'Work'
}

function buildCalendar() {
  const days = []
  const last = new Date(filter.year, filter.month, 0).getDate()
  const employeeId = isSelfService.value ? myEmployeeId.value : calendarEmployeeId.value
  for (let d = 1; d <= last; d++) {
    const dateValue = `${filter.year}-${String(filter.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(dateValue)
    const schedule = schedules.value.find((s) => (!employeeId || s.employeeId === employeeId) && s.date === dateValue)
    const leave = leaves.value.find((l) => {
      const emp = leaveEmployeeId(l)
      const from = String(l.fromDate || l.FromDate || '').slice(0, 10)
      const to = String(l.toDate || l.ToDate || '').slice(0, 10)
      return (!employeeId || emp === employeeId) && from <= dateValue && to >= dateValue && leaveStatus(l) === 'Approved'
    })

    let label = 'Trống'
    let className = 'off'
    let note = ''
    if (leave) {
      label = 'Nghỉ phép'
      className = 'leave'
      note = employeeLabel(leaveEmployeeId(leave))
    } else if (schedule) {
      label = scheduleLabel(schedule.shift)
      className = schedule.shift === 'Work' ? 'scheduled' : 'off'
      note = employeeLabel(schedule.employeeId)
    }

    days.push({
      key: dateValue,
      day: d,
      weekday: dateObj.toLocaleDateString('vi-VN', { weekday: 'short' }),
      label,
      className,
      note,
    })
  }
  return days
}

function saveEmployeeDirectory(list = []) {
  const directory = {}
  list.forEach((emp) => {
    const id = empId(emp)
    if (id) directory[id] = { employeeCode: empCode(emp), fullName: empName(emp) }
  })
  localStorage.setItem('hrm_employee_directory_v13', JSON.stringify(directory))
}

async function loadEmployees() {
  if (!canManage.value) return
  try {
    employees.value = unwrapEmployees(await hrApi.employees.list({ pageSize: 1000 }))
    saveEmployeeDirectory(employees.value)
  } catch {
    employees.value = []
  }
}
async function loadRecords() {
  try {
    const params = { month: filter.month, year: filter.year }
    if (isSelfService.value) params.employeeId = requireOwnEmployeeId()
    const apiRecords = unwrapList(await attendanceApi.records.list(params))
    records.value = apiRecords.length ? apiRecords : loadLocalRecords()
  } catch {
    records.value = loadLocalRecords()
  }
}
async function loadLeaves() {
  try {
    leaves.value = unwrapList(isSelfService.value ? await attendanceApi.leaves.byEmployee(requireOwnEmployeeId()) : await attendanceApi.leaves.list())
  } catch {
    leaves.value = []
  }
}
async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadEmployees(), loadRecords(), loadLeaves()])
  } finally {
    loading.value = false
  }
}

async function startCamera() {
  stopCamera()
  facePreview.value = ''
  camera.error = ''

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Trình duyệt không hỗ trợ truy cập camera.')
    }

    camera.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 960 },
        aspectRatio: { ideal: 4 / 3 },
      },
      audio: false,
    })

    camera.active = true
    await nextTick()

    if (!videoRef.value) {
      throw new Error('Không tìm thấy vùng hiển thị camera.')
    }

    videoRef.value.srcObject = camera.stream

    try {
      await videoRef.value.play()
    } catch {
      // Thuộc tính autoplay sẽ tiếp tục xử lý trên các trình duyệt hỗ trợ.
    }

    if (videoRef.value.readyState >= 2) handleCameraReady()
  } catch (error) {
    stopCamera()
    camera.error = error?.message || 'Không thể truy cập camera.'
    notify('Không mở được camera. Hãy kiểm tra quyền camera của trình duyệt.', 'error')
  }
}

function handleCameraReady() {
  camera.ready = true
  camera.error = ''
}

function captureFace() {
  const video = videoRef.value
  const canvas = canvasRef.value

  if (!video || !canvas || !camera.ready) {
    return notify('Camera chưa sẵn sàng để chụp.', 'error')
  }

  const sourceWidth = video.videoWidth
  const sourceHeight = video.videoHeight

  if (!sourceWidth || !sourceHeight) {
    return notify('Chưa nhận được hình ảnh từ camera.', 'error')
  }

  const targetWidth = 720
  const targetHeight = 540
  const targetRatio = targetWidth / targetHeight
  const sourceRatio = sourceWidth / sourceHeight

  let sourceX = 0
  let sourceY = 0
  let cropWidth = sourceWidth
  let cropHeight = sourceHeight

  // Crop từ tâm để ảnh không bị kéo méo khi camera trả về tỉ lệ khác 4:3.
  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio
    sourceX = (sourceWidth - cropWidth) / 2
  } else if (sourceRatio < targetRatio) {
    cropHeight = sourceWidth / targetRatio
    sourceY = (sourceHeight - cropHeight) / 2
  }

  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) return notify('Không thể xử lý ảnh camera.', 'error')

  context.save()
  context.clearRect(0, 0, targetWidth, targetHeight)

  // Lật ảnh giống phần xem trước để người dùng không thấy ảnh bị đảo chiều sau khi chụp.
  context.translate(targetWidth, 0)
  context.scale(-1, 1)
  context.drawImage(
    video,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  )
  context.restore()

  facePreview.value = canvas.toDataURL('image/jpeg', 0.9)
  stopCamera()
}

function resetFace() {
  facePreview.value = ''
  camera.error = ''
}

async function retakeFace() {
  resetFace()
  await startCamera()
}

function stopCamera() {
  if (camera.stream) camera.stream.getTracks().forEach((track) => track.stop())
  if (videoRef.value) videoRef.value.srcObject = null
  camera.stream = null
  camera.active = false
  camera.ready = false
}
async function verifyFacePhoto() {
  if (!facePreview.value) throw new Error('Bạn cần chụp mặt trước khi chấm công.')
  localStorage.setItem(`hrm_face_checked_${myEmployeeId.value}`, new Date().toISOString())
  return true
}
function upsertLocalRecord(type) {
  const today = new Date().toISOString().slice(0, 10)
  const existing = records.value.find((r) => recordEmployeeId(r) === myEmployeeId.value && String(recordDate(r)).slice(0, 10) === today)
  if (type === 'in') {
    if (!existing) {
      records.value.push({
        localId: `local-${myEmployeeId.value}-${Date.now()}`,
        employeeId: myEmployeeId.value,
        workingDate: today,
        checkInTime: new Date().toISOString(),
        status: 'Present',
        overtimeHours: 0,
      })
    }
  } else if (existing) {
    existing.checkOutTime = new Date().toISOString()
  }
  persistLocalRecords()
}
async function faceCheckIn() {
  try {
    await verifyFacePhoto()
    await attendanceApi.records.checkIn(myEmployeeId.value, {
      checkInMethod: 'FaceID',
      checkInPhotoUrl: `face-checkin-${myEmployeeId.value}-${Date.now()}.jpg`,
    })
    upsertLocalRecord('in')
    notify('Face check-in thành công.')
    resetFace()
    await loadAll()
  } catch (error) {
    notify(error.message || 'Check-in thất bại.', 'error')
  }
}
async function faceCheckOut() {
  try {
    await verifyFacePhoto()
    await attendanceApi.records.checkOut(myEmployeeId.value)
    upsertLocalRecord('out')
    notify('Face check-out thành công.')
    resetFace()
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
      records.value = records.value.filter((r) => recordId(r) !== id)
      persistLocalRecords()
    } else {
      await attendanceApi.records.remove(id)
      records.value = records.value.filter((r) => recordId(r) !== id)
    }
    notify('Đã xóa bản ghi.')
  } catch (error) {
    notify('Backend N2 hiện tại chưa hỗ trợ xóa bản ghi này. Cần deploy source N2 trong bản zip.', 'error')
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
function exportExcel() {
  const rows = filteredRecords.value.map((r) => ({
    employee: employeeLabel(recordEmployeeId(r)),
    date: date(recordDate(r)),
    checkIn: time(recordCheckIn(r)),
    checkOut: time(recordCheckOut(r)),
    workHours: workHours(r),
    overtime: recordOvertime(r),
    status: attendanceStatus(r),
  }))
  const html = `<table><tr><th>Nhân viên</th><th>Ngày</th><th>Check-in</th><th>Check-out</th><th>Giờ làm</th><th>OT</th><th>Trạng thái</th></tr>${rows
    .map((r) => `<tr><td>${r.employee}</td><td>${r.date}</td><td>${r.checkIn}</td><td>${r.checkOut}</td><td>${r.workHours}</td><td>${r.overtime}</td><td>${r.status}</td></tr>`)
    .join('')}</table>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `attendance-${filter.month}-${filter.year}.xls`
  link.click()
  URL.revokeObjectURL(link.href)
}

onMounted(loadAll)
onBeforeUnmount(stopCamera)
</script>

<style scoped>
.face-attendance-card {
  overflow: hidden;
}

.camera-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.7fr);
  gap: 24px;
  align-items: stretch;
  margin-top: 18px;
}

.camera-main {
  min-width: 0;
}

.camera-viewport {
  position: relative;
  width: 100%;
  max-width: 760px;
  aspect-ratio: 4 / 3;
  min-height: 300px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.38);
  border-radius: 22px;
  background:
    radial-gradient(circle at 50% 30%, rgba(51, 65, 85, 0.88), rgba(15, 23, 42, 0.98) 62%),
    #0f172a;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  isolation: isolate;
}

.camera-viewport::after {
  position: absolute;
  inset: 0;
  z-index: 4;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: inherit;
  pointer-events: none;
  content: '';
}

.camera-viewport video,
.camera-viewport img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.camera-viewport video {
  transform: scaleX(-1);
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px;
  color: #e2e8f0;
  text-align: center;
}

.camera-placeholder-icon {
  display: grid;
  width: 72px;
  height: 72px;
  margin-bottom: 4px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 34px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.camera-placeholder strong {
  font-size: 1.05rem;
}

.camera-placeholder small {
  max-width: 340px;
  color: #94a3b8;
  line-height: 1.55;
}

.face-guide {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.face-guide-oval {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(170px, 38%, 275px);
  height: clamp(235px, 64%, 390px);
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  box-shadow:
    0 0 0 999px rgba(2, 6, 23, 0.28),
    0 0 28px rgba(255, 255, 255, 0.15);
  transform: translate(-50%, -50%);
}

.guide-corner {
  position: absolute;
  width: 38px;
  height: 38px;
  border-color: #60a5fa;
  border-style: solid;
}

.guide-corner.top-left {
  top: 22px;
  left: 22px;
  border-width: 3px 0 0 3px;
  border-radius: 12px 0 0;
}

.guide-corner.top-right {
  top: 22px;
  right: 22px;
  border-width: 3px 3px 0 0;
  border-radius: 0 12px 0 0;
}

.guide-corner.bottom-left {
  bottom: 22px;
  left: 22px;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 12px;
}

.guide-corner.bottom-right {
  right: 22px;
  bottom: 22px;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 12px;
}

.camera-status {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 32px);
  padding: 8px 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.16);
}

.camera-status.live .status-dot {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
  animation: camera-pulse 1.8s infinite;
}

.camera-status.success .status-dot {
  background: #38bdf8;
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.18);
}

.camera-status.error .status-dot {
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18);
}

.camera-hints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.camera-hints span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 999px;
  background: var(--surface-soft, #f8fafc);
  color: var(--muted, #64748b);
  font-size: 0.76rem;
  line-height: 1.2;
}

.camera-hints span::before {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #3b82f6;
  content: '';
}

.camera-control-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 20px;
  background: var(--surface-soft, #f8fafc);
}

.camera-employee {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.camera-employee-label {
  color: var(--muted, #64748b);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.camera-employee strong {
  overflow-wrap: anywhere;
  color: var(--text, #0f172a);
  font-size: 0.98rem;
  line-height: 1.45;
}

.camera-instruction {
  padding: 14px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.07);
}

.camera-instruction strong {
  display: block;
  margin-bottom: 5px;
  color: var(--text, #0f172a);
  font-size: 0.88rem;
}

.camera-instruction p {
  margin: 0;
  color: var(--muted, #64748b);
  font-size: 0.8rem;
  line-height: 1.55;
}

.face-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: auto;
}

.face-actions .btn {
  width: 100%;
  min-height: 42px;
  padding-inline: 12px;
  white-space: normal;
}

.camera-action-wide {
  grid-column: 1 / -1;
}

.camera-note {
  display: block;
  color: var(--muted, #64748b);
  font-size: 0.72rem;
  line-height: 1.5;
  text-align: center;
}

@keyframes camera-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@media (max-width: 980px) {
  .camera-workspace {
    grid-template-columns: 1fr;
  }

  .camera-control-panel {
    width: 100%;
  }

  .face-actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .camera-action-wide {
    grid-column: auto;
  }
}

@media (max-width: 700px) {
  .camera-workspace {
    gap: 16px;
  }

  .camera-viewport {
    min-height: 0;
    border-radius: 16px;
  }

  .camera-control-panel {
    padding: 16px;
    border-radius: 16px;
  }

  .face-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .camera-action-wide {
    grid-column: 1 / -1;
  }

  .camera-hints {
    justify-content: flex-start;
  }
}

@media (max-width: 460px) {
  .camera-status {
    top: 10px;
    left: 10px;
    max-width: calc(100% - 20px);
    padding: 7px 10px;
  }

  .face-guide-oval {
    width: 42%;
    height: 66%;
  }

  .guide-corner {
    width: 28px;
    height: 28px;
  }

  .guide-corner.top-left {
    top: 14px;
    left: 14px;
  }

  .guide-corner.top-right {
    top: 14px;
    right: 14px;
  }

  .guide-corner.bottom-left {
    bottom: 14px;
    left: 14px;
  }

  .guide-corner.bottom-right {
    right: 14px;
    bottom: 14px;
  }

  .face-actions {
    grid-template-columns: 1fr;
  }

  .camera-action-wide {
    grid-column: auto;
  }
}
</style>
