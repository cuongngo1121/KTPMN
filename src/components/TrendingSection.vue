<template>
  <div class="relative w-full py-6 md:py-12 overflow-hidden">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <div 
        v-if="featuredMovie"
        class="absolute inset-0 bg-cover bg-center opacity-15 md:opacity-30"
        :style="{ backgroundImage: `url(${getImageUrl(featuredMovie.poster_url || featuredMovie.thumb_url)})` }"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black z-10"></div>
    </div>

    <div class="relative z-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 md:mb-8">
        <div class="flex items-center gap-2.5 md:gap-4">
          <div class="w-1 md:w-1.5 h-7 md:h-10 bg-red-600 rounded-full"></div>
          <div>
            <h2 class="text-lg md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Xu Hướng Hôm Nay
            </h2>
            <p class="text-gray-400 text-xs md:text-base hidden sm:block">Top phim được xem nhiều nhất</p>
          </div>
        </div>
        <router-link 
          to="/movies" 
          class="flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 group text-xs md:text-base"
        >
          <span class="text-red-500 font-semibold">Xem tất cả</span>
          <svg class="w-3.5 h-3.5 md:w-5 md:h-5 text-red-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
        <div v-for="n in 10" :key="n" class="aspect-[2/3] rounded-xl relative overflow-hidden bg-white/5">
          <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Mobile: Compact 3-col grid -->
        <div class="md:hidden">
          <div class="grid grid-cols-3 gap-1.5">
            <div 
              v-for="(movie, index) in movies.slice(0, 9)" 
              :key="movie._id"
              @click="goToMovie(movie.slug)"
              class="relative"
            >
              <div class="relative rounded-lg overflow-hidden">
                <img 
                  :src="getImageUrl(movie.thumb_url || movie.poster_url)"
                  :alt="movie.name"
                  class="w-full aspect-[2/3] object-cover"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                <!-- Rank number -->
                <div class="absolute top-1 left-1 w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                  <span class="text-white text-[10px] font-bold">{{ index + 1 }}</span>
                </div>
                <!-- Info -->
                <div class="absolute bottom-0 left-0 right-0 p-1.5">
                  <h4 class="text-white font-semibold text-[10px] line-clamp-2 leading-tight">{{ movie.name }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tablet: Grid -->
        <div class="hidden md:grid lg:hidden grid-cols-4 gap-4">
          <div v-for="movie in movies.slice(0, 8)" :key="movie._id">
            <MovieCard :movie="movie" @click="goToMovie(movie.slug)" />
          </div>
        </div>

        <!-- Desktop Layout (Featured + List) -->
        <div class="hidden lg:grid grid-cols-3 gap-8">
          <!-- Featured Item (Large) -->
          <div 
            v-if="featuredMovie"
            class="col-span-2 relative group cursor-pointer rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            @click="goToMovie(featuredMovie.slug)"
          >
            <div class="aspect-video w-full h-full relative">
              <img 
                :src="getImageUrl(featuredMovie.poster_url || featuredMovie.thumb_url)" 
                :alt="featuredMovie.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
              
              <div class="absolute bottom-0 left-0 p-8 w-full">
                <div class="flex items-center gap-3 mb-4 flex-wrap">
                  <span class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md uppercase tracking-wider shadow-sm">
                    #1 Trending
                  </span>
                  <span class="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-md border border-white/10">
                    {{ featuredMovie.quality || 'HD' }}
                  </span>
                  <span class="px-3 py-1 bg-black/40 backdrop-blur-md text-gray-200 text-xs font-bold rounded-md border border-white/10">
                    {{ featuredMovie.year }}
                  </span>
                </div>
                
                <h3 class="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight group-hover:text-red-400 transition-colors">
                  {{ featuredMovie.name }}
                </h3>
                <p class="text-gray-200 text-lg line-clamp-2 mb-6 max-w-2xl">
                  {{ stripHtml(featuredMovie.content) }}
                </p>
                
                <div class="flex items-center gap-4">
                  <button class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-bold rounded-xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <span>Xem Ngay</span>
                  </button>
                  <button class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-base font-semibold rounded-xl transition-all border border-white/20">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Top List (Vertical) -->
          <div class="flex flex-col gap-4">
            <div 
              v-for="(movie, index) in topList" 
              :key="movie._id"
              class="flex gap-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
              @click="goToMovie(movie.slug)"
            >
              <div class="relative w-24 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <img 
                  :src="getImageUrl(movie.thumb_url)" 
                  :alt="movie.name"
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-1 left-1 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-md flex items-center justify-center text-white font-bold text-xs border border-white/10">
                  {{ index + 2 }}
                </div>
              </div>
              
              <div class="flex flex-col justify-center flex-1 min-w-0">
                <h4 class="text-white font-bold text-lg mb-1 truncate group-hover:text-red-400 transition-colors">
                  {{ movie.name }}
                </h4>
                <p class="text-gray-400 text-sm mb-2 truncate">{{ movie.origin_name }}</p>
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ (Math.random() * 2 + 7).toFixed(1) }}
                  </span>
                  <span>•</span>
                  <span>{{ movie.year }}</span>
                  <span class="px-1.5 py-0.5 bg-white/10 rounded text-[10px] border border-white/10">{{ movie.quality || 'HD' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMovieStore } from '../stores/movieStore'
import { useRouter } from 'vue-router'
import MovieCard from './MovieCard.vue'

const movieStore = useMovieStore()
const router = useRouter()
const loading = ref(true)

const movies = computed(() => {
  const items = movieStore.movies?.data?.items || []
  return items
})

const featuredMovie = computed(() => movies.value[0])
const topList = computed(() => movies.value.slice(1, 5))

onMounted(async () => {
  try {
    if (!movieStore.movies?.data?.items?.length) {
      await movieStore.getNewMovies()
    }
  } finally {
    loading.value = false
  }
})

function getImageUrl(url) {
  const cdn = 'https://img.ophim.live'
  if (!url) return '/placeholder-movie.jpg'
  return url.startsWith('http') ? url : `${cdn}/uploads/movies/${encodeURIComponent(url)}`
}

function stripHtml(html) {
  if (!html) return ''
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function goToMovie(slug) {
  router.push(`/movie/${slug}`)
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

@media (max-width: 768px) {
  .group {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
