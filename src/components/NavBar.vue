<template>
  <nav 
    :class="['fixed w-full z-50 transition-all duration-300', 
       isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-2' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4']"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-16 gap-6">
        <!-- LOGO -->
        <router-link to="/" class="group shrink-0">
          <div class="flex flex-col">
            <span class="text-2xl font-black text-red-600 tracking-tighter hover:text-red-500 transition-colors duration-300">
              PHIM CHÙA
            </span>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-2">
          <router-link
            v-for="item in mainMenuItems"
            :key="item.link"
            :to="item.link"
            class="px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap"
            active-class="text-white bg-white/10"
          >
            {{ item.name }}
          </router-link>

          <!-- Dropdowns -->
          <div class="flex items-center gap-1 ml-1">
            <div class="w-px h-4 bg-white/10 mx-2"></div>
            
            <!-- Thể Loại -->
            <div class="relative group">
              <button class="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap">
                <span>Thể Loại</span>
                <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div class="absolute top-full left-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left translate-y-2 group-hover:translate-y-0">
                <div class="w-[400px] p-4 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl grid grid-cols-3 gap-1.5">
                  <router-link
                    v-for="genre in genres"
                    :key="genre.slug"
                    :to="genre.link"
                    class="px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-white hover:bg-white/10 transition-all text-center"
                    active-class="text-white bg-white/10 font-medium"
                  >
                    {{ genre.name }}
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Quốc Gia -->
            <div class="relative group">
              <button class="flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap">
                <span>Quốc Gia</span>
                <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div class="absolute top-full left-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left translate-y-2 group-hover:translate-y-0">
                <div class="w-48 p-3 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl flex flex-col gap-1">
                  <router-link
                    v-for="country in countries"
                    :key="country.slug"
                    :to="country.link"
                    class="px-4 py-2.5 rounded-xl text-[13px] text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    active-class="text-white bg-white/10 font-medium"
                  >
                    {{ country.name }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <div class="hidden lg:flex items-center gap-3 min-w-[340px] justify-end">
          <SearchBox />
          <button 
            @click="toggleTheme" 
            class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg v-if="!isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

        <!-- Mobile - hidden (BottomNav handles mobile) -->
        <button
          @click="toggleMobileMenu"
          class="hidden ml-auto p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Drawer (Slide from Right) -->
    <Teleport to="body">
      <!-- Backdrop -->
      <transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-show="isMobileMenuOpen" @click="closeMobileMenu" class="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"></div>
      </transition>

      <!-- Drawer Panel -->
      <transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div v-show="isMobileMenuOpen" class="fixed top-0 right-0 bottom-0 z-[71] w-[85vw] max-w-[360px] bg-[#0a0a0a] lg:hidden flex flex-col">
          <!-- Drawer Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <span class="text-xl font-black text-red-600 tracking-tighter">PHIM CHÙA</span>
            <button 
              @click="closeMobileMenu"
              class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 active:scale-90 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-5">
            <!-- Search -->
            <div>
              <SearchBox placeholder="Tìm kiếm phim..." />
            </div>

            <!-- Quick Nav Links -->
            <div class="space-y-1">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2 mb-2">Danh mục</p>
              <router-link
                v-for="item in mainMenuItems"
                :key="item.link"
                :to="item.link"
                @click="closeMobileMenu"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all active:scale-[0.98]"
                active-class="text-red-500 bg-red-500/[0.08]"
              >
                <span class="w-1 h-5 rounded-full bg-red-600/50"></span>
                {{ item.name }}
              </router-link>
            </div>

            <!-- Thể Loại Accordion -->
            <div class="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <button 
                @click="activeAccordion = activeAccordion === 'genre' ? null : 'genre'"
                class="w-full px-4 py-3.5 flex items-center justify-between"
              >
                <span class="text-xs text-gray-300 uppercase tracking-widest font-bold">Thể loại</span>
                <svg 
                  class="w-4 h-4 text-gray-500 transition-transform duration-300" 
                  :class="{ 'rotate-180': activeAccordion === 'genre' }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-show="activeAccordion === 'genre'" class="overflow-hidden">
                  <div class="px-3 pb-4 flex flex-wrap gap-2">
                    <router-link
                      v-for="genre in genres"
                      :key="genre.slug"
                      :to="genre.link"
                      @click="closeMobileMenu"
                      class="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                    >
                      {{ genre.name }}
                    </router-link>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Quốc Gia Accordion -->
            <div class="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
              <button 
                @click="activeAccordion = activeAccordion === 'country' ? null : 'country'"
                class="w-full px-4 py-3.5 flex items-center justify-between"
              >
                <span class="text-xs text-gray-300 uppercase tracking-widest font-bold">Quốc gia</span>
                <svg 
                  class="w-4 h-4 text-gray-500 transition-transform duration-300" 
                  :class="{ 'rotate-180': activeAccordion === 'country' }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-show="activeAccordion === 'country'" class="overflow-hidden">
                  <div class="px-3 pb-4 flex flex-wrap gap-2">
                    <router-link
                      v-for="country in countries"
                      :key="country.slug"
                      :to="country.link"
                      @click="closeMobileMenu"
                      class="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 rounded-lg hover:bg-red-600/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                    >
                      {{ country.name }}
                    </router-link>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Drawer Footer -->
          <div class="px-4 py-4 border-t border-white/[0.06] pb-safe">
            <button 
              @click="toggleTheme" 
              class="w-full h-11 rounded-xl bg-white/5 flex items-center justify-center gap-3 text-xs font-bold text-gray-500 active:scale-[0.98] transition-all"
            >
              <svg v-if="!isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>{{ isDark ? 'Chế độ Sáng' : 'Chế độ Tối' }}</span>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SearchBox from './SearchBox.vue'

const isMobileMenuOpen = ref(false)
const isDark = ref(true)
const isScrolled = ref(false)
const activeAccordion = ref(null)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const mainMenuItems = [
  { name: 'Trang chủ', link: '/' },
  { name: 'Phim Bộ', link: '/danh-sach/phim-bo' },
  { name: 'Phim Lẻ', link: '/danh-sach/phim-le' },
  { name: 'Tủ Phim', link: '/tu-phim' },
  { name: 'Hoạt Hình', link: '/danh-sach/hoat-hinh' },
  { name: 'TV Shows', link: '/danh-sach/tv-shows' }
]

const genres = [
  { name: 'Hành Động', link: '/the-loai/hanh-dong', slug: 'hanh-dong' },
  { name: 'Tình Cảm', link: '/the-loai/tinh-cam', slug: 'tinh-cam' },
  { name: 'Hài Hước', link: '/the-loai/hai-huoc', slug: 'hai-huoc' },
  { name: 'Cổ Trang', link: '/the-loai/co-trang', slug: 'co-trang' },
  { name: 'Tâm Lý', link: '/the-loai/tam-ly', slug: 'tam-ly' },
  { name: 'Hình Sự', link: '/the-loai/hinh-su', slug: 'hinh-su' },
  { name: 'Kinh Dị', link: '/the-loai/kinh-di', slug: 'kinh-di' },
  { name: 'Võ Thuật', link: '/the-loai/vo-thuat', slug: 'vo-thuat' }
]

const countries = [
  { name: 'Trung Quốc', link: '/quoc-gia/trung-quoc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', link: '/quoc-gia/han-quoc', slug: 'han-quoc' },
  { name: 'Nhật Bản', link: '/quoc-gia/nhat-ban', slug: 'nhat-ban' },
  { name: 'Thái Lan', link: '/quoc-gia/thai-lan', slug: 'thai-lan' },
  { name: 'Âu Mỹ', link: '/quoc-gia/au-my', slug: 'au-my' },
  { name: 'Việt Nam', link: '/quoc-gia/viet-nam', slug: 'viet-nam' }
]

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('toggle-mobile-menu', toggleMobileMenu)
  initTheme()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('toggle-mobile-menu', toggleMobileMenu)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>