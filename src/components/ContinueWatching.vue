<template>
  <div v-if="historyList.length > 0" class="w-full bg-primary-dark pt-8 md:pt-12">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h2 class="text-xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <span class="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></span>
          Đang Xem Dở
        </h2>
        <button 
          @click="router.push('/lich-su')"
          class="text-sm md:text-base font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          Xem tất cả
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Swiper Slider -->
      <div class="relative group">
        <swiper
          :modules="modules"
          :slides-per-view="2.2"
          :space-between="12"
          :navigation="{
            prevEl: '.history-swiper-button-prev',
            nextEl: '.history-swiper-button-next',
          }"
          :breakpoints="{
            '480': { slidesPerView: 2.5, spaceBetween: 16 },
            '640': { slidesPerView: 3.5, spaceBetween: 16 },
            '768': { slidesPerView: 4.5, spaceBetween: 20 },
            '1024': { slidesPerView: 5.5, spaceBetween: 24 },
            '1280': { slidesPerView: 6.5, spaceBetween: 24 },
          }"
          class="!pb-6 md:!pb-12 !px-1 md:!px-2"
        >
          <swiper-slide v-for="movie in historyList" :key="movie.slug" class="h-auto">
            <MovieCard :movie="movie" @click="resumeMovie(movie)" />
          </swiper-slide>
        </swiper>

        <!-- Custom Navigation Buttons -->
        <button class="history-swiper-button-prev absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-xl opacity-0 md:group-hover:opacity-100 disabled:hidden">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="history-swiper-button-next absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-xl opacity-0 md:group-hover:opacity-100 disabled:hidden">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import { useUserStore } from '../stores/userStore'
import MovieCard from './MovieCard.vue'

const router = useRouter()
const userStore = useUserStore()
const modules = [Navigation]

const historyList = computed(() => {
  // Get top 15 recent movies
  return userStore.recentHistoryList.slice(0, 15).map(item => {
    return {
      _id: item.slug,
      slug: item.slug,
      name: item.movieName,
      thumb_url: item.thumb_url,
      episode_current: item.currentEpisode?.name, // Show current episode on the card
      percentage: item.percentage
    }
  })
})

function resumeMovie(movie) {
  // If we have watch history, go directly to watch page to resume
  router.push(`/watch/${movie.slug}`)
}
</script>

<style scoped>
.history-swiper-button-next.swiper-button-disabled,
.history-swiper-button-prev.swiper-button-disabled {
  opacity: 0 !important;
  cursor: auto;
  pointer-events: none;
}
</style>
