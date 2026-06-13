<template>
  <div id="app">
    <!--
      Trang công khai:
      IndexView, LoginView, RegisterView
      Không sử dụng sidebar và header của AppLayout
    -->
    <RouterView v-if="isPublicPage" v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!--
      Trang bên trong hệ thống:
      Dashboard, nhân viên, chấm công, bảng lương...
      AppLayout phải có RouterView bên trong
    -->
    <AppLayout v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const route = useRoute()

/*
 * Các route có meta.public = true sẽ không sử dụng AppLayout.
 *
 * Ví dụ:
 * {
 *   path: '/',
 *   component: IndexView,
 *   meta: {
 *     public: true
 *   }
 * }
 */
const isPublicPage = computed(() => route.meta.public === true)
</script>

<style>
/* Reset cơ bản toàn bộ ứng dụng */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
  background: #f8fafc;
  color: #0f172a;
  font-family:
    Inter,
    'Be Vietnam Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

img,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

/* Hiệu ứng chuyển trang */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Tôn trọng thiết lập giảm chuyển động của người dùng */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
