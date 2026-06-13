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

          <div ref="filterBoxRef" class="filter-box">
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

              <td>
                {{ employee.email || employee.Email || '—' }}
              </td>

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
const filterBoxRef = ref(null)

let searchTimer = null

const filters = reactive({
  search: '',
  departmentId: '',
  status: '',
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

function selectStatus(status) {
  filters.status = status
  showDepartmentFilter.value = false
  loadEmployees()
}
function handleOutsideFilterClick(event) {
  if (!showDepartmentFilter.value) return

  const target = event.target

  if (filterBoxRef.value && !filterBoxRef.value.contains(target)) {
    showDepartmentFilter.value = false
  }
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
    const query = {
      search: filters.search,
      departmentId: filters.departmentId,
    }

    const response = await hrApi.employees.list(query)
    let list = unwrapEmployees(response)

    if (filters.status) {
      list = list.filter((employee) => {
        const status = employee.status || employee.Status || 'Active'
        return status === filters.status
      })
    }

    employees.value = list
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
  document.addEventListener('click', handleOutsideFilterClick)

  await loadDepartments().catch(() => {})
  await loadEmployees()
})

onUnmounted(() => {
  clearTimeout(searchTimer)
  document.removeEventListener('click', handleOutsideFilterClick)
})
</script>

<style scoped>
.employee-card {
  width: 100%;
  padding: 28px 32px 32px;
}

.employee-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.employee-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -0.045em;
}

.employee-tools {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 26px;
}

.search-group {
  flex: 1;
  max-width: none;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-group input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 56px;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  background: #ffffff;
  color: #0f172a;
  font-size: 16px;
  font-weight: 650;
  padding: 0 22px;
  outline: none;
  transition: 0.2s ease;
}

.search-group input::placeholder {
  color: #94a3b8;
  font-weight: 650;
}

.search-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.filter-box {
  position: relative;
  flex: 0 0 auto;
}

.filter-btn {
  width: 56px;
  height: 56px;
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  background: #ffffff;
  color: #334155;
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
  top: 66px;
  right: 0;
  width: 300px;
  max-height: 430px;
  overflow: auto;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
  z-index: 50;
}

.filter-title {
  padding: 8px 10px 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-divider {
  height: 1px;
  margin: 8px 4px;
  background: #e2e8f0;
}

.filter-option {
  width: 100%;
  border: 0;
  background: transparent;
  color: #334155;
  padding: 11px 12px;
  border-radius: 11px;
  text-align: left;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.18s ease;
}

.filter-option:hover,
.filter-option.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.add-btn {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  margin-left: auto;
  border: 0;
  border-radius: 16px;
  background: #2563eb;
  color: #ffffff;
  font-size: 30px;
  font-weight: 750;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.24);
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
    padding: 18px;
  }

  .employee-head {
    margin-bottom: 18px;
  }

  .employee-head h2 {
    font-size: 24px;
  }

  .employee-tools {
    gap: 12px;
    margin-bottom: 18px;
  }

  .search-group {
    width: 100%;
    height: 52px;
    gap: 8px;
  }

  .search-group input {
    height: 52px;
    font-size: 14px;
    padding: 0 14px;
  }

  .filter-btn,
  .add-btn {
    width: 52px;
    height: 52px;
    flex-basis: 52px;
    border-radius: 14px;
  }

  .filter-popover {
    right: 0;
    width: 280px;
  }
}
</style>
