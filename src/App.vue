<template>
  <div class="bg-black min-h-screen text-white pb-16 lg:pb-0">
    <WelcomeScreen v-if="showWelcome" @finish="handleWelcomeFinish" />
    <div v-else>
      <LoadingOverlay :is-loading="isLoading" />
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </transition>
      </router-view>
      <BottomNav @open-menu="handleOpenMenu" />
      <Toast ref="toastRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useMovieStore } from './stores/movieStore'
import { useRouter } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import Toast from './components/Toast.vue'

const isLoading = ref(false)
const showWelcome = ref(true)
const router = useRouter()
const movieStore = useMovieStore()
const toastRef = ref(null)

provide('toast', {
  add: (toast) => {
    if (toastRef.value) {
      toastRef.value.addToast(toast)
    }
  }
})

router.beforeEach((to, from, next) => {
  // Only show loading overlay if welcome screen is finished
  if (!showWelcome.value) {
    isLoading.value = true
  }
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000) // Minimum loading time for smooth transition
})

onMounted(() => {
  prefetchHomeData()
})

async function prefetchHomeData() {
  try {
    // Prefetch all home page data in parallel
    await Promise.allSettled([
      movieStore.getNewMovies(),
      movieStore.getMoviesByCategory('phim-bo'),
      movieStore.getMoviesByCategory('phim-le'),
      movieStore.getMoviesByCategory('phim-chieu-rap'),
      movieStore.getMoviesByCategory('hoat-hinh')
    ])
  } catch (e) {
    console.error('Prefetch failed', e)
  }
}

const handleWelcomeFinish = () => {
  showWelcome.value = false
}

const handleOpenMenu = () => {
  // Dispatch event or use store to open mobile menu in NavBar
  // For now, we'll use a simple event bus or direct DOM manipulation if needed,
  // but better to use a shared state.
  // Since NavBar has the mobile menu logic, we might need to refactor slightly 
  // or use a global state.
  // Let's dispatch a custom event on window for simplicity in this scope without Pinia for UI state
  window.dispatchEvent(new CustomEvent('toggle-mobile-menu'))
}
</script>

<style>
/* Global styles */
body {
  background-color: black;
  color: white;
}
</style>