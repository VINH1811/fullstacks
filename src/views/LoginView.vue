<template>
  <section class="auth-page">
    <div class="auth-card compact-auth-card">
      <div class="auth-hero compact-hero">
        <div class="brand-mark large">HR</div>
        <p class="eyebrow">WLPRO HRM</p>
        <h1>Đăng nhập</h1>
        <p class="auth-subtitle">Admin, HR và Employee dùng tài khoản được cấp để truy cập hệ thống.</p>

        
      </div>

      <form class="auth-form compact-auth-form" @submit.prevent="submitLogin">
        <div>
          <p class="eyebrow">JWT Auth</p>
          <h2>Chào mừng trở lại</h2>
        </div>

        <div v-if="error" class="alert error">{{ error }}</div>
        <div v-if="message" class="alert success">{{ message }}</div>

        <label class="form-field">
          <span>Tên đăng nhập hoặc email</span>
          <input v-model.trim="form.username" autocomplete="username" placeholder="admin" required />
        </label>

        <label class="form-field">
          <span>Mật khẩu</span>
          <input v-model="form.password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" required />
        </label>

        <button class="btn primary auth-submit" :disabled="loading" type="submit">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <p class="auth-hint">Nếu chưa có tài khoản, hãy nhờ Admin hoặc HR cấp trong mục Nhân viên.</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../services/api'
import { saveAuth } from '../services/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const message = ref('')
const form = reactive({ username: 'admin', password: '123456' })

async function submitLogin() {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const res = await authApi.login({
      username: form.username,
      password: form.password,
    })

    saveAuth(res, form.username)
    message.value = 'Đăng nhập thành công.'

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
  } catch (err) {
    error.value = err.message || 'Đăng nhập thất bại. Kiểm tra backend N1 và tài khoản.'
  } finally {
    loading.value = false
  }
}
</script>
