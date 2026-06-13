<template>
  <main class="index-page">
    <header class="index-nav">
      <RouterLink to="/" class="index-brand" aria-label="WLPRO HRM">
        <span class="brand-symbol">WL</span>
        <span>
          <strong>WLPRO HRM</strong>
          <small>Human Resource Platform</small>
        </span>
      </RouterLink>

      <nav class="nav-links" aria-label="Điều hướng trang giới thiệu">
        <a href="#overview">Tổng quan</a>
        <a href="#features">Tính năng</a>
        <a href="#workflow">Quy trình</a>
        <a href="#services">Dịch vụ</a>
      </nav>

      <div class="nav-actions">
        <RouterLink to="/login" class="btn btn-light">Đăng nhập</RouterLink>
        <RouterLink :to="entryPath" class="btn btn-primary">
          {{ entryLabel }}
        </RouterLink>
      </div>
    </header>

    <section id="overview" class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Nền tảng quản lý nhân sự & chấm công</p>
        <h1>Quản lý nhân sự rõ ràng, chấm công chính xác, vận hành gọn hơn.</h1>
        <p class="hero-description">
          WLPRO HRM kết nối hồ sơ nhân viên, phòng ban, chấm công, nghỉ phép, bảng lương và báo cáo
          trong một giao diện sáng, dễ dùng, phù hợp cho mô hình quản trị doanh nghiệp hiện đại.
        </p>

        <div class="hero-actions">
          <RouterLink :to="entryPath" class="btn btn-primary btn-large">
            {{ entryLabel }}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </RouterLink>
          <a href="#features" class="btn btn-outline btn-large">Xem tính năng</a>
        </div>

        <div class="hero-metrics" aria-label="Chỉ số nổi bật">
          <article>
            <strong>06</strong>
            <span>Phân hệ trọng tâm</span>
          </article>
          <article>
            <strong>03</strong>
            <span>Vai trò sử dụng</span>
          </article>
          <article>
            <strong>1</strong>
            <span>Luồng dữ liệu thống nhất</span>
          </article>
        </div>
      </div>

      <div class="hero-preview" aria-label="Mô phỏng giao diện hệ thống">
        <div class="preview-window">
          <div class="window-top">
            <span></span><span></span><span></span>
            <strong>Dashboard tổng quan</strong>
          </div>

          <div class="preview-layout">
            <aside class="preview-sidebar">
              <div class="preview-logo"></div>
              <span class="side-active"></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </aside>

            <div class="preview-content">
              <div class="preview-title-row">
                <div>
                  <small>HRM Integrated</small>
                  <h3>Tổng quan hôm nay</h3>
                </div>
                <div class="preview-user">AD</div>
              </div>

              <div class="preview-kpis">
                <article>
                  <small>Nhân viên</small>
                  <strong>128</strong>
                  <span>Tăng trưởng ổn định</span>
                </article>
                <article>
                  <small>Đi làm</small>
                  <strong>116</strong>
                  <span>90.6% hiện diện</span>
                </article>
                <article>
                  <small>Nghỉ phép</small>
                  <strong>07</strong>
                  <span>Chờ duyệt 02 đơn</span>
                </article>
              </div>

              <div class="preview-main-grid">
                <section class="chart-card">
                  <div class="chart-head">
                    <strong>Chấm công tuần</strong>
                    <small>7 ngày</small>
                  </div>
                  <div class="bar-chart">
                    <span style="height: 44%"></span>
                    <span style="height: 66%"></span>
                    <span style="height: 52%"></span>
                    <span style="height: 78%"></span>
                    <span style="height: 61%"></span>
                    <span style="height: 84%"></span>
                    <span style="height: 70%"></span>
                  </div>
                </section>

                <section class="status-card">
                  <strong>Trạng thái vận hành</strong>
                  <p><span class="dot success"></span>HR Core đang đồng bộ</p>
                  <p><span class="dot primary"></span>Attendance hoạt động</p>
                  <p><span class="dot warning"></span>Payroll chờ tổng hợp</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="section-block">
      <div class="section-heading">
        <p class="eyebrow">Tính năng chính</p>
        <h2>Tập trung đúng nghiệp vụ nhân sự cần dùng hằng ngày</h2>
      </div>

      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon" v-html="feature.icon"></div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section id="workflow" class="workflow-section">
      <div class="workflow-copy">
        <p class="eyebrow">Quy trình vận hành</p>
        <h2>Từ dữ liệu nhân viên đến bảng lương, mọi bước đều có kiểm soát.</h2>
        <p>
          Hệ thống được tổ chức theo luồng thực tế: tạo hồ sơ, ghi nhận công, xử lý nghỉ phép,
          tổng hợp lương và xuất báo cáo phục vụ quản trị.
        </p>
      </div>

      <div class="workflow-steps">
        <article v-for="(step, index) in workflow" :key="step.title">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="services" class="service-section">
      <div class="section-heading compact">
        <p class="eyebrow">Kiến trúc hệ thống</p>
        <h2>Phân tách module rõ ràng, dễ mở rộng</h2>
      </div>

      <div class="service-grid">
        <article>
          <strong>HR Core</strong>
          <span>Nhân viên · Phòng ban · Vai trò</span>
        </article>
        <article>
          <strong>Attendance</strong>
          <span>Chấm công · Lịch làm · Nghỉ phép</span>
        </article>
        <article>
          <strong>Payroll</strong>
          <span>Bảng lương · Phụ cấp · Tổng hợp</span>
        </article>
        <article>
          <strong>Reports</strong>
          <span>Thống kê · Biểu đồ · Xuất dữ liệu</span>
        </article>
      </div>
    </section>

    <footer class="index-footer">
      <div>
        <strong>WLPRO HRM</strong>
        <span>Giải pháp quản lý nhân sự và chấm công cho doanh nghiệp.</span>
      </div>
      <RouterLink to="/login" class="footer-link">Truy cập hệ thống</RouterLink>
    </footer>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { isAuthenticated } from '../services/auth'

const isLoggedIn = computed(() => isAuthenticated())
const entryPath = computed(() => (isLoggedIn.value ? '/dashboard' : '/login'))
const entryLabel = computed(() => (isLoggedIn.value ? 'Vào Dashboard' : 'Bắt đầu sử dụng'))

const features = [
  {
    title: 'Hồ sơ nhân viên',
    description: 'Quản lý mã nhân viên, thông tin cá nhân, phòng ban, chức vụ và trạng thái làm việc trong một nơi.',
    icon: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  },
  {
    title: 'Chấm công & lịch làm',
    description: 'Theo dõi giờ vào ra, ca làm, trạng thái đi muộn, vắng mặt và lịch sử chấm công rõ ràng.',
    icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 15l2 2 4-5"/></svg>',
  },
  {
    title: 'Nghỉ phép minh bạch',
    description: 'Nhân viên gửi đơn, HR/Admin xét duyệt, lưu lịch sử và đồng bộ vào dữ liệu công.',
    icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  },
  {
    title: 'Bảng lương',
    description: 'Tổng hợp ngày công, phụ cấp, khấu trừ và xuất thông tin lương theo từng nhân viên.',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  },
  {
    title: 'Báo cáo trực quan',
    description: 'Tổng hợp dữ liệu nhân sự, chấm công và lương thành các biểu đồ dễ quan sát.',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h17"/><rect x="7" y="11" width="3" height="5"/><rect x="12" y="7" width="3" height="9"/><rect x="17" y="9" width="3" height="7"/></svg>',
  },
  {
    title: 'Phân quyền rõ ràng',
    description: 'Tách quyền Admin, HR và Employee để mỗi người chỉ thao tác đúng phần việc của mình.',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-5"/></svg>',
  },
]

const workflow = [
  { title: 'Thiết lập nhân sự', description: 'Tạo phòng ban, thêm nhân viên và phân quyền theo vai trò.' },
  { title: 'Ghi nhận công', description: 'Nhân viên chấm công, hệ thống lưu trạng thái theo ngày và ca.' },
  { title: 'Xử lý nghỉ phép', description: 'Đơn nghỉ phép được gửi, xét duyệt và phản ánh vào dữ liệu công.' },
  { title: 'Tổng hợp lương', description: 'Dữ liệu công được dùng để tính lương, phụ cấp và khấu trừ.' },
]
</script>

<style scoped>
.index-page {
  --index-bg: #f5f8fd;
  --index-panel: rgba(255, 255, 255, 0.88);
  --index-panel-solid: #ffffff;
  --index-text: #0f172a;
  --index-muted: #64748b;
  --index-line: #dde7f3;
  --index-primary: #2563eb;
  --index-primary-dark: #1d4ed8;
  --index-primary-soft: #eaf2ff;
  --index-green: #10b981;
  --index-warning: #f59e0b;

  min-height: 100vh;
  color: var(--index-text);
  background:
    radial-gradient(circle at 12% 8%, rgba(37, 99, 235, 0.16), transparent 28%),
    radial-gradient(circle at 92% 14%, rgba(14, 165, 233, 0.14), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, var(--index-bg) 42%, #edf4ff 100%);
  font-family: Inter, 'Be Vietnam Pro', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

.index-nav,
.hero-section,
.section-block,
.workflow-section,
.service-section,
.index-footer {
  width: min(1180px, calc(100% - 48px));
  margin-inline: auto;
}

.index-nav {
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.index-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--index-text);
}

.brand-symbol {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--index-primary), #0f172a);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.24);
}

.index-brand strong,
.index-brand small {
  display: block;
}

.index-brand strong {
  font-size: 15px;
  letter-spacing: -0.02em;
}

.index-brand small {
  margin-top: 2px;
  color: var(--index-muted);
  font-size: 11px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 26px;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
}

.nav-links a {
  position: relative;
  text-decoration: none;
  color: inherit;
}

.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -9px;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  border-radius: 99px;
  background: var(--index-primary);
  transition: transform 0.18s ease;
}

.nav-links a:hover {
  color: var(--index-primary);
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

.nav-actions,
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  padding: 0 18px;
  border: 1px solid transparent;
  text-decoration: none;
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--index-primary), var(--index-primary-dark));
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.28);
}

.btn-light,
.btn-outline {
  color: #1e293b;
  background: rgba(255, 255, 255, 0.72);
  border-color: var(--index-line);
}

.btn-outline {
  background: transparent;
}

.btn-large {
  min-height: 52px;
  padding-inline: 22px;
  border-radius: 14px;
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hero-section {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 54px;
  align-items: center;
  min-height: calc(100vh - 84px);
  padding: 54px 0 76px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--index-primary);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1,
.section-heading h2,
.workflow-copy h2 {
  margin: 0;
  letter-spacing: -0.055em;
  color: #0b1220;
}

.hero-copy h1 {
  max-width: 670px;
  font-size: clamp(42px, 5vw, 70px);
  line-height: 1.03;
}

.hero-description {
  max-width: 640px;
  margin: 24px 0 30px;
  color: #475569;
  font-size: 17px;
  line-height: 1.75;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
  max-width: 640px;
}

.hero-metrics article {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--index-line);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.055);
}

.hero-metrics strong,
.hero-metrics span {
  display: block;
}

.hero-metrics strong {
  font-size: 30px;
  letter-spacing: -0.06em;
}

.hero-metrics span {
  margin-top: 4px;
  color: var(--index-muted);
  font-size: 12px;
  font-weight: 800;
}

.hero-preview {
  position: relative;
}

.hero-preview::before {
  content: '';
  position: absolute;
  inset: 12% -8% auto auto;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.16);
  filter: blur(30px);
}

.preview-window {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    0 40px 110px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(22px);
}

.window-top {
  height: 52px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 18px;
  border-bottom: 1px solid var(--index-line);
  background: rgba(248, 250, 252, 0.8);
}

.window-top span {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: #cbd5e1;
}

.window-top strong {
  margin-left: 10px;
  color: #334155;
  font-size: 13px;
}

.preview-layout {
  min-height: 500px;
  display: grid;
  grid-template-columns: 86px 1fr;
}

.preview-sidebar {
  padding: 20px 16px;
  display: grid;
  align-content: start;
  gap: 14px;
  border-right: 1px solid var(--index-line);
  background: #f8fafc;
}

.preview-logo {
  width: 38px;
  height: 38px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--index-primary), #0f172a);
}

.preview-sidebar span {
  width: 100%;
  height: 34px;
  border-radius: 11px;
  background: #e2e8f0;
}

.preview-sidebar .side-active {
  background: var(--index-primary-soft);
  border: 1px solid #bfd6ff;
}

.preview-content {
  padding: 24px;
}

.preview-title-row,
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preview-title-row small,
.preview-kpis small,
.chart-head small {
  color: var(--index-muted);
  font-size: 12px;
  font-weight: 800;
}

.preview-title-row h3 {
  margin: 5px 0 0;
  font-size: 23px;
  letter-spacing: -0.04em;
}

.preview-user {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 950;
  background: #0f172a;
}

.preview-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 0 14px;
}

.preview-kpis article,
.chart-card,
.status-card {
  border-radius: 20px;
  background: #fff;
  border: 1px solid var(--index-line);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.065);
}

.preview-kpis article {
  padding: 16px;
}

.preview-kpis strong,
.preview-kpis span {
  display: block;
}

.preview-kpis strong {
  margin-top: 8px;
  font-size: 30px;
  letter-spacing: -0.06em;
}

.preview-kpis span {
  margin-top: 6px;
  color: var(--index-muted);
  font-size: 12px;
  font-weight: 750;
}

.preview-main-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 14px;
}

.chart-card,
.status-card {
  padding: 18px;
  min-height: 214px;
}

.bar-chart {
  height: 150px;
  display: flex;
  align-items: end;
  gap: 12px;
  padding-top: 28px;
}

.bar-chart span {
  flex: 1;
  min-width: 18px;
  border-radius: 12px 12px 4px 4px;
  background: linear-gradient(180deg, #60a5fa, #2563eb);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
}

.status-card strong {
  display: block;
  margin-bottom: 20px;
}

.status-card p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0;
  color: #475569;
  font-size: 13px;
  font-weight: 850;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.dot.success { background: var(--index-green); }
.dot.primary { background: var(--index-primary); }
.dot.warning { background: var(--index-warning); }

.section-block,
.workflow-section,
.service-section {
  padding: 82px 0;
}

.section-heading {
  max-width: 760px;
  margin-bottom: 30px;
}

.section-heading.compact {
  margin-bottom: 24px;
}

.section-heading h2,
.workflow-copy h2 {
  font-size: clamp(32px, 3.6vw, 46px);
  line-height: 1.08;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 24px;
  min-height: 230px;
  border-radius: 22px;
  background: var(--index-panel);
  border: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.07);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 70px rgba(15, 23, 42, 0.1);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: var(--index-primary);
  background: var(--index-primary-soft);
  border: 1px solid #cfe0ff;
}

.feature-icon :deep(svg) {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.feature-card h3 {
  margin: 22px 0 10px;
  font-size: 19px;
  letter-spacing: -0.03em;
}

.feature-card p,
.workflow-copy p,
.workflow-steps p,
.index-footer span {
  margin: 0;
  color: var(--index-muted);
  line-height: 1.65;
}

.workflow-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 40px;
  align-items: start;
}

.workflow-copy p {
  margin-top: 18px;
  max-width: 520px;
}

.workflow-steps {
  display: grid;
  gap: 14px;
}

.workflow-steps article {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 16px;
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--index-line);
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.06);
}

.workflow-steps article > span {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 950;
  background: #0f172a;
}

.workflow-steps h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.service-section {
  padding-top: 54px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.service-grid article {
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, #fff, #f8fbff);
  border: 1px solid var(--index-line);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
}

.service-grid strong,
.service-grid span {
  display: block;
}

.service-grid strong {
  font-size: 18px;
}

.service-grid span {
  margin-top: 8px;
  color: var(--index-muted);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 750;
}

.index-footer {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 0 42px;
  border-top: 1px solid var(--index-line);
}

.index-footer strong,
.index-footer span {
  display: block;
}

.index-footer strong {
  margin-bottom: 5px;
}

.footer-link {
  color: var(--index-primary);
  font-weight: 950;
  text-decoration: none;
}

@media (max-width: 1100px) {
  .nav-links {
    display: none;
  }

  .hero-section,
  .workflow-section {
    grid-template-columns: 1fr;
  }

  .hero-section {
    min-height: auto;
    padding-top: 40px;
  }
}

@media (max-width: 820px) {
  .index-nav,
  .hero-section,
  .section-block,
  .workflow-section,
  .service-section,
  .index-footer {
    width: min(100% - 28px, 1180px);
  }

  .index-nav {
    height: auto;
    padding: 16px 0;
    align-items: flex-start;
  }

  .nav-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-copy h1 {
    font-size: 40px;
  }

  .hero-actions,
  .hero-metrics,
  .preview-kpis,
  .preview-main-grid,
  .feature-grid,
  .service-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    display: grid;
  }

  .preview-layout {
    grid-template-columns: 1fr;
  }

  .preview-sidebar {
    display: none;
  }

  .index-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .index-brand small,
  .btn-light {
    display: none;
  }

  .hero-copy h1 {
    font-size: 34px;
  }

  .preview-content {
    padding: 16px;
  }

  .window-top strong {
    display: none;
  }
}
</style>
