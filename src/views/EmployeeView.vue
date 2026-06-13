<template>
  <section class="page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <article class="card">
      <div class="card-header compact-header">
        <div class="card-title">
          <h2>Nhân viên</h2>
          <p>Tạo hồ sơ nhân viên. Có thể cấp tài khoản ngay hoặc cấp sau khi sửa.</p>
        </div>
        <div class="toolbar wrap-mobile">
          <input v-model.trim="filters.search" placeholder="Tìm tên hoặc mã" @keyup.enter="loadEmployees" />
          <select v-model="filters.departmentId" @change="loadEmployees">
            <option value="">Tất cả phòng ban</option>
            <option v-for="dept in departments" :key="dept.departmentId" :value="dept.departmentId">
              {{ dept.departmentName }}
            </option>
          </select>
          <button class="btn ghost" @click="loadEmployees">Lọc</button>
          <button class="btn primary" @click="openCreate">+ Thêm nhân viên</button>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Nhân viên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="empId(employee)">
              <td><strong>{{ empCode(employee) }}</strong></td>
              <td class="name-cell">
                <strong>{{ empCode(employee) }} - {{ empName(employee) }}</strong>
                <span>{{ shortId(empId(employee)) }}</span>
              </td>
              <td>{{ employee.email || employee.Email || '—' }}</td>
              <td>{{ employee.departmentName || employee.DepartmentName || 'Chưa phân bổ' }}</td>
              <td>
                <span class="pill" :class="(employee.status || employee.Status || 'Active') === 'Active' ? 'success' : 'neutral'">
                  {{ employee.status || employee.Status || 'Active' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn small" @click="openEdit(employee)">Sửa</button>
                  <button class="btn small danger" @click="removeEmployee(employee)">Xóa</button>
                </div>
              </td>
            </tr>
            <tr v-if="!employees.length">
              <td colspan="6" class="empty">Chưa có dữ liệu nhân viên.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h2>{{ editingId ? 'Sửa nhân viên' : 'Thêm nhân viên' }}</h2>
            <p class="modal-subtitle">Lưu hồ sơ trước, tài khoản sẽ gắn đúng EmployeeId của nhân viên.</p>
          </div>
          <button class="btn ghost" @click="showModal = false">Đóng</button>
        </div>

        <div class="section-box">
          <div class="section-head">
            <h3>Thông tin nhân viên</h3>
            <span class="pill neutral">Hồ sơ</span>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Mã nhân viên</label>
              <input v-model.trim="form.employeeCode" :disabled="!!editingId" placeholder="Để trống: NV01, NV02..." />
            </div>
            <div class="form-field">
              <label>Họ tên</label>
              <input v-model.trim="form.fullName" placeholder="Nguyễn Văn A" />
            </div>
            <div class="form-field">
              <label>Email</label>
              <input v-model.trim="form.email" placeholder="email@company.com" />
            </div>
            <div class="form-field">
              <label>Phòng ban</label>
              <select v-model="form.departmentId">
                <option value="">Chưa phân bổ</option>
                <option v-for="dept in departments" :key="dept.departmentId" :value="dept.departmentId">
                  {{ dept.departmentName }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Trạng thái</label>
              <select v-model="form.status">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Probation">Probation</option>
              </select>
            </div>
            <div class="form-field">
              <label>Face ID</label>
              <input v-model.trim="form.faceFeatures" placeholder="Tùy chọn" />
            </div>
          </div>
        </div>

        <div class="section-box">
          <div class="section-head">
            <h3>Cấp tài khoản hệ thống</h3>
            <label class="switch-row">
              <input v-model="form.createAccount" type="checkbox" />
              <span>{{ editingId ? 'Tạo tài khoản cho nhân viên này' : 'Tạo tài khoản ngay' }}</span>
            </label>
          </div>

          <div v-if="form.createAccount" class="form-grid account-grid">
            <div class="form-field">
              <label>Tên đăng nhập</label>
              <input v-model.trim="form.username" placeholder="vd: hoainam_hr" />
            </div>
            <div class="form-field">
              <label>Vai trò</label>
              <select v-model="form.role">
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option v-if="canCreateAdmin" value="Admin">Admin</option>
              </select>
            </div>
            <div class="form-field">
              <label>Mật khẩu</label>
              <input v-model="form.password" type="password" placeholder="Ít nhất 6 ký tự" />
            </div>
            <div class="form-field">
              <label>Nhập lại mật khẩu</label>
              <input v-model="form.confirmPassword" type="password" placeholder="Nhập lại mật khẩu" />
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button class="btn ghost" @click="showModal = false">Hủy</button>
          <button class="btn primary" @click="saveEmployee">
            {{ editingId ? 'Lưu thay đổi' : 'Lưu nhân viên' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { authApi, hrApi, unwrapEmployees } from '../services/api'
import { isAdmin } from '../services/auth'

const employees = ref([])
const departments = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref('')
const message = ref('')
const messageType = ref('')

const filters = reactive({ search: '', departmentId: '' })
const form = reactive({
  employeeCode: '',
  fullName: '',
  email: '',
  status: 'Active',
  departmentId: '',
  faceFeatures: '',
  createAccount: false,
  username: '',
  password: '',
  confirmPassword: '',
  role: 'Employee',
})

const canCreateAdmin = computed(() => isAdmin())

function empId(emp = {}) {
  return emp.employeeId || emp.EmployeeId || emp.id || emp.Id || ''
}
function empCode(emp = {}) {
  return emp.employeeCode || emp.EmployeeCode || emp.code || '—'
}
function empName(emp = {}) {
  return emp.fullName || emp.FullName || emp.name || '—'
}

function shortId(value = '') {
  const text = String(value || '')
  return text.length > 14 ? `${text.slice(0, 8)}...` : text || '—'
}

function resetForm() {
  Object.assign(form, {
    employeeCode: '',
    fullName: '',
    email: '',
    status: 'Active',
    departmentId: '',
    faceFeatures: '',
    createAccount: false,
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  })
  editingId.value = ''
}

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 4200)
}

function nextEmployeeCode() {
  let max = 0
  employees.value.forEach((emp) => {
    const code = String(empCode(emp)).toUpperCase()
    const match = code.match(/^NV0*(\d+)$/)
    if (match) max = Math.max(max, Number(match[1]))
  })
  return `NV${String(max + 1).padStart(2, '0')}`
}

function baseEmployeePayload() {
  return {
    employeeCode: form.employeeCode?.trim() || nextEmployeeCode(),
    fullName: form.fullName?.trim(),
    email: form.email?.trim() || null,
    status: form.status || 'Active',
    departmentId: form.departmentId || null,
    faceFeatures: form.faceFeatures?.trim() || null,
  }
}

function accountPayload(employeeId) {
  return {
    username: form.username.trim(),
    email: form.email?.trim() || '',
    password: form.password,
    confirmPassword: form.confirmPassword,
    employeeId,
    role: form.role,
  }
}

async function loadDepartments() {
  departments.value = await hrApi.departments.list()
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

async function loadEmployees() {
  loading.value = true
  try {
    const response = await hrApi.employees.list(filters)
    employees.value = unwrapEmployees(response)
    saveEmployeeDirectory(employees.value)
  } catch (error) {
    notify(error.message || 'Không tải được danh sách nhân viên.', 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function openEdit(employee) {
  editingId.value = empId(employee)
  Object.assign(form, {
    employeeCode: empCode(employee) === '—' ? '' : empCode(employee),
    fullName: empName(employee) === '—' ? '' : empName(employee),
    email: employee.email || employee.Email || '',
    status: employee.status || employee.Status || 'Active',
    departmentId:
      employee.departmentId || employee.DepartmentId || departments.value.find((d) => d.departmentName === (employee.departmentName || employee.DepartmentName))?.departmentId || '',
    faceFeatures: employee.faceFeatures || employee.FaceFeatures || '',
    createAccount: false,
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  })
  showModal.value = true
}

function validateForm() {
  if (!form.fullName.trim()) return 'Họ tên không được để trống.'
  if (form.createAccount) {
    if (!form.username.trim()) return 'Vui lòng nhập tên đăng nhập.'
    if (!form.password) return 'Vui lòng nhập mật khẩu.'
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.'
    if (form.password !== form.confirmPassword) return 'Mật khẩu nhập lại không khớp.'
    if (!canCreateAdmin.value && form.role !== 'Employee') return 'HR chỉ được tạo tài khoản Employee.'
  }
  return ''
}

function extractCreatedEmployeeId(response) {
  const data = response?.data || response?.Data || response?.data?.data || response?.Data?.Data || response
  return data?.employeeId || data?.EmployeeId || data?.data?.employeeId || data?.Data?.EmployeeId || ''
}

async function saveEmployee() {
  const validationError = validateForm()
  if (validationError) return notify(validationError, 'error')

  loading.value = true
  try {
    if (editingId.value) {
      await hrApi.employees.update(editingId.value, baseEmployeePayload())

      if (form.createAccount) {
        await authApi.register(accountPayload(editingId.value))
      }

      notify(form.createAccount ? 'Đã cập nhật nhân viên và cấp tài khoản.' : 'Đã cập nhật nhân viên.')
    } else {
      const payload = baseEmployeePayload()
      const createdResponse = await hrApi.employees.create(payload)
      const employeeId = extractCreatedEmployeeId(createdResponse)

      if (form.createAccount) {
        if (!employeeId) throw new Error('API tạo nhân viên không trả EmployeeId để cấp tài khoản.')
        try {
          await authApi.register(accountPayload(employeeId))
        } catch (error) {
          await hrApi.employees.remove(employeeId).catch(() => {})
          throw error
        }
      }

      notify(form.createAccount ? 'Đã tạo nhân viên và cấp tài khoản.' : 'Đã tạo nhân viên mới.')
    }

    showModal.value = false
    await loadEmployees()
  } catch (error) {
    notify(error.message || 'Lưu nhân viên thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

async function removeEmployee(employee) {
  if (!confirm(`Xóa nhân viên ${empCode(employee)} - ${empName(employee)}?`)) return
  loading.value = true
  try {
    await hrApi.employees.remove(empId(employee))
    notify('Đã xóa nhân viên.')
    await loadEmployees()
  } catch (error) {
    notify(error.message || 'Xóa thất bại. Nếu nhân viên đã có tài khoản, cần backend xóa User kèm Employee.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadDepartments().catch(() => {})
  await loadEmployees()
})
</script>
