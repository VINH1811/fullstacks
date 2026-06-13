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

      <div class="face-layout">
        <div class="face-box">
          <video v-if="camera.active && !facePreview" ref="videoRef" autoplay muted playsinline></video>
          <img v-else-if="facePreview" :src="facePreview" alt="Ảnh xác thực khuôn mặt" />
          <div v-else class="face-placeholder">
            <span>📷</span>
            <strong>Camera chưa bật</strong>
            <small>Dùng camera để xác thực khuôn mặt.</small>
          </div>
          <canvas ref="canvasRef" width="420" height="280" hidden></canvas>
        </div>

        <div class="face-actions">
          <button class="btn ghost" @click="startCamera">Bật camera</button>
          <button class="btn warning" :disabled="!camera.active" @click="captureFace">Chụp mặt</button>
          <button class="btn success" :disabled="!canSubmitFace" @click="faceCheckIn">Face check-in</button>
          <button class="btn primary" :disabled="!canSubmitFace" @click="faceCheckOut">Face check-out</button>
          <button class="btn ghost" @click="resetFace">Làm lại</button>
        </div>
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
const camera = reactive({ active: false, stream: null })

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
  try {
    camera.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    camera.active = true
    facePreview.value = ''
    await nextTick()
    if (videoRef.value) videoRef.value.srcObject = camera.stream
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
  if (camera.stream) camera.stream.getTracks().forEach((track) => track.stop())
  camera.stream = null
  camera.active = false
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
