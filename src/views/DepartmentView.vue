<template>
  <section class="page" :class="{ loading }">
    <div v-if="message" class="alert" :class="messageType">{{ message }}</div>

    <div class="grid cols-3">
      <article class="card stat-card">
        <p class="stat-label">Tổng phòng ban</p>
        <p class="stat-value">{{ departments.length }}</p>
        <p class="stat-note">N1 /api/Departments</p>
      </article>
      <article class="card stat-card">
        <p class="stat-label">Nhân sự đã phân bổ</p>
        <p class="stat-value">{{ totalHeadcount }}</p>
        <p class="stat-note">N1 /api/Departments/stats</p>
      </article>
      <article class="card stat-card">
        <p class="stat-label">Phòng lớn nhất</p>
        <p class="stat-value">{{ largestDepartment?.headcount || 0 }}</p>
        <p class="stat-note">{{ largestDepartment?.name || '—' }}</p>
      </article>
    </div>

    <article class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>Quản lý cơ cấu phòng ban</h2>
          <p>Hiện backend N1 đang hỗ trợ phòng ban dạng danh mục; giao diện đã tích hợp CRUD đầy đủ.</p>
        </div>
        <button class="btn primary" @click="openCreate">+ Thêm phòng ban</button>
      </div>

      <div class="grid cols-3">
        <div v-for="dept in enrichedDepartments" :key="dept.departmentId" class="card" style="box-shadow:none; background: var(--panel-soft);">
          <div class="card-header">
            <div>
              <h3>{{ dept.departmentName }}</h3>
              <p class="stat-note">ID: {{ dept.departmentId }}</p>
            </div>
            <span class="pill success">{{ dept.headcount }} NV</span>
          </div>
          <div class="progress-bar"><span :style="{ width: headcountRatio(dept.headcount) + '%' }"></span></div>
          <div class="actions" style="margin-top: 14px;">
            <button class="btn small" @click="openEdit(dept)">Sửa</button>
            <button class="btn small danger" @click="removeDepartment(dept)">Xóa</button>
          </div>
        </div>
        <div v-if="!departments.length" class="empty">Chưa có phòng ban hoặc chưa chạy N1 Service.</div>
      </div>
    </article>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <h2>{{ editingId ? 'Sửa phòng ban' : 'Thêm phòng ban' }}</h2>
          <button class="btn ghost" @click="showModal = false">Đóng</button>
        </div>
        <div class="form-field">
          <label>Tên phòng ban</label>
          <input v-model="form.departmentName" placeholder="Phòng Nhân sự" />
        </div>
        <div class="modal-foot">
          <button class="btn ghost" @click="showModal = false">Hủy</button>
          <button class="btn primary" @click="saveDepartment">Lưu</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { hrApi } from '../services/api'

const departments = ref([])
const stats = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref('')
const message = ref('')
const messageType = ref('')
const form = reactive({ departmentName: '' })

const enrichedDepartments = computed(() => departments.value.map(dept => {
  const s = stats.value.find(x => x.id === dept.departmentId)
  return { ...dept, headcount: s?.headcount || 0 }
}))
const totalHeadcount = computed(() => enrichedDepartments.value.reduce((sum, x) => sum + x.headcount, 0))
const largestDepartment = computed(() => [...stats.value].sort((a, b) => (b.headcount || 0) - (a.headcount || 0))[0])
const maxHeadcount = computed(() => Math.max(...enrichedDepartments.value.map(x => x.headcount), 1))

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => (message.value = ''), 3500)
}

function headcountRatio(value) {
  return Math.max(5, Math.round((value / maxHeadcount.value) * 100))
}

async function loadData() {
  loading.value = true
  try {
    const [deptData, statData] = await Promise.all([hrApi.departments.list(), hrApi.departments.stats()])
    departments.value = deptData || []
    stats.value = statData || []
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = ''
  form.departmentName = ''
  showModal.value = true
}

function openEdit(dept) {
  editingId.value = dept.departmentId
  form.departmentName = dept.departmentName
  showModal.value = true
}

async function saveDepartment() {
  if (!form.departmentName.trim()) return notify('Tên phòng ban không được để trống.', 'error')
  loading.value = true
  try {
    if (editingId.value) await hrApi.departments.update(editingId.value, form)
    else await hrApi.departments.create(form)
    showModal.value = false
    notify('Đã lưu phòng ban.')
    await loadData()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

async function removeDepartment(dept) {
  if (!confirm(`Xóa phòng ban ${dept.departmentName}?`)) return
  loading.value = true
  try {
    await hrApi.departments.remove(dept.departmentId)
    notify('Đã xóa phòng ban.')
    await loadData()
  } catch (error) {
    notify(error.message, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
