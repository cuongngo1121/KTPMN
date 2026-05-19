<template>
  <div
    class="movie-card-wrapper relative h-full"
    @mouseenter="startHoverTimer"
    @mouseleave="cancelHover"
    ref="wrapperRef"
  >
    <!-- Main Card -->
    <div
      class="movie-card group rounded-lg md:rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col bg-[#141414] transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl"
      @click="handleClick"
    >
      <!-- Image Container -->
      <div class="relative aspect-[2/3] overflow-hidden bg-gray-900">
        <img
          :src="getImageUrl(movie.thumb_url || movie.poster_url)"
          :alt="movie.name"
          class="w-full h-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105"
          loading="lazy"
        />
        
        <!-- Mobile: Bottom gradient always on -->
        <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent"></div>
        
        <!-- Desktop hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 hidden md:block md:transition-opacity md:duration-300"></div>
        
        <!-- Play Button (desktop) -->
        <div class="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg class="w-5 h-5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        <!-- Quality Badge -->
        <div class="absolute top-1 left-1 md:top-2 md:left-2">
          <span class="px-1 py-px md:px-2 md:py-1 bg-red-600 text-white rounded text-[8px] md:text-[11px] font-bold leading-none">
            {{ movie.quality || 'HD' }}
          </span>
        </div>
        
        <!-- Episode Badge -->
        <div v-if="movie.episode_current && movie.episode_current !== 'Full'" 
          class="absolute top-1 right-1 md:top-2 md:right-2 z-10">
          <span class="px-1 py-px md:px-2 md:py-1 bg-blue-600/90 text-white rounded text-[8px] md:text-[11px] font-bold leading-none">
            {{ movie.episode_current === 'Hoàn Tất' ? 'END' : `T${movie.episode_current}` }}
          </span>
        </div>

        <!-- Bookmark Icon (Mobile only, desktop uses popup) -->
        <button 
          @click.stop="userStore.toggleBookmark(movie)"
          class="absolute top-1 md:hidden z-10 w-6 h-6 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
          :class="(movie.episode_current && movie.episode_current !== 'Full') ? 'right-[2.5rem]' : 'right-1'"
        >
          <svg class="w-3.5 h-3.5" :class="userStore.isBookmarked(movie.slug) ? 'text-red-500' : 'text-white'" :fill="userStore.isBookmarked(movie.slug) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <!-- Mobile: Title overlay on image -->
        <div class="absolute bottom-0 left-0 right-0 p-1.5 md:hidden" :class="{'mb-1': movie.percentage !== undefined}">
          <h3 class="text-[10px] font-semibold text-white line-clamp-2 leading-tight">
            {{ movie.name }}
          </h3>
        </div>

        <!-- Progress Bar -->
        <div v-if="movie.percentage !== undefined" class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div class="h-full bg-red-600 rounded-r-full" :style="{ width: `${movie.percentage}%` }"></div>
        </div>
      </div>
      
      <!-- Desktop Info Section only -->
      <div class="hidden md:flex flex-col p-2.5 h-[76px]">
        <h3 class="text-[13px] font-bold text-white/90 group-hover:text-red-400 transition-colors line-clamp-1 leading-snug mb-0.5">
          {{ movie.name }}
        </h3>
        <p class="text-[10px] text-gray-500 line-clamp-1 mb-1">{{ movie.origin_name }}</p>
        <div class="mt-auto flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-1.5">
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>{{ movie.tmdb?.vote_average || 'N/A' }}</span>
          </div>
          <span>{{ movie.year }}</span>
        </div>
      </div>
    </div>

    <!-- Desktop Popup (unchanged logic) -->
    <Teleport to="body">
      <div
        v-if="showPopup && !isMobile"
        :class="['fixed z-[9999] w-80 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-200', popupAnimationClass]"
        :style="popupStyle"
        @mouseenter="keepPopupOpen = true; isHoveringPopup = true"
        @mouseleave="handlePopupLeave"
      >
        <div class="aspect-video relative bg-gray-900 group/image overflow-hidden">
          <div v-if="trailerUrl && getYoutubeEmbedUrl(trailerUrl)" class="absolute inset-0 z-10 w-full h-full bg-black">
             <iframe
              :src="getYoutubeEmbedUrl(trailerUrl)"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              class="w-full h-full pointer-events-none"
            ></iframe>
            <div @click.stop="handleClick" class="absolute inset-0 z-20 cursor-pointer bg-transparent"></div>
          </div>

          <img 
            v-if="!trailerUrl || !getYoutubeEmbedUrl(trailerUrl)"
            :src="getImageUrl(movie.poster_url || movie.thumb_url)" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />
          <div class="absolute inset-0 bg-black/10"></div>
          
          <button v-if="!trailerUrl" @click.stop="handleClick" class="absolute inset-0 flex items-center justify-center group/play z-30">
            <div class="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-red-600 group-hover/play:scale-110 transition-transform duration-300">
               <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </button>
        </div>

        <div class="p-4 bg-[#1a1a1a]">
          <h3 class="font-bold text-white text-lg line-clamp-1 mb-1">{{ movie.name }}</h3>
          <p class="text-sm text-gray-400 mb-3 line-clamp-2">{{ movie.origin_name }}</p>
          
          <div class="flex gap-2">
            <button @click.stop="handleClick" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm">
              Xem Phim
            </button>
            <button 
              @click.stop="userStore.toggleBookmark(movie)"
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
              :class="userStore.isBookmarked(movie.slug) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-500'"
              :title="userStore.isBookmarked(movie.slug) ? 'Bỏ lưu' : 'Lưu phim'"
            >
              <svg class="w-5 h-5" :fill="userStore.isBookmarked(movie.slug) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-white/5 mt-4">
            <span class="flex items-center gap-1 text-amber-500">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {{ movie.tmdb?.vote_average || '8.5' }}
            </span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>{{ movie.quality || 'HD' }}</span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>{{ movie.year }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axiosClient from '../api/axiosClient'
import { useUserStore } from '../stores/userStore'

const props = defineProps({
  movie: { type: Object, required: true }
})

const userStore = useUserStore()

const emit = defineEmits(['click'])

const wrapperRef = ref(null)
const showPopup = ref(false)
const isHoveringPopup = ref(false)
const keepPopupOpen = ref(false)
const popupStyle = ref({})
const isMobile = ref(false)
const trailerUrl = ref('')
const loadingTrailer = ref(false)
let hoverTimer = null

const popupAnimationClass = computed(() => {
  return showPopup.value ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', closePopup, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', closePopup)
  clearTimeout(hoverTimer)
})

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) closePopup()
}

function startHoverTimer() {
  if (isMobile.value) return
  hoverTimer = setTimeout(() => {
    calculatePosition()
    showPopup.value = true
    fetchTrailer()
  }, 400)
}

async function fetchTrailer() {
  if (trailerUrl.value) return 
  if (props.movie.trailer_url) {
    trailerUrl.value = props.movie.trailer_url
    return
  }
  loadingTrailer.value = true
  try {
     const res = await axiosClient.get(`v1/api/phim/${props.movie.slug}`)
     trailerUrl.value = res.data?.movie?.trailer_url || ''
  } catch (e) {
     console.error('Failed to fetch trailer for popup', e)
  } finally {
     loadingTrailer.value = false
  }
}

function getYoutubeEmbedUrl(url) {
  if (!url) return ''
  const match = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${match[1]}&rel=0`;
  }
  return '';
}

function cancelHover() {
  clearTimeout(hoverTimer)
  if (!keepPopupOpen.value) {
    setTimeout(() => {
      if (!isHoveringPopup.value) closePopup()
    }, 100)
  }
}

function handlePopupLeave() {
  closePopup()
}

function closePopup() {
  showPopup.value = false
  isHoveringPopup.value = false
  keepPopupOpen.value = false
  clearTimeout(hoverTimer)
}

function calculatePosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const popupW = 320
  const viewportW = window.innerWidth
  const padding = 16
  let left = rect.right + 10
  if (left + popupW > viewportW - padding) {
    left = rect.left - popupW - 10
  }
  if (left < padding) left = padding
  let top = rect.top + (rect.height / 2) - 150
  if (top < padding) top = padding + 60
  if (top + 300 > window.innerHeight - padding) top = window.innerHeight - 300 - padding
  popupStyle.value = { top: `${top}px`, left: `${left}px` }
}

function handleClick() {
  emit('click')
}

function getImageUrl(url) {
  const cdn = 'https://img.ophim.live'
  if (!url) return '/placeholder-movie.jpg'
  return url.startsWith('http') ? url : `${cdn}/uploads/movies/${encodeURIComponent(url)}`
}
</script>

<style scoped>
.movie-card {
  -webkit-tap-highlight-color: transparent;
}
</style>
