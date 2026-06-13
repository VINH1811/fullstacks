<template>
  <section class="page admin-page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <div class="grid cols-2">
      <article class="card premium-card">
        <div class="card-header">
          <div class="card-title">
            <h2>Tạo tài khoản hệ thống</h2>
            <p>JWT Nhóm 1 dùng chung cho Admin, HR và Employee.</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label>Username</label>
            <input v-model.trim="createForm.username" placeholder="vd: hr01" />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input v-model.trim="createForm.email" placeholder="Tùy chọn" />
          </div>
          <div class="form-field">
            <label>Mật khẩu</label>
            <input v-model="createForm.password" type="password" placeholder="Ít nhất 6 ký tự" />
          </div>
          <div class="form-field">
            <label>Nhập lại mật khẩu</label>
            <input v-model="createForm.confirmPassword" type="password" />
          </div>
          <div class="form-field">
            <label>Vai trò</label>
            <select v-model="createForm.role">
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div class="form-field">
            <label>EmployeeId có sẵn</label>
            <input v-model.trim="createForm.employeeId" placeholder="Để trống nếu tạo mới hồ sơ" />
          </div>
          <div class="form-field full">
            <label>Họ tên nhân viên</label>
            <input v-model.trim="createForm.fullName" placeholder="Dùng khi hệ thống tự tạo hồ sơ nhân viên" />
          </div>
        </div>

        <div class="toolbar" style="margin-top: 14px;">
          <button class="btn primary" @click="createAccount">Tạo tài khoản</button>
          <button class="btn ghost" @click="resetCreateForm">Làm mới</button>
        </div>
      </article>

      <article class="card premium-card">
        <div class="card-header">
          <div class="card-title">
            <h2>Phân quyền</h2>
            <p>Role lấy trực tiếp từ JWT sau khi đăng nhập.</p>
          </div>
        </div>
        <div class="role-grid">
          <div class="role-tile"><strong>Admin</strong><span>Toàn quyền hệ thống</span></div>
          <div class="role-tile"><strong>HR</strong><span>Nhân sự, nghỉ phép, chấm công</span></div>
          <div class="role-tile"><strong>Employee</strong><span>Dữ liệu cá nhân</span></div>
        </div>
      </article>
    </div>

    <article class="card premium-card">
      <div class="card-header">
        <div class="card-title">
          <h2>Danh sách tài khoản</h2>
          <p>Sửa, đổi role hoặc xóa tài khoản.</p>
        </div>
        <div class="toolbar">
          <button class="btn ghost" @click="loadUsers">Tải lại</button>
        </div>
      </div>

      <div v-if="!accountApiReady" class="alert error" style="margin-bottom:12px">
        Azure N1 hiện chưa có API /Auth/users. Cần deploy source N1 trong bản này để xem/sửa/xóa tài khoản.
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Nhân viên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="userId(user)">
              <td><strong>{{ user.userName || user.UserName }}</strong></td>
              <td class="name-cell">
                <strong>{{ user.employeeCode || user.EmployeeCode || '—' }} - {{ user.fullName || user.FullName || 'Chưa gắn' }}</strong>
                <span>{{ shortId(user.employeeId || user.EmployeeId) }}</span>
              </td>
              <td>{{ user.email || user.Email || '—' }}</td>
              <td><span class="pill neutral">{{ roleText(user) }}</span></td>
              <td><span class="pill" :class="isActive(user) ? 'success' : 'danger'">{{ isActive(user) ? 'Active' : 'Locked' }}</span></td>
              <td>
                <div class="actions">
                  <button class="btn small" @click="openEdit(user)">Sửa</button>
                  <button class="btn small danger" @click="removeUser(user)">Xóa</button>
                </div>
              </td>
            </tr>
            <tr v-if="!users.length">
              <td colspan="6" class="empty">Chưa tải được danh sách tài khoản.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal small-modal">
        <div class="modal-head">
          <h2>Sửa tài khoản</h2>
          <button class="btn ghost" @click="showModal = false">Đóng</button>
        </div>

        <div class="form-grid">
          <div class="form-field">
            <label>Username</label>
            <input v-model.trim="form.username" />
          </div>
          <div class="form-field">
            <label>Email</label>
            <input v-model.trim="form.email" />
          </div>
          <div class="form-field">
            <label>Role</label>
            <select v-model="form.role">
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div class="form-field">
            <label>Mật khẩu mới</label>
            <input v-model="form.newPassword" type="password" placeholder="Để trống nếu không đổi" />
          </div>
          <label class="switch-row full">
            <input v-model="form.isActive" type="checkbox" />
            <span>Tài khoản hoạt động</span>
          </label>
        </div>

        <div class="modal-foot">
          <button class="btn ghost" @click="showModal = false">Hủy</button>
          <button class="btn primary" @click="saveUser">Lưu</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '../services/api'

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const users = ref([])
const accountApiReady = ref(true)
const showModal = ref(false)
const editingId = ref('')

const createForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Employee',
  employeeId: '',
  fullName: '',
})

const form = reactive({
  username: '',
  email: '',
  role: 'Employee',
  newPassword: '',
  isActive: true,
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

function resetCreateForm() {
  Object.assign(createForm, {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
    employeeId: '',
    fullName: '',
  })
}

function userId(user) {
  return user.id || user.Id || ''
}

function roleText(user) {
  const roles = user.roles || user.Roles || []
  if (Array.isArray(roles)) return roles[0] || 'Employee'
  return roles || 'Employee'
}

function isActive(user) {
  const value = user.isActive ?? user.IsActive
  return value !== false
}

async function createAccount() {
  if (!createForm.username) return notify('Nhập username trước.', 'error')
  if (!createForm.password || createForm.password.length < 6) return notify('Mật khẩu tối thiểu 6 ký tự.', 'error')
  if (createForm.password !== createForm.confirmPassword) return notify('Mật khẩu nhập lại không khớp.', 'error')

  loading.value = true
  try {
    await authApi.register({
      username: createForm.username,
      email: createForm.email,
      password: createForm.password,
      confirmPassword: createForm.confirmPassword,
      role: createForm.role,
      employeeId: createForm.employeeId || null,
      fullName: createForm.fullName || createForm.username,
    })
    notify('Đã tạo tài khoản JWT.')
    resetCreateForm()
    await loadUsers()
  } catch (error) {
    notify(error.message || 'Tạo tài khoản thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  loading.value = true
  accountApiReady.value = true
  try {
    users.value = await authApi.users.list()
  } catch {
    users.value = []
    accountApiReady.value = false
  } finally {
    loading.value = false
  }
}

function openEdit(user) {
  editingId.value = userId(user)
  Object.assign(form, {
    username: user.userName || user.UserName || '',
    email: user.email || user.Email || '',
    role: roleText(user),
    newPassword: '',
    isActive: isActive(user),
  })
  showModal.value = true
}

async function saveUser() {
  if (!editingId.value) return
  loading.value = true
  try {
    await authApi.users.update(editingId.value, {
      username: form.username,
      email: form.email,
      role: form.role,
      newPassword: form.newPassword || null,
      isActive: form.isActive,
    })
    showModal.value = false
    notify('Đã cập nhật tài khoản.')
    await loadUsers()
  } catch (error) {
    notify(error.message || 'Cập nhật tài khoản thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

async function removeUser(user) {
  if (!confirm(`Xóa tài khoản ${user.userName || user.UserName}?`)) return
  loading.value = true
  try {
    await authApi.users.remove(userId(user))
    notify('Đã xóa tài khoản.')
    await loadUsers()
  } catch (error) {
    notify(error.message || 'Xóa tài khoản thất bại.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>
