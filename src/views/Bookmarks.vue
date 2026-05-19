<template>
  <div class="min-h-screen bg-primary-dark">
    <NavBar />
    
    <div class="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center gap-3">
              <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              Tủ Phim Của Bạn
            </h1>
            <p class="text-text-muted">Lưu lại những bộ phim hay để xem sau</p>
          </div>
          
          <div class="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-xl">
            {{ userStore.bookmarks.length }} phim đã lưu
          </div>
        </div>

        <!-- Movies Grid -->
        <div v-if="userStore.bookmarks.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          <MovieCard 
            v-for="movie in userStore.bookmarks" 
            :key="movie._id || movie.slug"
            :movie="movie"
            @click="goToMovieDetails(movie)"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 animate-fade-in-up">
          <div class="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-primary mb-2">Tủ phim đang trống!</h3>
          <p class="text-text-muted mb-6">Bạn chưa lưu bộ phim nào. Hãy dạo quanh và bấm biểu tượng trái tim để lưu lại nhé 🍿</p>
          <button 
            @click="$router.push('/')"
            class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:shadow-red-500/40 transition-all hover:-translate-y-1 active:scale-95"
          >
            Khám phá phim ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import NavBar from '../components/NavBar.vue'
import MovieCard from '../components/MovieCard.vue'

const router = useRouter()
const userStore = useUserStore()

function goToMovieDetails(movie) {
  router.push(`/movie/${movie.slug}`)
}
</script>
