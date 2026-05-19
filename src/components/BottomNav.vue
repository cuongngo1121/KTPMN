<template>
  <nav class="fixed bottom-0 w-full z-[100] bg-black/60 backdrop-blur-2xl border-t border-white/10 pb-safe pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:hidden">
    <div class="flex items-center justify-around h-14 max-w-md mx-auto relative pb-2">
      <!-- Nav Items -->
        <router-link 
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          custom
        >
          <button
            @click="navigate(item.path)"
            :class="[
              'flex flex-col items-center justify-center gap-0.5 w-14 h-full transition-colors',
              isActiveRoute(item.path) ? 'text-red-500' : 'text-gray-500 active:text-gray-300'
            ]"
          >
            <component :is="item.icon" :active="isActiveRoute(item.path)" />
            <span class="text-[10px] font-medium">{{ item.label }}</span>
          </button>
        </router-link>

        <!-- Menu -->
        <button 
          @click="openMenu"
          class="flex flex-col items-center justify-center gap-0.5 w-14 h-full text-gray-500 active:text-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span class="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
</template>

<script setup>
import { h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['open-menu'])

function isActiveRoute(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path) {
  router.push(path)
}

function openMenu() {
  window.dispatchEvent(new Event('toggle-mobile-menu'))
}

// Slim icon components
const HomeIcon = {
  props: ['active'],
  render() {
    return h('svg', { 
      class: 'w-5 h-5', 
      fill: this.active ? 'currentColor' : 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24',
      'stroke-width': this.active ? '0' : '1.5'
    }, [
      h('path', { 
        d: this.active 
          ? 'M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z'
          : 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      this.active ? h('path', { d: 'M12 5.432l8.159 8.159c.03.03.06.058.091.088v6.198c0 1.035-.84 1.875-1.875 1.875H15.75v-4.5c0-.621-.504-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v4.5H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a.753.753 0 00.091-.088L12 5.432z' }) : null
    ])
  }
}

const MovieIcon = {
  props: ['active'],
  render() {
    return h('svg', { 
      class: 'w-5 h-5', 
      fill: this.active ? 'currentColor' : 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24',
      'stroke-width': this.active ? '0' : '1.5'
    }, [
      h('path', { 
        d: this.active
          ? 'M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-11 2h3v4h-3V5zm-4 0h2v4h-2V5zm0 6h2v4h-2v-4zm0 6h2v4h-2v-4zm4 4h-3v-4h3v4zm4 0h-3v-4h3v4zm0-6h-3v-4h3v4zm4 6h-3v-4h3v4zm0-6h-3v-4h3v4zm0-6h-3V5h3v4zm4 12h-2v-4h2v4zm0-6h-2v-4h2v4zm0-6h-2V5h2v4z'
          : 'M3.375 3v18c0 .621.504 1.125 1.125 1.125h15c.621 0 1.125-.504 1.125-1.125V3H3.375zm0 0v.01m0 3.74v.01m0 3.74v.01m0 3.74v.01m0 3.74v.01m17.25-15v.01m0 3.74v.01m0 3.74v.01m0 3.74v.01m0 3.74v.01',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])
  }
}

const SeriesIcon = {
  props: ['active'],
  render() {
    return h('svg', { 
      class: 'w-5 h-5', 
      fill: this.active ? 'currentColor' : 'none', 
      stroke: 'currentColor', 
      viewBox: '0 0 24 24',
      'stroke-width': this.active ? '0' : '1.5'
    }, [
      h('path', { 
        d: this.active
          ? 'M21 3H3C1.895 3 1 3.895 1 5v12c0 1.105.895 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2z'
          : 'M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])
  }
}

const SearchIcon = {
  props: ['active'],
  render() {
    return h('svg', { 
      class: 'w-5 h-5',
      fill: 'none',
      stroke: 'currentColor', 
      viewBox: '0 0 24 24',
      'stroke-width': this.active ? '2.5' : '1.5'
    }, [
      h('path', { 
        d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])
  }
}

const navItems = [
  { path: '/', label: 'Trang chủ', icon: HomeIcon },
  { path: '/danh-sach/phim-le', label: 'Phim Lẻ', icon: MovieIcon },
  { path: '/danh-sach/phim-bo', label: 'Phim Bộ', icon: SeriesIcon },
  { path: '/tim-kiem', label: 'Tìm kiếm', icon: SearchIcon },
]
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
