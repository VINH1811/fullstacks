<template>
  <main class="home-page">
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>

    <section class="glass-shell">
      <nav class="navbar">
        <div class="brand">
          <div class="brand-icon">HR</div>
          <div>
            <h2>HRM Pro</h2>
            <p>Human Resource Management</p>
          </div>
        </div>

        <div class="nav-links">
          <a href="#home" class="active">Trang chủ</a>
          <a href="#features">Tính năng</a>
          <a href="#pricing">Bảng giá</a>
          <a href="#about">Về chúng tôi</a>
          <a href="#contact">Liên hệ</a>
        </div>

        <div class="nav-actions">
          <button class="btn ghost">Đăng nhập</button>
          <RouterLink to="/payroll" class="btn primary">
            Dùng thử miễn phí
          </RouterLink>
        </div>
      </nav>

      <section id="home" class="hero">
        <div class="hero-left">
          <div class="badge">
            <span></span>
            Giải pháp toàn diện cho doanh nghiệp hiện đại
          </div>

          <h1>
            Quản lý nhân sự<br />
            Thông minh,
            <span>Hiệu quả</span>
          </h1>

          <p class="hero-desc">
            HRM Pro giúp doanh nghiệp quản lý nhân sự, chấm công, ca làm,
            nghỉ phép và báo cáo một cách nhanh chóng, chính xác và hiện đại.
          </p>

          <div class="hero-buttons">
            <RouterLink to="/payroll" class="btn hero-btn">
              🚀 Bắt đầu quản lý ngay
            </RouterLink>
            <button class="btn demo-btn">👁 Xem Demo</button>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <strong>250+</strong>
              <span>Nhân viên</span>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏢</div>
              <strong>25+</strong>
              <span>Phòng ban</span>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🗓</div>
              <strong>98.5%</strong>
              <span>Chấm công chính xác</span>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <strong>100+</strong>
              <span>Báo cáo đa dạng</span>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="dashboard-preview">
            <aside class="sidebar">
              <div class="menu-line"></div>
              <div class="menu-item active">🏠 Tổng quan</div>
              <div class="menu-item">👥 Nhân viên</div>
              <div class="menu-item">⏱ Chấm công</div>
              <div class="menu-item">🗓 Ca làm việc</div>
              <div class="menu-item">🏖 Nghỉ phép</div>
              <div class="menu-item">💰 Lương thưởng</div>
              <div class="menu-item">📊 Báo cáo</div>
              <div class="menu-item">⚙ Cài đặt</div>
            </aside>

            <div class="dashboard-main">
              <div class="dash-header">
                <h3>☰ Dashboard</h3>
                <div class="search">🔍 Tìm kiếm...</div>
                <div class="avatar">👩🏻</div>
              </div>

              <div class="kpi-grid">
                <div class="kpi-card">
                  <small>Tổng nhân viên</small>
                  <strong>256</strong>
                  <span class="green">+12% so với tháng trước</span>
                  <div class="bubble">👥</div>
                </div>

                <div class="kpi-card">
                  <small>Đi làm hôm nay</small>
                  <strong>220</strong>
                  <span class="green">86% tổng nhân viên</span>
                  <div class="bubble green-bg">✅</div>
                </div>

                <div class="kpi-card">
                  <small>Đi muộn</small>
                  <strong>8</strong>
                  <span class="red">3% tổng nhân viên</span>
                  <div class="bubble orange-bg">⏰</div>
                </div>

                <div class="kpi-card">
                  <small>Nghỉ phép</small>
                  <strong>12</strong>
                  <span class="purple">5% tổng nhân viên</span>
                  <div class="bubble purple-bg">🏖</div>
                </div>
              </div>

              <div class="dash-content">
                <div class="chart-card">
                  <div class="card-title">
                    <h4>Tình hình chấm công (7 ngày gần nhất)</h4>
                    <span>7 ngày</span>
                  </div>

                  <div class="line-chart">
                    <svg viewBox="0 0 500 180" preserveAspectRatio="none">
                      <path
                        d="M10,120 C60,90 80,60 130,75 C180,95 200,120 250,75 C300,30 320,150 370,110 C420,70 450,100 490,45"
                        fill="none"
                        stroke="#4361ee"
                        stroke-width="5"
                        stroke-linecap="round"
                      />
                      <path
                        d="M10,120 C60,90 80,60 130,75 C180,95 200,120 250,75 C300,30 320,150 370,110 C420,70 450,100 490,45 L490,180 L10,180 Z"
                        fill="url(#grad)"
                        opacity="0.45"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#4361ee" />
                          <stop offset="100%" stop-color="#ffffff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div class="donut-card">
                  <h4>Phân bổ nhân sự</h4>
                  <div class="donut">
                    <div>
                      <strong>256</strong>
                      <span>Tổng</span>
                    </div>
                  </div>
                  <ul>
                    <li><span></span>Kinh doanh 35%</li>
                    <li><span></span>Kỹ thuật 30%</li>
                    <li><span></span>Nhân sự 15%</li>
                    <li><span></span>Kế toán 10%</li>
                  </ul>
                </div>
              </div>

              <div class="employee-row">
                <div class="mini-list">
                  <h4>Nhân viên đi muộn hôm nay</h4>
                  <p>👨🏻 Nguyễn Văn An <span>Đi muộn 15 phút</span></p>
                  <p>👩🏻 Trần Thị Mai <span>Đi muộn 20 phút</span></p>
                  <p>👨🏻 Lê Hoàng Nam <span>Đi muộn 10 phút</span></p>
                </div>

                <div class="mini-list">
                  <h4>Nghỉ phép hôm nay</h4>
                  <p>👩🏻 Phạm Thị Lan <span class="blue">Nghỉ phép năm</span></p>
                  <p>👨🏻 Đỗ Minh Quân <span class="blue">Nghỉ phép năm</span></p>
                  <p>👩🏻 Nguyễn Thị Hằng <span class="blue">Nghỉ phép ốm</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="feature-section">
        <div class="feature-card">
          <div class="feature-icon">👤</div>
          <h3>Quản lý nhân sự</h3>
          <p>Lưu trữ hồ sơ, thông tin nhân viên khoa học, bảo mật và dễ dàng tra cứu.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon green-icon">🕒</div>
          <h3>Chấm công thông minh</h3>
          <p>Chấm công nhanh chóng, chính xác qua nhiều hình thức: máy chấm công, app, GPS, QR Code.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon purple-icon">🗓</div>
          <h3>Quản lý ca làm việc</h3>
          <p>Tạo và quản lý ca làm linh hoạt, tự động tính công và hỗ trợ đổi ca dễ dàng.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon orange-icon">💼</div>
          <h3>Nghỉ phép & OT</h3>
          <p>Đăng ký, duyệt nghỉ phép và làm thêm giờ nhanh chóng, minh bạch và tự động.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon blue-icon">📈</div>
          <h3>Báo cáo trực quan</h3>
          <p>Hệ thống báo cáo đa dạng, trực quan, hỗ trợ ra quyết định nhanh chóng và chính xác.</p>
        </div>
      </section>

      <section class="trusted">
        <p>Được tin dùng bởi các doanh nghiệp</p>
        <div class="logos">
          <span>Vietcombank</span>
          <span>FPT Software</span>
          <span>VINAMILK</span>
          <span>thegioididong</span>
          <span>VNPT</span>
          <span>BIDV</span>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  padding: 26px;
  color: #101828;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 12% 18%, rgba(95, 169, 255, 0.48), transparent 34%),
    radial-gradient(circle at 88% 20%, rgba(170, 91, 255, 0.42), transparent 33%),
    radial-gradient(circle at 50% 95%, rgba(79, 209, 197, 0.22), transparent 42%),
    linear-gradient(135deg, #eaf4ff 0%, #f6f2ff 50%, #edf7ff 100%);
  background-size:
    90px 90px,
    90px 90px,
    auto,
    auto,
    auto,
    auto;
  overflow-x: hidden;
  position: relative;
}

.aurora {
  position: fixed;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.55;
  pointer-events: none;
  animation: floatGlow 8s ease-in-out infinite alternate;
}

.aurora-1 {
  width: 380px;
  height: 380px;
  background: #5b8cff;
  left: -90px;
  bottom: 80px;
}

.aurora-2 {
  width: 340px;
  height: 340px;
  background: #a855f7;
  right: -70px;
  top: 140px;
  animation-delay: 1.2s;
}

.aurora-3 {
  width: 260px;
  height: 260px;
  background: #2dd4bf;
  left: 45%;
  top: 35%;
  animation-delay: 2s;
}

.glass-shell {
  position: relative;
  z-index: 1;
  max-width: 1780px;
  margin: 0 auto;
  min-height: calc(100vh - 52px);
  border-radius: 34px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  box-shadow:
    0 30px 100px rgba(60, 76, 130, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.navbar {
  height: 96px;
  padding: 0 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.42);
  border-bottom: 1px solid rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(28px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 900;
  font-size: 20px;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  box-shadow: 0 18px 35px rgba(78, 99, 255, 0.32);
}

.brand h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.brand p {
  margin: 2px 0 0;
  color: #53637a;
  font-size: 14px;
}

.nav-links {
  display: flex;
  gap: 44px;
}

.nav-links a {
  color: #101828;
  text-decoration: none;
  font-weight: 700;
  position: relative;
}

.nav-links a.active {
  color: #2563eb;
}

.nav-links a.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -18px;
  height: 3px;
  border-radius: 10px;
  background: #2563eb;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.btn {
  border: none;
  text-decoration: none;
  cursor: pointer;
  font-weight: 800;
  border-radius: 999px;
  transition: 0.28s ease;
}

.btn:hover {
  transform: translateY(-4px);
}

.ghost {
  padding: 16px 28px;
  color: #111827;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
}

.primary,
.hero-btn {
  color: white;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  box-shadow: 0 18px 40px rgba(76, 81, 255, 0.32);
}

.primary {
  padding: 16px 30px;
}

.hero {
  display: grid;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 40px;
  padding: 66px 58px 32px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  border-radius: 999px;
  color: #53637a;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.68);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.85);
}

.badge span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #facc15, #f97316);
}

.hero h1 {
  margin: 42px 0 24px;
  max-width: 660px;
  font-size: clamp(54px, 5.2vw, 86px);
  line-height: 1.08;
  letter-spacing: -3.6px;
  font-weight: 950;
}

.hero h1 span {
  background: linear-gradient(135deg, #2563eb, #9333ea);
  -webkit-background-clip: text;
  color: transparent;
}

.hero-desc {
  max-width: 680px;
  font-size: 22px;
  line-height: 1.8;
  color: #475569;
  margin-bottom: 36px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 58px;
}

.hero-btn,
.demo-btn {
  padding: 18px 30px;
  font-size: 16px;
}

.demo-btn {
  color: #182235;
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 38px rgba(100, 116, 139, 0.12);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  max-width: 670px;
}

.stat-card {
  min-height: 92px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(24px);
}

.stat-card:first-child {
  border-radius: 22px 0 0 22px;
}

.stat-card:last-child {
  border-radius: 0 22px 22px 0;
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #93c5fd, #8b5cf6);
}

.stat-card strong {
  display: block;
  font-size: 24px;
  color: #0f172a;
}

.stat-card span {
  display: block;
  font-size: 12px;
  color: #475569;
}

.hero-right {
  perspective: 1600px;
}

.dashboard-preview {
  min-height: 650px;
  padding: 14px;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 28px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(36px);
  box-shadow:
    0 36px 100px rgba(75, 85, 150, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  transform: rotateY(-5deg) rotateX(2deg);
  animation: dashboardFloat 5s ease-in-out infinite alternate;
}

.sidebar {
  padding: 36px 18px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.36);
  border: 1px solid rgba(255, 255, 255, 0.58);
}

.menu-line {
  width: 18px;
  height: 12px;
  margin-bottom: 26px;
  border-top: 3px solid #64748b;
  border-bottom: 3px solid #64748b;
}

.menu-item {
  padding: 14px 12px;
  border-radius: 14px;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}

.menu-item.active {
  color: #2563eb;
  background: rgba(99, 102, 241, 0.12);
}

.dashboard-main {
  padding: 18px 14px 14px 0;
}

.dash-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.dash-header h3 {
  margin: 0;
  flex: 1;
  font-size: 20px;
}

.search {
  width: 210px;
  padding: 12px 20px;
  border-radius: 999px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.52);
}

.avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: white;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.kpi-card,
.chart-card,
.donut-card,
.mini-list,
.feature-card {
  background: rgba(255, 255, 255, 0.44);
  border: 1px solid rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(28px);
  box-shadow:
    0 18px 50px rgba(71, 85, 105, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.kpi-card {
  position: relative;
  min-height: 108px;
  padding: 20px;
  border-radius: 18px;
}

.kpi-card small {
  color: #475569;
  font-weight: 800;
}

.kpi-card strong {
  display: block;
  margin-top: 10px;
  font-size: 30px;
}

.kpi-card span {
  font-size: 12px;
  font-weight: 800;
}

.green {
  color: #16a34a;
}

.red {
  color: #ef4444;
}

.purple {
  color: #7c3aed;
}

.bubble {
  position: absolute;
  right: 18px;
  top: 22px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.16);
}

.green-bg {
  background: rgba(34, 197, 94, 0.18);
}

.orange-bg {
  background: rgba(249, 115, 22, 0.18);
}

.purple-bg {
  background: rgba(147, 51, 234, 0.16);
}

.dash-content {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.chart-card,
.donut-card {
  min-height: 230px;
  padding: 22px;
  border-radius: 20px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title h4,
.donut-card h4,
.mini-list h4 {
  margin: 0;
  font-size: 15px;
}

.card-title span {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.line-chart {
  height: 170px;
  margin-top: 16px;
}

.line-chart svg {
  width: 100%;
  height: 100%;
}

.donut {
  width: 128px;
  height: 128px;
  margin: 18px auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(#2563eb 0 35%, #38bdf8 35% 65%, #8b5cf6 65% 82%, #f472b6 82% 100%);
  position: relative;
}

.donut::after {
  content: "";
  position: absolute;
  inset: 25px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.84);
}

.donut div {
  position: relative;
  z-index: 1;
  text-align: center;
}

.donut strong {
  display: block;
  font-size: 24px;
}

.donut span {
  color: #64748b;
  font-size: 12px;
}

.donut-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.donut-card li {
  font-size: 12px;
  color: #475569;
  margin: 8px 0;
  font-weight: 700;
}

.employee-row {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.mini-list {
  padding: 20px;
  border-radius: 20px;
}

.mini-list p {
  display: flex;
  justify-content: space-between;
  margin: 14px 0 0;
  font-size: 13px;
  color: #334155;
  font-weight: 800;
}

.mini-list span {
  color: #ef4444;
  font-weight: 800;
}

.mini-list .blue {
  color: #2563eb;
}

.feature-section {
  padding: 28px 32px 10px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
}

.feature-card {
  min-height: 250px;
  padding: 32px 28px;
  border-radius: 26px;
  transition: 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #6366f1);
  margin-bottom: 28px;
}

.green-icon {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.purple-icon {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
}

.orange-icon {
  background: linear-gradient(135deg, #fdba74, #fb923c);
}

.blue-icon {
  background: linear-gradient(135deg, #818cf8, #4f46e5);
}

.feature-card h3 {
  margin: 0 0 14px;
  font-size: 21px;
}

.feature-card p {
  margin: 0;
  color: #475569;
  line-height: 1.65;
}

.trusted {
  padding: 22px 40px 34px;
  text-align: center;
}

.trusted p {
  color: #64748b;
  font-weight: 700;
}

.logos {
  display: flex;
  justify-content: center;
  gap: 70px;
  flex-wrap: wrap;
  color: rgba(30, 41, 59, 0.42);
  font-weight: 950;
  font-size: 20px;
}

@keyframes dashboardFloat {
  from {
    transform: rotateY(-5deg) rotateX(2deg) translateY(0);
  }
  to {
    transform: rotateY(-3deg) rotateX(1deg) translateY(-14px);
  }
}

@keyframes floatGlow {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(30px, -30px, 0) scale(1.12);
  }
}

@media (max-width: 1300px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .dashboard-preview {
    transform: none;
  }

  .feature-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 850px) {
  .home-page {
    padding: 10px;
  }

  .navbar {
    height: auto;
    padding: 20px;
    flex-direction: column;
    gap: 20px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 18px;
  }

  .hero {
    padding: 34px 20px;
  }

  .hero h1 {
    font-size: 48px;
  }

  .stats,
  .kpi-grid,
  .dash-content,
  .employee-row,
  .feature-section {
    grid-template-columns: 1fr;
  }

  .stat-card,
  .stat-card:first-child,
  .stat-card:last-child {
    border-radius: 22px;
  }

  .dashboard-preview {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>
