<template>
  <section class="py-3 md:py-10 relative overflow-hidden">
    <div class="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3 md:mb-6">
        <div class="flex items-center gap-2.5 md:gap-4">
          <div class="w-1 md:w-1.5 h-7 md:h-10 bg-red-600 rounded-full"></div>
          <div>
            <h2 class="text-lg md:text-2xl lg:text-3xl font-bold text-white">
              {{ title }}
            </h2>
          </div>
        </div>
        <router-link 
          :to="categoryLink" 
          class="flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 group text-xs md:text-sm"
        >
          <span class="text-red-500 font-semibold">Xem tất cả</span>
          <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
        <div v-for="n in 6" :key="n" class="aspect-[2/3] rounded-xl relative overflow-hidden bg-white/5">
          <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>

      <!-- Movies Content -->
      <div v-else-if="movies.length > 0">
        <!-- Mobile: 3-col grid -->
        <div class="md:hidden">
          <div class="grid grid-cols-3 gap-1.5">
            <div 
              v-for="movie in movies.slice(0, 9)" 
              :key="movie._id || movie.slug"
            >
              <MovieCard :movie="movie" @click="goToMovieDetails(movie)" />
            </div>
          </div>
        </div>

        <!-- Tablet+ Swiper -->
        <div class="hidden md:block">
          <swiper
            :modules="modules"
            :slides-per-view="4"
            :space-between="16"
            :loop="false"
            :autoplay="{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }"
            :breakpoints="{
              768: { slidesPerView: 4, spaceBetween: 12 },
              1024: { 
                slidesPerView: 5, 
                spaceBetween: 16,
                grid: { rows: 2, fill: 'row' } 
              },
              1280: { 
                slidesPerView: 6, 
                spaceBetween: 20,
                grid: { rows: 2, fill: 'row' } 
              }
            }"
            :navigation="{ nextEl: `.nm-next-${componentId}`, prevEl: `.nm-prev-${componentId}` }"
            :pagination="false"
            class="overflow-visible"
          >
            <swiper-slide v-for="movie in movies" :key="movie._id || movie.slug" class="h-auto pb-4">
              <MovieCard :movie="movie" @click="goToMovieDetails(movie)" />
            </swiper-slide>
          </swiper>

          <!-- Custom Navigation -->
          <div class="flex items-center justify-end gap-3 mt-4">
            <button :class="`nm-prev-${componentId}`" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button :class="`nm-next-${componentId}`" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-all disabled:opacity-30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-sm">Chưa có phim trong danh mục này</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Grid } from 'swiper/modules'
import MovieCard from './MovieCard.vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/grid'

const props = defineProps({
  title: { type: String, default: 'Phim Mới' },
  category: { type: String, required: true }
})

const movieStore = useMovieStore()
const router = useRouter()
const modules = [Autoplay, Navigation, Grid]
const loading = ref(true)
const componentId = ref(Math.random().toString(36).substr(2, 9))

const categoryLink = computed(() => `/danh-sach/${props.category}`)

const movies = computed(() => {
  const categoryData = movieStore.moviesByCategory[props.category]
  let items = []
  if (categoryData?.items) items = categoryData.items
  else if (categoryData?.data?.items) items = categoryData.data.items
  else if (categoryData?.data?.data?.items) items = categoryData.data.data.items
  return Array.isArray(items) ? items.slice(0, 24) : []
})

onMounted(async () => {
  try {
    if (!movieStore.moviesByCategory[props.category]) {
      await movieStore.getMoviesByCategory(props.category)
    }
  } finally {
    loading.value = false
  }
})

function goToMovieDetails(movie) {
  if (movie.slug) {
    router.push({ path: `/movie/${movie.slug}` })
  }
}
</script>

<style scoped>
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>