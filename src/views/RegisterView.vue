<template>
  <section class="auth-page">
    <div class="auth-card compact-auth-card">
      <div class="auth-hero compact-hero">
        <div class="brand-mark large">HR</div>
        <p class="eyebrow">Thiết kế chuẩn</p>
        <h1>Tạo nhân viên trước</h1>
        <p class="auth-subtitle">
          Luồng chuẩn của hệ thống là: tạo hồ sơ nhân viên → cấp tài khoản → gán vai trò.
        </p>
      </div>

      <div class="auth-form compact-auth-form info-only">
        <div>
          <p class="eyebrow">Hướng dẫn</p>
          <h2>Không đăng ký công khai</h2>
        </div>

        <div class="alert info-lite">
          Tài khoản Employee, HR hoặc Admin nên được tạo trong màn <strong>Nhân viên</strong> bởi Admin/HR để gắn đúng hồ sơ nhân sự.
        </div>

        <div class="simple-steps">
          <div class="simple-step"><span>1</span><strong>Tạo hồ sơ nhân viên</strong></div>
          <div class="simple-step"><span>2</span><strong>Bật cấp tài khoản</strong></div>
          <div class="simple-step"><span>3</span><strong>Chọn vai trò và lưu</strong></div>
        </div>

        <div class="actions">
          <RouterLink class="btn primary" to="/login">Về đăng nhập</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
