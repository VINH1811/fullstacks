<template>
  <section class="page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">
      {{ message }}
    </div>

    <article class="card employee-card">
    <div class="employee-head">
  <h2>Nhân viên</h2>
</div>

<div class="employee-tools">
  <div class="search-group">
    <input
      v-model.trim="filters.search"
      placeholder="Tìm theo mã NV"
      @input="scheduleSearch"
      @keyup.enter="loadEmployees"
    />

    <div class="filter-box">
      <button
        class="filter-btn"
        :class="{ active: filters.departmentId || filters.status }"
        title="Bộ lọc"
        @click="showDepartmentFilter = !showDepartmentFilter"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <div v-if="showDepartmentFilter" class="filter-popover">
        <div class="filter-title">Phòng ban</div>

        <button
          class="filter-option"
          :class="{ active: !filters.departmentId }"
          @click="selectDepartment('')"
        >
          Tất cả phòng ban
        </button>

        <button
          v-for="dept in departments"
          :key="dept.departmentId"
          class="filter-option"
          :class="{ active: filters.departmentId === dept.departmentId }"
          @click="selectDepartment(dept.departmentId)"
        >
          {{ dept.departmentName }}
        </button>

        <div class="filter-divider"></div>

        <div class="filter-title">Trạng thái</div>

        <button
          class="filter-option"
          :class="{ active: !filters.status }"
          @click="selectStatus('')"
        >
          Tất cả trạng thái
        </button>

        <button
          class="filter-option"
          :class="{ active: filters.status === 'Active' }"
          @click="selectStatus('Active')"
        >
          Đang làm
        </button>

        <button
          class="filter-option"
          :class="{ active: filters.status === 'Probation' }"
          @click="selectStatus('Probation')"
        >
          Thử việc
        </button>

        <button
          class="filter-option"
          :class="{ active: filters.status === 'Inactive' }"
          @click="selectStatus('Inactive')"
        >
          Nghỉ việc
        </button>
      </div>
    </div>
  </div>

  <button class="add-btn" title="Thêm nhân viên" @click="openCreate">
    +
  </button>
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
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="employee in employees" :key="empId(employee)">
              <td>
                <strong>{{ empCode(employee) }}</strong>
              </td>

              <td class="name-cell">
                <strong>{{ empName(employee) }}</strong>
              </td>

              <td>{{ employee.email || employee.Email || '—' }}</td>

              <td>
                {{ employee.departmentName || employee.DepartmentName || 'Chưa phân bổ' }}
              </td>

              <td>
                <span class="pill" :class="statusClass(employee.status || employee.Status || 'Active')">
                  {{ statusText(employee.status || employee.Status || 'Active') }}
                </span>
              </td>

              <td>
                <div class="actions right">
                  <button class="icon-action" title="Sửa" @click="openEdit(employee)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L17.5 5.5a2.1 2.1 0 0 0-3 0L4 16v4Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>

                  <button class="icon-action danger" title="Xóa" @click="removeEmployee(employee)">
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

            <tr v-if="!employees.length">
              <td colspan="6" class="empty">Không có dữ liệu.</td>
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
            <p class="modal-subtitle">
              Lưu hồ sơ trước, tài khoản sẽ gắn đúng EmployeeId của nhân viên.
            </p>
          </div>

          <button class="btn ghost" @click="showModal = false">
            Đóng
          </button>
        </div>

        <div class="section-box">
          <div class="section-head">
            <h3>Thông tin nhân viên</h3>
            <span class="pill neutral">Hồ sơ</span>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Mã nhân viên</label>
              <input
                v-model.trim="form.employeeCode"
                :disabled="!!editingId"
                placeholder="Để trống: NV01, NV02..."
              />
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
                <option
                  v-for="dept in departments"
                  :key="dept.departmentId"
                  :value="dept.departmentId"
                >
                  {{ dept.departmentName }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label>Trạng thái</label>
              <select v-model="form.status">
                <option value="Active">Đang làm</option>
                <option value="Inactive">Nghỉ việc</option>
                <option value="Probation">Thử việc</option>
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
            <h3>Tài khoản hệ thống</h3>

            <label class="switch-row">
              <input v-model="form.createAccount" type="checkbox" />
              <span>{{ editingId ? 'Tạo tài khoản' : 'Tạo ngay' }}</span>
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
          <button class="btn ghost" @click="showModal = false">
            Hủy
          </button>

          <button class="btn primary" @click="saveEmployee">
            {{ editingId ? 'Lưu thay đổi' : 'Lưu nhân viên' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { authApi, hrApi, unwrapEmployees } from '../services/api'
import { isAdmin } from '../services/auth'

const employees = ref([])
const departments = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref('')
const message = ref('')
const messageType = ref('')
const showDepartmentFilter = ref(false)

let searchTimer = null

const filters = reactive({
  search: '',
  departmentId: '',
})

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

function statusText(status = 'Active') {
  const map = {
    Active: 'Đang làm',
    Inactive: 'Nghỉ việc',
    Probation: 'Thử việc',
  }

  return map[status] || status
}

function statusClass(status = 'Active') {
  if (status === 'Active') return 'success'
  if (status === 'Probation') return 'warning'
  return 'neutral'
}

function scheduleSearch() {
  clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    loadEmployees()
  }, 350)
}

function selectDepartment(departmentId) {
  filters.departmentId = departmentId
  showDepartmentFilter.value = false
  loadEmployees()
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

    if (match) {
      max = Math.max(max, Number(match[1]))
    }
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
      employee.departmentId ||
      employee.DepartmentId ||
      departments.value.find(
        (d) => d.departmentName === (employee.departmentName || employee.DepartmentName)
      )?.departmentId ||
      '',
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
  if (!form.fullName.trim()) {
    return 'Họ tên không được để trống.'
  }

  if (form.createAccount) {
    if (!form.username.trim()) {
      return 'Vui lòng nhập tên đăng nhập.'
    }

    if (!form.password) {
      return 'Vui lòng nhập mật khẩu.'
    }

    if (form.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.'
    }

    if (form.password !== form.confirmPassword) {
      return 'Mật khẩu nhập lại không khớp.'
    }

    if (!canCreateAdmin.value && form.role !== 'Employee') {
      return 'HR chỉ được tạo tài khoản Employee.'
    }
  }

  return ''
}

function extractCreatedEmployeeId(response) {
  const data = response?.data || response?.Data || response?.data?.data || response?.Data?.Data || response

  return data?.employeeId || data?.EmployeeId || data?.data?.employeeId || data?.Data?.EmployeeId || ''
}

async function saveEmployee() {
  const validationError = validateForm()

  if (validationError) {
    return notify(validationError, 'error')
  }

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
        if (!employeeId) {
          throw new Error('API tạo nhân viên không trả EmployeeId để cấp tài khoản.')
        }

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
  if (!confirm(`Xóa nhân viên ${empCode(employee)} - ${empName(employee)}?`)) {
    return
  }

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

onUnmounted(() => {
  clearTimeout(searchTimer)
})
</script>

<style scoped>
.employee-card {
  padding: 20px;
}

.employee-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.employee-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.employee-tools {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 14px;
}

.search-group {
  width: min(420px, 100%);
  height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-group input {
  width: 100%;
  height: 44px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  padding: 0 14px;
  outline: none;
  transition: 0.2s ease;
}

.search-group input::placeholder {
  color: #94a3b8;
  font-weight: 600;
}

.search-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.filter-box {
  position: relative;
  flex: 0 0 auto;
}

.filter-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.filter-btn:hover,
.filter-btn.active {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.filter-popover {
  position: absolute;
  top: 52px;
  left: 0;
  width: 240px;
  max-height: 280px;
  overflow: auto;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
  z-index: 30;
}

.filter-option {
  width: 100%;
  border: 0;
  background: transparent;
  color: #334155;
  padding: 10px 12px;
  border-radius: 10px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.filter-option:hover,
.filter-option.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.add-btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #2563eb;
  color: #ffffff;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
  transition: 0.2s ease;
}

.add-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.name-cell strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.text-right {
  text-align: right;
}

.actions.right {
  justify-content: flex-end;
}

.icon-action {
  width: 34px;
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;
}

.icon-action:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
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

.pill.warning {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}

@media (max-width: 768px) {
  .employee-card {
    padding: 16px;
  }

  .employee-head {
    align-items: center;
  }

  .search-group {
    width: 100%;
  }

  .filter-popover {
    right: 0;
    left: auto;
  }
}
</style>
