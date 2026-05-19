<template>
  <div class="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-amber-500/30">
    <NavBar />

    <!-- Immersive Player Section -->
    <div class="player-section relative w-full bg-black pt-16 pb-4 md:pt-24 md:pb-12 shadow-2xl z-10 overflow-hidden">
      <!-- Cinematic Background Effect (Optimized for Edge Performance) -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-black to-black"></div>

      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Breadcrumb / Back Navigation -->
        <div class="breadcrumb-bar flex items-center gap-2 mb-3 md:mb-6 text-xs md:text-sm text-gray-400">
          <button 
            @click="goBackToDetail"
            class="flex items-center gap-2 hover:text-amber-400 transition-colors group"
          >
            <div class="p-1 rounded-full bg-white/5 group-hover:bg-amber-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </div>
            <span>Quay lại thông tin phim</span>
          </button>
          <span class="text-gray-600">/</span>
          <span class="text-gray-200 truncate max-w-[120px] md:max-w-md">{{ movie?.name }}</span>
          <span class="text-gray-600">/</span>
          <span class="text-amber-500 font-medium">Tập {{ currentEpisode + 1 }}</span>
        </div>

        <!-- Player Container -->
        <div class="grid lg:grid-cols-4 gap-4 lg:gap-8">
          <!-- Main Player Area (3 cols) -->
          <div class="lg:col-span-3">
            <div class="player-container relative aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] border border-amber-500/10 group"
                 @click="handlePlayerTap"
            >
              <!-- Ambient Light Effect -->
              <div class="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <!-- Video Player (Artplayer) -->
              <VideoPlayer
                v-if="videoUrl && isM3U8"
                :option="playerOptions"
                :startTime="getStartTime()"
                @timeupdate="handleTimeUpdate"
                @ended="handleVideoEnded"
                class="video-element w-full h-full z-20 relative rounded-xl overflow-hidden"
              />
              
              <!-- Fallback Iframe -->
              <iframe
                v-else-if="videoUrl"
                :src="videoUrl"
                allowfullscreen
                class="video-element w-full h-full z-20 relative"
                frameborder="0"
                ref="playerFrame"
              ></iframe>

              <!-- Empty State -->
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-gray-500 z-10">
                <div class="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 opacity-50">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
                <p class="text-lg font-medium text-gray-400">Chọn tập phim để bắt đầu xem</p>
              </div>

              <!-- Loading Overlay -->
              <div v-if="loadingEpisode" class="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 transition-opacity duration-300">
                <div class="relative w-16 h-16 mb-4">
                  <div class="absolute inset-0 border-4 border-red-900/30 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin-slow"></div>
                  <div class="absolute inset-3 border-4 border-red-900/20 rounded-full"></div>
                  <div class="absolute inset-3 border-4 border-transparent border-b-red-500 rounded-full animate-spin-reverse"></div>
                </div>
                <p class="text-red-500 font-bold animate-pulse tracking-wide">{{ toastMessage || 'Đang tải tập phim...' }}</p>
              </div>

              <!-- Mobile Landscape: Aspect Ratio Toolbar -->
              <div 
                v-if="isLandscapeMobile"
                :class="['aspect-toolbar absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 transition-opacity duration-300', showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none']"
              >
                <button 
                  v-for="mode in aspectModes" 
                  :key="mode.id"
                  @click.stop="setAspectMode(mode.id)"
                  :class="[
                    'px-2 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap',
                    currentAspectMode === mode.id 
                      ? 'bg-amber-500 text-black shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  ]"
                  :title="mode.label"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <!-- Player Controls / Info -->
            <div class="player-info mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  {{ movie?.name }}
                  <span class="px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20">HD</span>
                </h1>
                <p class="text-gray-400 text-lg">{{ movie?.origin_name }}</p>
              </div>
              
              <div class="flex items-center gap-3">
                <button v-if="hasNextEpisode" @click="playNextEpisode" class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-amber-600 border border-white/5 hover:border-amber-500 rounded-lg transition-all duration-300 text-sm font-medium group active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-gray-400 group-hover:text-black transition-colors">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z" />
                  </svg>
                  <span class="group-hover:text-black transition-colors text-gray-400 font-bold">Tập Tiếp</span>
                </button>
                <button @click="handleShare" class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 rounded-lg transition-all duration-300 text-sm font-medium group active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                  <span class="group-hover:text-white transition-colors">Chia sẻ</span>
                </button>
                <button @click="handleAddToWatchlist" class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-sm font-bold shadow-lg rounded-lg"
                        :class="userStore.isBookmarked(movie?.slug) ? 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-600/20 hover:shadow-red-500/40' : 'from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black shadow-amber-600/20 hover:shadow-amber-500/40'">
                  <svg xmlns="http://www.w3.org/2000/svg" :fill="userStore.isBookmarked(movie?.slug) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ userStore.isBookmarked(movie?.slug) ? 'Đã lưu' : 'Lưu phim' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Sidebar (Episodes & Info) -->
          <div class="lg:col-span-1 flex flex-col h-full">
            <div class="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full max-h-[400px] md:max-h-[600px] lg:max-h-[calc(100vh-150px)] sticky top-24 shadow-xl">
              <!-- Sidebar Header -->
              <div class="p-3 md:p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-center">
                <h3 class="text-base md:text-lg font-bold flex items-center gap-2 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Danh sách tập
                </h3>
              </div>

              <!-- Episode Grid -->
              <div class="flex-1 overflow-y-auto p-2 md:p-3 custom-scrollbar relative">
                <div v-if="hasEpisodes" class="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-3 gap-1.5 md:gap-2">
                  <button
                    v-for="(ep, index) in movie?.episodes?.[0]?.server_data"
                    :key="index"
                    @click="handleClick(index)"
                    :class="[
                      'relative px-1 py-2 md:px-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 border group overflow-hidden',
                      currentEpisode === index
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-400/50 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105 z-10'
                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:border-amber-500/30 hover:text-white'
                    ]"
                  >
                    <span class="relative z-10">{{ ep.name }}</span>
                    <!-- Shine effect for active -->
                    <div v-if="currentEpisode === index" class="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50"></div>
                  </button>
                </div>
                <!-- Empty State: No Episodes -->
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <span class="text-3xl">🍿</span>
                  </div>
                  <p class="text-amber-500 font-bold mb-1">Tạm thời chưa có tập!</p>
                  <p class="text-xs text-gray-400">Tranh thủ coi tạm trailer hoặc đọc nội dung đỡ ghiền nha bạn êi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid lg:grid-cols-3 gap-12">
        <!-- Left Column: Info & Comments -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Synopsis -->
          <section class="animate-fade-in-up">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
              Nội dung phim
            </h3>
            <div class="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 leading-relaxed text-gray-300 hover:border-amber-500/20 transition-colors duration-300 shadow-lg">
              {{ movie?.content }}
            </div>
          </section>

          <!-- Comments -->
          <section class="animate-fade-in-up delay-100">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
              Bình luận
            </h3>
            <div class="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-lg">
              <div class="flex gap-4 mb-6">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shrink-0 shadow-inner border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-300">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="relative">
                    <textarea 
                      placeholder="Viết bình luận của bạn..." 
                      class="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all min-h-[100px] resize-y shadow-inner"
                    ></textarea>
                    <div class="absolute bottom-2 right-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-500">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex justify-end mt-3">
                    <button class="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black rounded-lg text-sm font-bold transition-all duration-300 shadow-lg shadow-amber-600/20 hover:shadow-amber-500/40 hover:-translate-y-0.5">
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div class="text-center py-12 border-t border-white/5">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <span class="text-3xl">🫥</span>
                </div>
                <p class="text-gray-400 font-bold mb-1">Chưa có ai dọn dẹp phần bình luận cả!</p>
                <p class="text-xs text-gray-500">Mạnh dạn bóc tem làm người đầu tiên đi bạn ơi ✍️</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Related Info -->
        <div class="lg:col-span-1 space-y-8 animate-fade-in-left">
          <!-- Movie Stats -->
          <div class="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-lg hover:border-amber-500/20 transition-colors duration-300">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-amber-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Thông tin phim
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-white/5 group">
                <span class="text-gray-400 group-hover:text-gray-300 transition-colors">Trạng thái</span>
                <span class="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">{{ movie?.episode_current }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-white/5 group">
                <span class="text-gray-400 group-hover:text-gray-300 transition-colors">Năm phát hành</span>
                <span class="text-white font-medium">{{ movie?.year }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-white/5 group">
                <span class="text-gray-400 group-hover:text-gray-300 transition-colors">Thời lượng</span>
                <span class="text-white font-medium">{{ movie?.time }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-white/5 group">
                <span class="text-gray-400 group-hover:text-gray-300 transition-colors">Quốc gia</span>
                <span class="text-white font-medium">{{ movie?.country?.[0]?.name }}</span>
              </div>
              <div class="py-3">
                <span class="text-gray-400 block mb-3">Thể loại</span>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="cat in movie?.category" 
                    :key="cat.id"
                    class="px-3 py-1 bg-white/5 hover:bg-amber-500/10 rounded-full text-xs text-gray-300 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 transition-all duration-300 cursor-default"
                  >
                    {{ cat.name }}
                  </span>
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
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '../stores/movieStore';
import { useUserStore } from '../stores/userStore';
import NavBar from '../components/NavBar.vue';
import VideoPlayer from '../components/VideoPlayer.vue';

const toast = inject('toast');
const route = useRoute();
const router = useRouter();
const movieStore = useMovieStore();
const userStore = useUserStore();

const loadingPage = ref(true);
const loadingEpisode = ref(false);
const toastMessage = ref('');
const playerFrame = ref(null);
const currentEpisode = ref(0);

// --- Mobile Landscape / Aspect Ratio ---
const isLandscapeMobile = ref(false);
const showToolbar = ref(false);
const currentAspectMode = ref('fit');
let toolbarTimeout = null;

const aspectModes = [
  { id: 'fit', label: 'Vừa' },
  { id: 'fill', label: 'Đầy' },
  { id: '16:9', label: '16:9' },
  { id: '21:9', label: '21:9' },
  { id: '4:3', label: '4:3' },
];

function checkLandscape() {
  const isLandscape = window.innerWidth > window.innerHeight;
  const isMobile = window.innerHeight < 500 || (window.innerWidth < 1024 && 'ontouchstart' in window);
  isLandscapeMobile.value = isLandscape && isMobile;
  
  if (isLandscapeMobile.value) {
    showToolbar.value = true;
    resetToolbarTimer();
  } else {
    showToolbar.value = false;
  }
}

function resetToolbarTimer() {
  clearTimeout(toolbarTimeout);
  toolbarTimeout = setTimeout(() => {
    showToolbar.value = false;
  }, 4000);
}

function handlePlayerTap() {
  if (isLandscapeMobile.value) {
    showToolbar.value = !showToolbar.value;
    if (showToolbar.value) resetToolbarTimer();
  }
}

function setAspectMode(mode) {
  currentAspectMode.value = mode;
  resetToolbarTimer();
  applyAspectMode(mode);
}

function applyAspectMode(mode) {
  const container = document.querySelector('.player-container');
  if (!container) return;
  
  // Reset
  container.classList.remove('aspect-fit', 'aspect-fill', 'aspect-16-9', 'aspect-21-9', 'aspect-4-3');
  
  switch (mode) {
    case 'fit':
      container.classList.add('aspect-fit');
      break;
    case 'fill':
      container.classList.add('aspect-fill');
      break;
    case '16:9':
      container.classList.add('aspect-16-9');
      break;
    case '21:9':
      container.classList.add('aspect-21-9');
      break;
    case '4:3':
      container.classList.add('aspect-4-3');
      break;
  }
}

onMounted(async () => {
  const slug = route.params.slug; 
  await movieStore.getMovieDetail(slug);
  
  if (movie.value) {
    const history = userStore.getHistory(slug);
    if (history && history.currentEpisode && movie.value.episodes?.[0]?.server_data) {
      const idx = movie.value.episodes[0].server_data.findIndex(ep => ep.slug === history.currentEpisode.slug);
      if (idx !== -1) {
        currentEpisode.value = idx;
      }
    }
  }

  loadingPage.value = false;
  
  // Landscape detection
  checkLandscape();
  window.addEventListener('resize', checkLandscape);
  window.addEventListener('orientationchange', () => {
    setTimeout(checkLandscape, 300);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkLandscape);
  clearTimeout(toolbarTimeout);
});

const movie = computed(() => movieStore.movieDetail?.data?.item || null);

const currentEpisodeData = computed(() => {
  return movie.value?.episodes?.[0]?.server_data[currentEpisode.value];
});

const videoUrl = computed(() => {
  // Prioritize m3u8 for Artplayer, fallback to embed for iframe
  return currentEpisodeData.value?.link_m3u8 || currentEpisodeData.value?.link_embed || '';
});

const isM3U8 = computed(() => {
  return videoUrl.value?.includes('.m3u8');
});

const playerOptions = computed(() => ({
  url: videoUrl.value,
  poster: movie.value?.poster_url || movie.value?.thumb_url,
  title: `${movie.value?.name} - Tập ${currentEpisodeData.value?.name}`,
  volume: 0.7,
  isLive: false,
  muted: false,
  autoplay: true,
  pip: true,
  autoSize: false,
  autoMini: true,
  screenshot: true,
  setting: true,
  loop: false,
  flip: true,
  playbackRate: true,
  aspectRatio: true,
  fullscreen: true,
  fullscreenWeb: true,
  subtitleOffset: true,
  miniProgressBar: true,
  mutex: true,
  backdrop: true,
  playsInline: true,
  autoPlayback: true,
  airplay: true,
  theme: '#F59E0B',
  lang: 'vi'
}));

const hasEpisodes = computed(() => {
  const data = movie.value?.episodes?.[0]?.server_data;
  if (!data || data.length === 0) return false;
  if (data.length === 1 && !data[0].link_m3u8 && !data[0].link_embed) return false;
  return true;
});

const hasNextEpisode = computed(() => {
  const data = movie.value?.episodes?.[0]?.server_data;
  if (!data) return false;
  return currentEpisode.value < data.length - 1;
});

function playNextEpisode() {
  if (hasNextEpisode.value) {
    handleClick(currentEpisode.value + 1);
  }
}

function getStartTime() {
  const history = userStore.getHistory(movie.value?.slug);
  if (history && history.currentEpisode.slug === currentEpisodeData.value?.slug) {
    return history.progress || 0;
  }
  return 0;
}

function handleTimeUpdate(currentTime, duration) {
  if (movie.value && currentEpisodeData.value) {
    userStore.updateHistory(movie.value, currentEpisodeData.value, currentTime, duration);
  }
}

function handleVideoEnded() {
  if (hasNextEpisode.value) {
    toast?.add({
      type: 'info',
      title: 'Hết tập!',
      message: 'Tự động chuyển tập tiếp theo trong 5 giây...'
    });
    setTimeout(() => {
      playNextEpisode();
    }, 5000);
  }
}

function goBackToDetail() {
  if (movie.value?.slug) {
    router.push({ path: `/movie/${movie.value.slug}` });
  } else {
    router.push('/');
  }
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

async function handleClick(index) {
  if (index === currentEpisode.value) return;
  
  loadingEpisode.value = true;
  currentEpisode.value = index;
  
  const episodeName = movie.value.episodes[0].server_data[index].name;
  toastMessage.value = `Đang tải tập ${episodeName}...`;
  
  // Simulate loading delay for smoother UX
  await new Promise(resolve => setTimeout(resolve, 800));
  loadingEpisode.value = false;
  toastMessage.value = '';
  
  await nextTick();
  playerFrame.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

watch(() => route.params.slug, async (newSlug) => {
  if (newSlug) {
    loadingPage.value = true;
    await movieStore.getMovieDetail(newSlug);
    
    currentEpisode.value = 0;
    if (movie.value) {
      const history = userStore.getHistory(newSlug);
      if (history && history.currentEpisode && movie.value.episodes?.[0]?.server_data) {
        const idx = movie.value.episodes[0].server_data.findIndex(ep => ep.slug === history.currentEpisode.slug);
        if (idx !== -1) {
          currentEpisode.value = idx;
        }
      }
    }

    loadingPage.value = false;
  }
});
</script>

<style scoped>
/* Custom Scrollbar for Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(245, 158, 11, 0.4);
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 1.5s linear infinite;
}

@keyframes spin-reverse {
  to { transform: rotate(-360deg); }
}

.animate-spin-reverse {
  animation: spin-reverse 2s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.animate-float {
  animation: float 10s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.6; }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

@keyframes fade-in-left {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-left {
  animation: fade-in-left 0.6s ease-out forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

/* ===== Landscape mobile: immersive fullscreen player ===== */
@media (orientation: landscape) and (max-height: 500px) {
  .player-section {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000 !important;
  }

  .player-section .breadcrumb-bar,
  .player-section .player-info {
    display: none !important;
  }

  .player-section > .absolute {
    display: none;
  }

  .player-section .max-w-\[1800px\] {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .player-section .grid {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .player-section .lg\:col-span-3 {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .player-section .lg\:col-span-1 {
    display: none !important;
  }

  /* Default: fit mode — video contained within screen */
  .player-container {
    aspect-ratio: unset !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  /* Video element sizing modes */
  .player-container .video-element,
  .player-container .artplayer-app,
  .player-container :deep(.artplayer-app),
  .player-container :deep(.art-video-player),
  .player-container iframe {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    transition: width 0.3s ease, height 0.3s ease;
  }

  /* FIT: contain video within screen bounds */
  .player-container.aspect-fit .video-element,
  .player-container.aspect-fit .artplayer-app,
  .player-container.aspect-fit :deep(.artplayer-app),
  .player-container.aspect-fit :deep(.art-video-player),
  .player-container.aspect-fit iframe,
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) .video-element,
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) .artplayer-app,
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) :deep(.artplayer-app),
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) :deep(.art-video-player),
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) iframe {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  /* Artplayer video element */
  .player-container.aspect-fit :deep(video),
  .player-container:not(.aspect-fill):not(.aspect-16-9):not(.aspect-21-9):not(.aspect-4-3) :deep(video) {
    object-fit: contain !important;
  }

  /* FILL: stretch to cover entire screen */
  .player-container.aspect-fill .video-element,
  .player-container.aspect-fill .artplayer-app,
  .player-container.aspect-fill :deep(.artplayer-app),
  .player-container.aspect-fill :deep(.art-video-player),
  .player-container.aspect-fill iframe {
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    object-fit: cover !important;
  }
  .player-container.aspect-fill :deep(video) {
    object-fit: cover !important;
  }

  /* 16:9 */
  .player-container.aspect-16-9 .video-element,
  .player-container.aspect-16-9 .artplayer-app,
  .player-container.aspect-16-9 :deep(.artplayer-app),
  .player-container.aspect-16-9 :deep(.art-video-player),
  .player-container.aspect-16-9 iframe {
    width: calc(100dvh * 16 / 9) !important;
    height: 100dvh !important;
    max-width: 100vw;
  }
  .player-container.aspect-16-9 :deep(video) {
    object-fit: fill !important;
  }

  /* 21:9 ultrawide */
  .player-container.aspect-21-9 .video-element,
  .player-container.aspect-21-9 .artplayer-app,
  .player-container.aspect-21-9 :deep(.artplayer-app),
  .player-container.aspect-21-9 :deep(.art-video-player),
  .player-container.aspect-21-9 iframe {
    width: 100vw !important;
    height: calc(100vw * 9 / 21) !important;
  }
  .player-container.aspect-21-9 :deep(video) {
    object-fit: fill !important;
  }

  /* 4:3 classic */
  .player-container.aspect-4-3 .video-element,
  .player-container.aspect-4-3 .artplayer-app,
  .player-container.aspect-4-3 :deep(.artplayer-app),
  .player-container.aspect-4-3 :deep(.art-video-player),
  .player-container.aspect-4-3 iframe {
    width: calc(100dvh * 4 / 3) !important;
    height: 100dvh !important;
    max-width: 100vw;
  }
  .player-container.aspect-4-3 :deep(video) {
    object-fit: fill !important;
  }

  /* === FULLSCREEN OVERRIDE === */
  /* When Artplayer enters native fullscreen, reset our custom transforms */
  .player-container :deep(.art-video-player.art-fullscreen),
  .player-container :deep(.art-video-player:fullscreen),
  .player-container :deep(.art-video-player:-webkit-full-screen) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    transform: none !important;
    z-index: 99999 !important;
  }

  .player-container :deep(.art-fullscreen video),
  .player-container :deep(:fullscreen video),
  .player-container :deep(:-webkit-full-screen video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  /* Also handle iframe fullscreen */
  iframe:fullscreen,
  iframe:-webkit-full-screen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    transform: none !important;
    z-index: 99999 !important;
  }
}

/* Aspect toolbar animation */
.aspect-toolbar {
  animation: toolbar-slide-in 0.3s ease-out;
}

@keyframes toolbar-slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>