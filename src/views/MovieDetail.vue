<template>
  <div class="flex flex-col min-h-screen bg-[#0f0f0f] text-white font-sans">
    <NavBar class="fixed top-0 z-50 w-full transition-all duration-300" />
    
    <div v-if="movie" class="relative w-full">
      <!-- HERO SECTION -->
      <div class="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh]">
        <!-- Background Image with Gradient Overlay -->
        <div class="absolute inset-0">
          <img
            :src="getImageUrl(movie.poster_url || movie.thumb_url)"
            alt="Backdrop"
            class="w-full h-full object-cover opacity-60"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div>
        </div>

        <!-- Hero Content -->
        <div class="absolute bottom-0 left-0 w-full px-4 lg:px-12 pb-6 md:pb-12 lg:pb-16 flex flex-col lg:flex-row gap-4 md:gap-8 items-end max-w-[1600px] mx-auto">
          <!-- Left: Poster (Desktop only) -->
          <div class="hidden lg:block w-[240px] flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 relative group">
             <img
              :src="getImageUrl(movie.thumb_url)"
              class="w-full h-auto object-cover"
            />
            <div class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">{{ movie.quality || 'HD' }}</div>
          </div>

          <!-- Right: Info -->
          <div class="flex-1 flex flex-col gap-4 text-shadow-md">
            <!-- Breadcrumbs / Tags -->
            <div class="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-gray-300">
              <span class="bg-white/10 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-md">{{ movie.year }}</span>
              <span class="bg-white/10 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-md">{{ movie.country?.[0]?.name }}</span>
              <span class="bg-white/10 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-md">{{ movie.time || 'N/A' }}</span>
              <span class="flex items-center gap-1 text-yellow-500">
                <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                {{ movie.tmdb?.vote_average || 8.5 }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-4xl lg:text-7xl font-black leading-tight tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              {{ movie.name }}
            </h1>
            <p class="text-sm md:text-lg lg:text-2xl text-gray-400 font-light italic line-clamp-1">{{ movie.origin_name }}</p>

            <!-- Buttons -->
            <div class="flex items-center gap-3 mt-3 md:mt-6">
              <button 
                @click="goToMovieWatch(movie)"
                class="group relative px-5 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm md:text-lg lg:text-xl rounded-xl md:rounded-full shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-1 overflow-hidden active:scale-95"
              >
                <span class="relative z-10 flex items-center gap-2 md:gap-3">
                  <svg class="w-5 h-5 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  XEM PHIM
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-red-500 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button 
                @click="scrollToTrailer"
                class="px-4 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-sm md:text-lg rounded-xl md:rounded-full transition-all flex items-center gap-2 md:gap-3 active:scale-95"
              >
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span class="hidden md:inline">Xem Trailer</span>
                <span class="md:hidden">Trailer</span>
              </button>

              <div class="flex items-center gap-2 md:gap-3 ml-auto sm:ml-0">
                <button 
                  @click="handleShare"
                  title="Chia sẻ phim"
                  class="p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl md:rounded-full transition-all flex items-center justify-center active:scale-95 group"
                >
                  <svg class="w-5 h-5 md:w-6 md:h-6 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"></path></svg>
                </button>
  
                <button 
                  @click="handleAddToWatchlist"
                  title="Lưu phim"
                  class="p-3 md:p-4 backdrop-blur-md border rounded-xl md:rounded-full transition-all flex items-center justify-center active:scale-95 group shadow-lg"
                  :class="userStore.isBookmarked(movie.slug) ? 'bg-red-600 border-red-500 text-white hover:bg-red-700' : 'bg-white/10 hover:bg-red-600/50 border-white/20 hover:border-red-500 text-white'"
                >
                  <svg class="w-5 h-5 md:w-6 md:h-6" :fill="userStore.isBookmarked(movie.slug) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="max-w-[1600px] mx-auto px-4 lg:px-12 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        <!-- Left: Details & Story -->
        <div class="lg:col-span-2 flex flex-col gap-10">
          
          <!-- Storyline -->
          <section>
             <h2 class="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
              <span class="w-1 h-8 bg-red-600 rounded-full"></span>
              Nội Dung Phim
            </h2>
            <p class="text-gray-300 text-sm md:text-lg leading-relaxed text-justify" v-html="movie.content"></p>
          </section>

          <!-- Trailer -->
          <section v-if="movie.trailer_url" id="trailer-section" class="scroll-mt-24">
            <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-1 h-8 bg-red-600 rounded-full"></span>
              Trailer Chính Thức
            </h2>
            <div class="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black aspect-video">
               <iframe
                :src="getYoutubeEmbedUrl(movie.trailer_url)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full h-full"
              ></iframe>
            </div>
          </section>

          <!-- Comments -->
          <section>
             <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-1 h-8 bg-red-600 rounded-full"></span>
              Bình Luận
            </h2>
            <div class="p-8 bg-[#1a1a1a] rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
              <span class="text-4xl mb-3">🐛</span>
              <p class="text-gray-400 font-bold tracking-wide">Chức năng bình luận đang được bảo trì!</p>
              <p class="text-xs text-gray-500 mt-1">Thợ code đang còng lưng fix bug, các dân chơi chờ chút nha...</p>
            </div>
          </section>
        </div>

        <!-- Right: Sidebar Info -->
        <div class="flex flex-col gap-8">
           <div class="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 shadow-lg">
             <h3 class="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Thông Tin Chi Tiết</h3>
             <ul class="flex flex-col gap-4 text-sm">
               <li class="flex flex-col">
                 <span class="text-gray-500 font-medium uppercase text-xs tracking-wider">Đạo diễn</span>
                 <span class="text-white text-lg">{{ movie.director?.join(', ') || 'Đang cập nhật' }}</span>
               </li>
               <li class="flex flex-col">
                 <span class="text-gray-500 font-medium uppercase text-xs tracking-wider">Diễn viên</span>
                 <span class="text-white text-lg leading-relaxed">{{ movie.actor?.join(', ') || 'Đang cập nhật' }}</span>
               </li>
               <li class="flex flex-col">
                 <span class="text-gray-500 font-medium uppercase text-xs tracking-wider">Thể loại</span>
                 <div class="flex flex-wrap gap-2 mt-1">
                   <span v-for="cat in movie.category" :key="cat.id" class="px-2 py-1 bg-white/5 rounded text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                     {{ cat.name }}
                   </span>
                 </div>
               </li>
               <li class="flex flex-col">
                 <span class="text-gray-500 font-medium uppercase text-xs tracking-wider">Quốc gia</span>
                  <span class="text-white text-lg">{{ movie.country?.map(c => c.name).join(', ') || 'N/A' }}</span>
               </li>
             </ul>
           </div>

           <!-- Placeholder for Ads or Top Trending Sidebar -->

        </div>
      </div>

       <!-- Related Movies -->
      <div class="max-w-[1600px] mx-auto px-4 lg:px-12 pb-16">
        <RelatedMovies
          v-if="movie"
          :categories="movie.category || []"
          :currentSlug="movie.slug"
        />
      </div>

    </div>

    <!-- Loading State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>



<script setup>
 import NavBar from '../components/NavBar.vue';
 import { computed, onMounted, ref, watch, inject } from 'vue';
 import { useMovieStore } from '../stores/movieStore';
 import { useUserStore } from '../stores/userStore';
 import ViewDetailBtn from '../components/ViewDetailBtn.vue';
 import RelatedMovies from '../components/RelatedMovies.vue';
 const movieStore = useMovieStore();
 const userStore = useUserStore();
 const toast = inject('toast');

 import { useRoute, useRouter } from 'vue-router';

const route = useRoute();   // ✅ Lấy thông tin route hiện tại (params, query...)
const router = useRouter(); // ✅ Dùng để điều hướng (push, replace...)


 onMounted(() => {
   const slug = route.params.slug;
   movieStore.getMovieDetail(slug);
   console.log('Fetching movie details for slug:', slug);
    console.log('🎬 Movie detail:', movieStore.movieDetail?.data?.item);
   
 });
 
 const movie = computed(() => 
   movieStore.movieDetail?.data?.item || null
   
 );
 function getYoutubeEmbedUrl(url) {
  const match = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;
  }
  return '';
}
watch(movie, (val) => {
  console.log('🎬 Movie đã cập nhật:', val);
});
const getImageUrl = (url) => {
  const cdn = 'https://img.ophim.live';
  if (!url) return '';
  return url.startsWith('http') ? url : `${cdn}/uploads/movies/${encodeURIComponent(url)}`;
};

watch(() => route.params.slug, (newSlug) => {
  movieStore.getMovieDetail(newSlug);
  console.log('🔁 Route changed, fetching new movie:', newSlug);
});

function goToMovieWatch(movie) {
  if (!movie || !movie.slug) {
    console.warn('❌ Movie hoặc slug không tồn tại:', movie);
    return;
  }
  router.push({ name: 'MovieWatch', params: { slug: movie.slug } });
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: movie.value?.name,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href);
    toast?.add({
      type: 'success',
      title: 'Đã copy link!',
      message: 'Link phim đã được lưu vào bộ nhớ tạm.'
    });
  }
}

function handleAddToWatchlist() {
  if (!movie.value) return;
  userStore.toggleBookmark(movie.value);
  const isSaved = userStore.isBookmarked(movie.value.slug);
  toast?.add({
    type: 'success',
    title: isSaved ? 'Đã lưu phim!' : 'Đã bỏ lưu',
    message: isSaved ? 'Phim đã được thêm vào Tủ Phim của bạn.' : 'Phim đã gỡ khỏi Tủ Phim.'
  });
}

function scrollToTrailer() {
  const el = document.getElementById('trailer-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style>

</style>