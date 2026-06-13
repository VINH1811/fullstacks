<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/* =========================================================
 * DỮ LIỆU GIAO DIỆN
 * ======================================================= */
const starCanvas = ref(null)
const orbVideoFailed = ref(false)
const mobileMenuOpen = ref(false)
const demoOpen = ref(false)

const orbSrc = 'https://future.co/images/homepage/glassy-orb/orb-purple.webm'

const navLinks = [
  { label: 'Trang chủ', target: 'home' },
  { label: 'Tính năng', target: 'features' },
  { label: 'Công ty', target: 'company' },
  { label: 'Bảng giá', target: 'pricing' },
]

const features = [
  {
    icon: 'i-users',
    title: 'Hồ sơ nhân sự',
    description: 'Quản lý tập trung hồ sơ, phòng ban, chức vụ và quá trình công tác của nhân viên.',
  },
  {
    icon: 'i-clock',
    title: 'Chấm công thông minh',
    description: 'Theo dõi thời gian làm việc, ca làm, nghỉ phép và dữ liệu chấm công theo thời gian thực.',
  },
  {
    icon: 'i-wallet',
    title: 'Tính lương chính xác',
    description: 'Tự động tổng hợp công, tăng ca, phụ cấp, thưởng và khấu trừ trong một quy trình thống nhất.',
  },
]

const trustedLogos = [
  { icon: 'i-globe', name: 'Nhân Việt' },
  { icon: 'i-bolt', name: 'TechViet' },
  { icon: 'i-shield', name: 'An Phát' },
  { icon: 'i-layers', name: 'Minh Long' },
  { icon: 'i-users', name: 'Hải Đăng' },
]

const pricingPlans = [
  {
    name: 'Khởi đầu',
    description: 'Phù hợp với doanh nghiệp đang chuẩn hóa quy trình nhân sự.',
    features: ['Hồ sơ nhân viên', 'Chấm công và nghỉ phép', 'Báo cáo cơ bản'],
  },
  {
    name: 'Doanh nghiệp',
    description: 'Bộ công cụ đầy đủ cho tổ chức đang mở rộng quy mô.',
    features: ['Đầy đủ tính năng HRM', 'Tính lương tự động', 'Phân quyền theo vai trò'],
    featured: true,
  },
  {
    name: 'Tùy chỉnh',
    description: 'Giải pháp tích hợp dành cho mô hình vận hành phức tạp.',
    features: ['Tích hợp API', 'Quy trình tùy chỉnh', 'Hỗ trợ triển khai riêng'],
  },
]

/* =========================================================
 * ĐIỀU HƯỚNG VÀ TƯƠNG TÁC
 * ======================================================= */
function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId)
  if (!target) return

  mobileMenuOpen.value = false

  const top = target.getBoundingClientRect().top + window.scrollY - 105
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

function openDemo() {
  demoOpen.value = true
  document.documentElement.style.overflow = 'hidden'
  nextTick(() => document.querySelector('.demo-close')?.focus())
}

function closeDemo() {
  demoOpen.value = false
  document.documentElement.style.overflow = ''
}

function handleKeydown(event) {
  if (event.key === 'Escape' && demoOpen.value) closeDemo()
}

/* =========================================================
 * SCROLL REVEAL — GỘP TỪ composables/reveal.js
 * ======================================================= */
let revealObserver = null

function ensureRevealObserver() {
  if (revealObserver) return revealObserver

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )

  return revealObserver
}

const vReveal = {
  mounted(el) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      el.classList.add('in')
      return
    }
    ensureRevealObserver().observe(el)
  },
  unmounted(el) {
    revealObserver?.unobserve(el)
  },
}

/* =========================================================
 * STARFIELD — GỘP TỪ composables/useStarfield.js
 * ======================================================= */
let starContext = null
let starWidth = 0
let starHeight = 0
let stars = []
let starAnimationFrame = null
let scrollVelocity = 0
let lastScrollY = 0
let resizeHandler = null
let scrollHandler = null

function resizeStarCanvas() {
  const canvas = starCanvas.value
  if (!canvas || !starContext) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  starWidth = window.innerWidth
  starHeight = window.innerHeight

  canvas.width = starWidth * dpr
  canvas.height = starHeight * dpr
  canvas.style.width = `${starWidth}px`
  canvas.style.height = `${starHeight}px`
  starContext.setTransform(dpr, 0, 0, dpr, 0, 0)

  const count = Math.min(150, Math.floor((starWidth * starHeight) / 13000))
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * starWidth,
    y: Math.random() * starHeight,
    r: Math.random() * 1.3 + 0.3,
    base: Math.random() * 0.4 + 0.15,
    amp: Math.random() * 0.4 + 0.25,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.018 + 0.006,
    hue: Math.random() < 0.6 ? '0,132,255' : '96,177,255',
    drift: Math.random() * 0.28 + 0.08,
  }))
}

function drawStarfield(timestamp, continueAnimation = true) {
  if (!starContext) return

  starContext.clearRect(0, 0, starWidth, starHeight)
  scrollVelocity *= 0.92

  stars.forEach((star) => {
    star.y -= scrollVelocity * star.drift
    if (star.y < -5) star.y = starHeight + 5
    if (star.y > starHeight + 5) star.y = -5

    const twinkle = star.base + Math.sin(timestamp * star.speed + star.phase) * star.amp
    const alpha = Math.max(0, Math.min(1, twinkle))
    const glowRadius = star.r * (2.4 + Math.sin(timestamp * star.speed + star.phase) * 1.2)

    const gradient = starContext.createRadialGradient(
      star.x,
      star.y,
      0,
      star.x,
      star.y,
      glowRadius,
    )
    gradient.addColorStop(0, `rgba(${star.hue}, ${alpha * 0.7})`)
    gradient.addColorStop(1, `rgba(${star.hue}, 0)`)

    starContext.fillStyle = gradient
    starContext.beginPath()
    starContext.arc(star.x, star.y, glowRadius, 0, Math.PI * 2)
    starContext.fill()

    starContext.fillStyle = `rgba(${star.hue}, ${alpha})`
    starContext.beginPath()
    starContext.arc(star.x, star.y, star.r, 0, Math.PI * 2)
    starContext.fill()
  })

  if (continueAnimation) {
    starAnimationFrame = window.requestAnimationFrame((time) => drawStarfield(time, true))
  }
}

function initStarfield() {
  const canvas = starCanvas.value
  if (!canvas) return

  starContext = canvas.getContext('2d')
  if (!starContext) return

  resizeHandler = resizeStarCanvas
  resizeStarCanvas()
  window.addEventListener('resize', resizeHandler, { passive: true })

  lastScrollY = window.scrollY
  scrollHandler = () => {
    const currentScrollY = window.scrollY
    scrollVelocity += (currentScrollY - lastScrollY) * 0.5
    lastScrollY = currentScrollY
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) drawStarfield(0, false)
  else starAnimationFrame = window.requestAnimationFrame((time) => drawStarfield(time, true))
}

onMounted(() => {
  document.title = 'WLPRO — Làm chủ nhân sự, tăng tốc doanh nghiệp'
  window.addEventListener('keydown', handleKeydown)
  initStarfield()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (starAnimationFrame !== null) window.cancelAnimationFrame(starAnimationFrame)
  revealObserver?.disconnect()
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="wlpro-page">
    <!-- SVG sprite được gộp từ IconSprite.vue -->
    <svg width="0" height="0" class="icon-sprite" aria-hidden="true">
      <symbol id="i-layers" viewBox="0 0 24 24">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </symbol>
      <symbol id="i-arrow" viewBox="0 0 24 24">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </symbol>
      <symbol id="i-play" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
      </symbol>
      <symbol id="i-star" viewBox="0 0 24 24">
        <polygon points="12 2 15 9 22 9.3 16.5 13.8 18.5 21 12 16.8 5.5 21 7.5 13.8 2 9.3 9 9" />
      </symbol>
      <symbol id="i-users" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </symbol>
      <symbol id="i-user" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </symbol>
      <symbol id="i-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" />
      </symbol>
      <symbol id="i-calc" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="9" y1="6" x2="15" y2="6" />
        <line x1="15" y1="15" x2="15" y2="18" />
      </symbol>
      <symbol id="i-shield" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </symbol>
      <symbol id="i-doc" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </symbol>
      <symbol id="i-globe" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
      </symbol>
      <symbol id="i-bolt" viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </symbol>
      <symbol id="i-shield-lock" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9.5" y="11" width="5" height="4" rx="1" />
        <path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11" />
      </symbol>
      <symbol id="i-menu" viewBox="0 0 24 24">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
      </symbol>
    </svg>

    <!-- BackgroundFx.vue được gộp tại đây -->
    <div class="background-fx" aria-hidden="true">
      <span class="glow-ellipse ellipse-one"></span>
      <span class="glow-ellipse ellipse-two"></span>
      <span class="glow-ellipse ellipse-three"></span>
    </div>
    <canvas ref="starCanvas" class="star-canvas" aria-hidden="true"></canvas>

    <!-- TheNavbar.vue được gộp tại đây -->
    <header class="nav-wrap">
      <nav class="main-nav" aria-label="Điều hướng chính">
        <button class="nav-logo" type="button" @click="scrollToSection('home')">
          <span class="nav-logo-mark">
            <svg class="app-icon"><use href="#i-layers" /></svg>
          </span>
          WLPRO
        </button>

        <div class="nav-items" :class="{ open: mobileMenuOpen }">
          <button
            v-for="link in navLinks"
            :key="link.target"
            type="button"
            class="nav-link"
            @click="scrollToSection(link.target)"
          >
            {{ link.label }}
          </button>

          <a href="/register" class="nav-signup">
            Đăng ký
            <svg class="app-icon"><use href="#i-arrow" /></svg>
          </a>
        </div>

        <button
          type="button"
          class="mobile-menu-toggle"
          :aria-expanded="mobileMenuOpen"
          aria-label="Mở hoặc đóng menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="app-icon">
            <use :href="mobileMenuOpen ? '#i-close' : '#i-menu'" />
          </svg>
        </button>
      </nav>
    </header>

    <main class="page-content">
      <!-- HeroSection.vue được gộp tại đây -->
      <section id="home" class="hero-section">
        <div class="hero-grid">
          <div class="hero-left">
            <div class="rating-badge reveal in">
              <span class="rating-stars" aria-hidden="true">
                <svg v-for="number in 5" :key="number" class="app-icon rating-star">
                  <use href="#i-star" />
                </svg>
              </span>
              <span class="rating-text">
                Được <b>2.700+</b> doanh nghiệp đánh giá <b>4.9/5</b>
              </span>
            </div>

            <h1 class="hero-title reveal in d1">
              Làm chủ nhân sự,<br />
              <span class="accent-text">tăng tốc</span> doanh nghiệp
            </h1>

            <p class="hero-description reveal in d2">
              Quản lý hồ sơ nhân sự, chấm công và tính lương trên một nền tảng duy nhất.
              Dữ liệu thông suốt, minh bạch và chính xác — để đội ngũ của bạn tập trung
              vào con người thay vì bảng tính.
            </p>

            <div class="hero-actions reveal in d3">
              <a href="/register" class="primary-cta">
                Bắt đầu ngay
                <span class="cta-circle">
                  <svg class="app-icon"><use href="#i-arrow" /></svg>
                </span>
              </a>

              <button type="button" class="secondary-cta" @click="openDemo">
                <svg class="app-icon"><use href="#i-play" /></svg>
                Xem demo
              </button>
            </div>
          </div>

          <!-- GlassyOrb.vue được gộp tại đây -->
          <div class="hero-right reveal" v-reveal>
            <div class="orb-stage">
              <div class="orb-fallback"></div>
              <video
                v-show="!orbVideoFailed"
                class="orb-video"
                :src="orbSrc"
                autoplay
                loop
                muted
                playsinline
                preload="metadata"
                @error="orbVideoFailed = true"
              ></video>
            </div>
          </div>
        </div>
      </section>

      <!-- Tính năng: hoàn thiện chức năng điều hướng của navbar -->
      <section id="features" class="features-section">
        <div class="section-shell">
          <div class="section-heading reveal" v-reveal>
            <span class="section-label">Nền tảng hợp nhất</span>
            <h2>Ba nghiệp vụ cốt lõi trên cùng một hành trình dữ liệu.</h2>
            <p>
              WLPRO kết nối hồ sơ nhân sự, dữ liệu thời gian và bảng lương để giảm thao tác
              thủ công, hạn chế sai lệch và nâng cao trải nghiệm của toàn bộ tổ chức.
            </p>
          </div>

          <div class="feature-grid">
            <article
              v-for="(feature, index) in features"
              :key="feature.title"
              class="feature-card reveal"
              :class="`d${Math.min(index + 1, 4)}`"
              v-reveal
            >
              <span class="feature-icon">
                <svg class="app-icon"><use :href="`#${feature.icon}`" /></svg>
              </span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <button type="button" @click="openDemo">
                Xem chi tiết
                <svg class="app-icon"><use href="#i-arrow" /></svg>
              </button>
            </article>
          </div>
        </div>
      </section>

      <!-- TrustedLogos.vue được gộp và mở rộng thành phần công ty -->
      <section id="company" class="company-section">
        <div class="trusted reveal" v-reveal>
          <p>Được tin dùng bởi các công ty công nghệ hàng đầu</p>
          <div class="trusted-row">
            <div v-for="logo in trustedLogos" :key="logo.name" class="trusted-logo">
              <svg class="app-icon"><use :href="`#${logo.icon}`" /></svg>
              {{ logo.name }}
            </div>
          </div>
        </div>

        <div class="company-card reveal" v-reveal>
          <div>
            <span class="section-label light">Về WLPRO</span>
            <h2>Hạ tầng nhân sự đáng tin cậy cho doanh nghiệp hiện đại.</h2>
          </div>
          <p>
            Chúng tôi xây dựng sản phẩm dựa trên nhu cầu vận hành thực tế: dữ liệu phải
            thống nhất, quyền truy cập phải rõ ràng và mọi nghiệp vụ phải đủ đơn giản để
            nhân viên có thể chủ động sử dụng mỗi ngày.
          </p>
          <a href="/login" class="company-login">
            Cổng nhân sự
            <svg class="app-icon"><use href="#i-arrow" /></svg>
          </a>
        </div>
      </section>

      <!-- Bảng giá để liên kết navbar hoạt động đầy đủ -->
      <section id="pricing" class="pricing-section">
        <div class="section-shell">
          <div class="section-heading centered reveal" v-reveal>
            <span class="section-label">Gói triển khai</span>
            <h2>Lựa chọn phù hợp với từng giai đoạn phát triển.</h2>
            <p>
              Mỗi doanh nghiệp có một quy mô và quy trình khác nhau. WLPRO hỗ trợ triển khai
              từ mô hình cơ bản đến hệ sinh thái tích hợp chuyên sâu.
            </p>
          </div>

          <div class="pricing-grid">
            <article
              v-for="(plan, index) in pricingPlans"
              :key="plan.name"
              class="pricing-card reveal"
              :class="[{ featured: plan.featured }, `d${Math.min(index + 1, 4)}`]"
              v-reveal
            >
              <span v-if="plan.featured" class="popular-label">Phổ biến</span>
              <h3>{{ plan.name }}</h3>
              <p>{{ plan.description }}</p>
              <ul>
                <li v-for="item in plan.features" :key="item">
                  <svg class="app-icon"><use href="#i-check" /></svg>
                  {{ item }}
                </li>
              </ul>
              <a href="/register">Nhận tư vấn</a>
            </article>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <button type="button" class="footer-brand" @click="scrollToSection('home')">
        <span class="nav-logo-mark">
          <svg class="app-icon"><use href="#i-layers" /></svg>
        </span>
        WLPRO
      </button>
      <p>Hợp nhất quản trị nhân sự, chấm công và tính lương trên một nền tảng.</p>
      <div>
        <a href="/login">Đăng nhập</a>
        <a href="/register">Đăng ký</a>
      </div>
    </footer>

    <!-- Modal demo: giúp nút Xem demo hoạt động thực sự -->
    <Transition name="modal-fade">
      <div v-if="demoOpen" class="demo-overlay" role="presentation" @click.self="closeDemo">
        <section class="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title">
          <button type="button" class="demo-close" aria-label="Đóng demo" @click="closeDemo">
            <svg class="app-icon"><use href="#i-close" /></svg>
          </button>

          <span class="demo-icon">
            <svg class="app-icon"><use href="#i-play" /></svg>
          </span>
          <h2 id="demo-title">Trải nghiệm tổng quan WLPRO</h2>
          <p>
            WLPRO hợp nhất dữ liệu nhân viên, chấm công, nghỉ phép và tiền lương trong một
            quy trình xuyên suốt. Bạn có thể đăng nhập để trải nghiệm hệ thống hoặc đăng ký
            tài khoản nhân viên mới.
          </p>
          <div class="demo-actions">
            <a href="/login">Đăng nhập hệ thống</a>
            <a href="/register" class="outline">Đăng ký tài khoản</a>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fustat:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* =========================================================
 * BIẾN MÀU + RESET — GỘP TỪ assets/main.css
 * ======================================================= */
.wlpro-page {
  --white: #ffffff;
  --ink: #0c1a33;
  --muted: #5a6b8c;
  --blue: #0084ff;
  --blue-glow-1: #60b1ff;
  --blue-glow-2: #319aff;
  --star-orange: #ff801e;
  --navy: #0b1a3a;
  --line: rgba(12, 26, 51, 0.1);
  --display: 'Fustat', 'Segoe UI', sans-serif;
  --body: 'Inter', 'Segoe UI', sans-serif;
  --mono: 'JetBrains Mono', monospace;

  position: relative;
  isolation: isolate;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  overflow: clip;
  background: var(--white);
  color: var(--ink);
  font-family: var(--body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.wlpro-page *,
.wlpro-page *::before,
.wlpro-page *::after {
  box-sizing: border-box;
}

.wlpro-page button,
.wlpro-page input,
.wlpro-page textarea,
.wlpro-page select {
  font: inherit;
}

.wlpro-page button,
.wlpro-page a {
  -webkit-tap-highlight-color: transparent;
}

.wlpro-page button {
  cursor: pointer;
}

.wlpro-page a {
  color: inherit;
}

.wlpro-page ::selection {
  background: rgba(0, 132, 255, 0.18);
}

.icon-sprite {
  position: absolute;
  pointer-events: none;
}

.app-icon {
  display: block;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
 * BACKGROUND FX
 * ======================================================= */
.background-fx {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.glow-ellipse {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.55;
}

.ellipse-one {
  top: -180px;
  left: -140px;
  width: 620px;
  height: 520px;
  background: var(--blue-glow-1);
}

.ellipse-two {
  top: -60px;
  left: 180px;
  width: 520px;
  height: 460px;
  background: var(--blue-glow-2);
  opacity: 0.4;
}

.ellipse-three {
  top: 240px;
  left: -220px;
  width: 460px;
  height: 420px;
  background: var(--blue-glow-1);
  opacity: 0.28;
}

.star-canvas {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.page-content {
  position: relative;
  z-index: 2;
}

/* =========================================================
 * REVEAL
 * ======================================================= */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.in {
  opacity: 1;
  transform: translateY(0);
}

.reveal.d1 { transition-delay: 0.07s; }
.reveal.d2 { transition-delay: 0.14s; }
.reveal.d3 { transition-delay: 0.21s; }
.reveal.d4 { transition-delay: 0.28s; }

/* =========================================================
 * NAVBAR
 * ======================================================= */
.nav-wrap {
  position: sticky;
  top: 24px;
  z-index: 60;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.main-nav {
  position: relative;
  display: flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 38px;
  padding: 11px 14px 11px 24px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  box-shadow:
    inset 0 4px 4px rgba(255, 255, 255, 0.25),
    0 10px 40px rgba(12, 26, 51, 0.08);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}

.nav-logo,
.footer-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  border: none;
  background: transparent;
  color: var(--ink);
  font-family: var(--display);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav-logo-mark {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  padding: 6px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--blue), #4da8ff);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 132, 255, 0.4);
}

.nav-logo-mark .app-icon {
  stroke-width: 2.2;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 14.5px;
  font-weight: 500;
  opacity: 0.78;
  transition: opacity 0.25s ease;
}

.nav-link:hover {
  opacity: 1;
}

.nav-signup {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 11px;
  background: rgba(0, 132, 255, 0.88);
  color: #ffffff;
  box-shadow:
    inset 0 3px 4px rgba(255, 255, 255, 0.3),
    0 6px 18px rgba(0, 132, 255, 0.35);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  opacity: 1;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.nav-signup:hover {
  box-shadow:
    inset 0 3px 4px rgba(255, 255, 255, 0.3),
    0 10px 26px rgba(0, 132, 255, 0.5);
  transform: scale(1.03);
}

.nav-signup .app-icon {
  width: 15px;
  height: 15px;
  stroke-width: 2;
}

.mobile-menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: rgba(0, 132, 255, 0.1);
  color: var(--blue);
}

/* =========================================================
 * HERO
 * ======================================================= */
.hero-section {
  position: relative;
  z-index: 10;
  max-width: 1600px;
  margin: 0 auto;
  padding: clamp(50px, 8vw, 90px) clamp(22px, 5vw, 80px) clamp(60px, 8vw, 110px);
  scroll-margin-top: 110px;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: clamp(30px, 4vw, 60px);
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding: 8px 16px 8px 12px;
  border: 1px solid var(--line);
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 3px 4px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-star {
  width: 15px;
  height: 15px;
  fill: var(--star-orange);
  stroke: none;
}

.rating-text {
  font-size: 13.5px;
  font-weight: 500;
}

.rating-text b {
  font-weight: 700;
}

.hero-title {
  max-width: 13ch;
  margin: 0 0 24px;
  color: var(--ink);
  font-family: var(--display);
  font-size: clamp(42px, 6.4vw, 75px);
  font-weight: 700;
  letter-spacing: -2px;
  line-height: 1.05;
}

.accent-text {
  background: linear-gradient(110deg, var(--blue), #4da8ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  max-width: 48ch;
  margin: 0 0 36px;
  color: var(--muted);
  font-size: 18px;
  letter-spacing: -0.5px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 8px 26px;
  border-radius: 16px;
  background: rgba(0, 132, 255, 0.8);
  color: #ffffff;
  box-shadow:
    inset 0 4px 4px rgba(255, 255, 255, 0.35),
    0 12px 30px rgba(0, 132, 255, 0.35);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}

.primary-cta:hover {
  box-shadow:
    inset 0 4px 4px rgba(255, 255, 255, 0.35),
    0 18px 44px rgba(0, 132, 255, 0.5);
  transform: scale(1.02);
}

.cta-circle {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 10px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--blue);
}

.cta-circle .app-icon {
  stroke-width: 2.2;
}

.secondary-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--ink);
  font-size: 15px;
  font-weight: 600;
  opacity: 0.8;
  transition: opacity 0.25s ease;
}

.secondary-cta:hover {
  opacity: 1;
}

.secondary-cta .app-icon {
  width: 17px;
  height: 17px;
}

/* Orb */
.orb-stage {
  position: relative;
  display: grid;
  min-height: clamp(360px, 42vw, 560px);
  place-items: center;
}

.orb-fallback {
  position: absolute;
  width: clamp(280px, 34vw, 480px);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.9), transparent 38%),
    radial-gradient(circle at 65% 70%, #0084ff, transparent 60%),
    radial-gradient(circle at 50% 50%, #4da8ff 0%, #0066dd 55%, #0a2a66 100%);
  box-shadow:
    0 40px 120px rgba(0, 132, 255, 0.45),
    inset -20px -30px 80px rgba(10, 30, 80, 0.5),
    inset 20px 20px 60px rgba(255, 255, 255, 0.4);
  filter: blur(0.5px);
  animation: orbFloat 9s ease-in-out infinite;
}

.orb-fallback::after {
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.6), transparent 45%);
  content: '';
  mix-blend-mode: screen;
}

.orb-video {
  position: relative;
  z-index: 1;
  width: clamp(360px, 50vw, 720px);
  pointer-events: none;
  mix-blend-mode: screen;
  filter: hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1);
  transform: scale(1.25);
}

@keyframes orbFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-22px) scale(1.03); }
}

/* =========================================================
 * SHARED SECTIONS
 * ======================================================= */
.section-shell,
.company-section {
  position: relative;
  z-index: 5;
  width: min(1440px, calc(100% - 44px));
  margin: 0 auto;
}

.features-section,
.pricing-section {
  position: relative;
  z-index: 4;
  padding: 110px 0;
  scroll-margin-top: 105px;
}

.features-section {
  background: rgba(247, 251, 255, 0.82);
  backdrop-filter: blur(16px);
}

.section-heading {
  max-width: 800px;
  margin-bottom: 54px;
}

.section-heading.centered {
  margin-right: auto;
  margin-left: auto;
  text-align: center;
}

.section-label {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--blue);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-label.light {
  color: #9dd1ff;
}

.section-heading h2,
.company-card h2 {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(36px, 5vw, 62px);
  font-weight: 700;
  letter-spacing: -1.8px;
  line-height: 1.08;
}

.section-heading p {
  max-width: 68ch;
  margin: 20px 0 0;
  color: var(--muted);
  font-size: 17px;
}

.section-heading.centered p {
  margin-right: auto;
  margin-left: auto;
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.feature-card {
  min-height: 320px;
  padding: 30px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 50px rgba(12, 26, 51, 0.06);
  backdrop-filter: blur(20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 26px 65px rgba(0, 132, 255, 0.12);
  transform: translateY(-6px);
}

.feature-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  padding: 13px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(0, 132, 255, 0.14), rgba(77, 168, 255, 0.28));
  color: var(--blue);
}

.feature-card h3 {
  margin: 34px 0 12px;
  font-family: var(--display);
  font-size: 26px;
  line-height: 1.15;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.feature-card button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--blue);
  font-weight: 600;
}

.feature-card button .app-icon {
  width: 16px;
  height: 16px;
}

/* Company / trusted */
.company-section {
  padding: 80px 0 115px;
  scroll-margin-top: 105px;
}

.trusted {
  padding: 20px 0 80px;
  text-align: center;
}

.trusted > p {
  margin: 0 0 34px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.trusted-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(36px, 7vw, 96px);
}

.trusted-logo {
  display: flex;
  height: 26px;
  align-items: center;
  gap: 9px;
  color: var(--ink);
  font-family: var(--display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
  filter: grayscale(1);
  opacity: 0.42;
  transition: opacity 0.3s ease;
}

.trusted-logo:hover {
  opacity: 0.75;
}

.trusted-logo .app-icon {
  width: 24px;
  height: 24px;
}

.company-card {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr auto;
  gap: 50px;
  align-items: center;
  padding: 54px;
  border-radius: 30px;
  background:
    radial-gradient(circle at 88% 12%, rgba(77, 168, 255, 0.25), transparent 30%),
    linear-gradient(145deg, #0a1d3c, #071328);
  color: #ffffff;
  box-shadow: 0 30px 80px rgba(6, 25, 61, 0.2);
}

.company-card h2 {
  font-size: clamp(34px, 4.2vw, 54px);
}

.company-card > p {
  margin: 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: 15px;
}

.company-login {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 14px;
  background: #ffffff;
  color: var(--navy) !important;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.company-login .app-icon {
  width: 17px;
  height: 17px;
}

/* Pricing */
.pricing-section {
  background: #f7fbff;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.pricing-card {
  position: relative;
  min-height: 400px;
  padding: 34px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 50px rgba(12, 26, 51, 0.05);
}

.pricing-card.featured {
  border-color: rgba(0, 132, 255, 0.35);
  background: linear-gradient(180deg, rgba(0, 132, 255, 0.06), #ffffff 45%);
  box-shadow: 0 24px 70px rgba(0, 132, 255, 0.15);
  transform: translateY(-8px);
}

.popular-label {
  position: absolute;
  top: 22px;
  right: 22px;
  padding: 6px 10px;
  border-radius: 100px;
  background: var(--blue);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.pricing-card h3 {
  margin: 0 0 12px;
  font-family: var(--display);
  font-size: 30px;
}

.pricing-card > p {
  min-height: 76px;
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.pricing-card ul {
  display: grid;
  gap: 13px;
  margin: 28px 0 34px;
  padding: 24px 0 0;
  border-top: 1px solid var(--line);
  list-style: none;
}

.pricing-card li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334360;
  font-size: 14px;
}

.pricing-card li .app-icon {
  width: 18px;
  height: 18px;
  color: var(--blue);
}

.pricing-card > a {
  display: inline-flex;
  justify-content: center;
  width: 100%;
  padding: 13px 18px;
  border-radius: 13px;
  background: var(--navy);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

.pricing-card.featured > a {
  background: var(--blue);
}

/* Footer */
.site-footer {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 30px;
  align-items: center;
  padding: 32px max(24px, calc((100vw - 1440px) / 2));
  background: #071328;
  color: #ffffff;
}

.footer-brand {
  color: #ffffff;
}

.site-footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
}

.site-footer > div {
  display: flex;
  gap: 18px;
}

.site-footer a {
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  text-decoration: none;
}

/* Demo modal */
.demo-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5, 18, 42, 0.72);
  backdrop-filter: blur(12px);
}

.demo-modal {
  position: relative;
  width: min(560px, 100%);
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--ink);
  box-shadow: 0 30px 100px rgba(2, 17, 44, 0.35);
  text-align: center;
}

.demo-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 10px;
  border: none;
  border-radius: 50%;
  background: rgba(12, 26, 51, 0.06);
  color: var(--ink);
}

.demo-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto 22px;
  place-items: center;
  padding: 17px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--blue), #4da8ff);
  color: #ffffff;
  box-shadow: 0 16px 35px rgba(0, 132, 255, 0.28);
}

.demo-modal h2 {
  margin: 0;
  font-family: var(--display);
  font-size: 34px;
  line-height: 1.1;
}

.demo-modal p {
  margin: 18px 0 0;
  color: var(--muted);
}

.demo-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.demo-actions a {
  padding: 12px 18px;
  border: 1px solid var(--blue);
  border-radius: 12px;
  background: var(--blue);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

.demo-actions a.outline {
  background: transparent;
  color: var(--blue);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .demo-modal,
.modal-fade-leave-active .demo-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .demo-modal,
.modal-fade-leave-to .demo-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

/* =========================================================
 * RESPONSIVE
 * ======================================================= */
@media (max-width: 1080px) {
  .company-card {
    grid-template-columns: 1fr 1fr;
  }

  .company-login {
    grid-column: span 2;
    justify-self: start;
  }
}

@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    text-align: center;
  }

  .hero-title {
    max-width: 100%;
  }

  .rating-badge,
  .hero-description {
    margin-right: auto;
    margin-left: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .feature-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card.featured {
    transform: none;
  }
}

@media (max-width: 860px) {
  .nav-wrap {
    top: 14px;
  }

  .main-nav {
    width: min(560px, 100%);
    justify-content: space-between;
    padding: 10px 12px 10px 16px;
  }

  .mobile-menu-toggle {
    display: grid;
  }

  .nav-items {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    left: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 22px 55px rgba(12, 26, 51, 0.14);
    backdrop-filter: blur(24px);
  }

  .nav-items.open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    padding: 11px 12px;
    border-radius: 10px;
    text-align: left;
  }

  .nav-link:hover {
    background: rgba(0, 132, 255, 0.07);
  }

  .nav-signup {
    justify-content: center;
    margin-top: 4px;
  }

  .company-card {
    grid-template-columns: 1fr;
    padding: 38px;
  }

  .company-login {
    grid-column: auto;
  }

  .site-footer {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-brand,
  .site-footer > div {
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .hero-section {
    padding-top: 72px;
  }

  .rating-badge {
    align-items: flex-start;
    border-radius: 20px;
    text-align: left;
  }

  .rating-stars {
    padding-top: 2px;
  }

  .hero-title {
    font-size: clamp(40px, 13vw, 58px);
    letter-spacing: -1.4px;
  }

  .hero-description {
    font-size: 16px;
    letter-spacing: 0;
  }

  .hero-actions,
  .demo-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-cta,
  .secondary-cta {
    justify-content: center;
  }

  .orb-stage {
    min-height: 330px;
  }

  .orb-video {
    width: 430px;
  }

  .features-section,
  .pricing-section {
    padding: 80px 0;
  }

  .section-shell,
  .company-section {
    width: min(100% - 28px, 1440px);
  }

  .feature-card,
  .pricing-card {
    padding: 24px;
  }

  .company-card {
    padding: 28px;
    border-radius: 24px;
  }

  .trusted-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

  .trusted-logo {
    justify-content: center;
  }

  .demo-modal {
    padding: 38px 22px 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wlpro-page *,
  .wlpro-page *::before,
  .wlpro-page *::after,
  .reveal {
    scroll-behavior: auto !important;
    animation: none !important;
    transition: none !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }
}
</style>
