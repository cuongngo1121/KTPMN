import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', {
    state: () => ({
        // Use useStorage to automatically sync with localStorage
        bookmarks: useStorage('cmovie_bookmarks', []),
        watchHistory: useStorage('cmovie_watch_history', {})
    }),

    getters: {
        isBookmarked: (state) => (slug) => {
            return state.bookmarks.some(movie => movie.slug === slug)
        },
        getHistory: (state) => (slug) => {
            return state.watchHistory[slug] || null
        },
        recentHistoryList: (state) => {
            // Return history array sorted by timestamp descending
            return Object.values(state.watchHistory)
                .sort((a, b) => b.timestamp - a.timestamp)
        }
    },

    actions: {
        toggleBookmark(movie) {
            const index = this.bookmarks.findIndex(m => m.slug === movie.slug)
            if (index === -1) {
                // Add minimum required info for bookmark
                this.bookmarks.push({
                    _id: movie._id,
                    name: movie.name,
                    slug: movie.slug,
                    origin_name: movie.origin_name,
                    thumb_url: movie.thumb_url,
                    poster_url: movie.poster_url,
                    year: movie.year,
                    episode_current: movie.episode_current,
                    quality: movie.quality,
                    lang: movie.lang
                })
            } else {
                this.bookmarks.splice(index, 1)
            }
        },

        updateHistory(movie, currentEpisode, progress, duration) {
            if (!movie || !movie.slug || !currentEpisode) return

            // Calculate percentage safely
            let percentage = 0
            if (duration > 0) {
                percentage = (progress / duration) * 100
                percentage = Math.min(Math.max(percentage, 0), 100) // Clamp 0-100
            }

            this.watchHistory[movie.slug] = {
                slug: movie.slug,
                movieName: movie.name,
                thumb_url: movie.thumb_url,
                currentEpisode: {
                    name: currentEpisode.name,
                    slug: currentEpisode.slug,
                    server_name: currentEpisode.server_name || ''
                },
                progress, // seconds
                duration, // seconds
                percentage, // 0-100
                timestamp: Date.now()
            }
        },

        removeHistory(slug) {
            delete this.watchHistory[slug]
        },

        clearAllHistory() {
            this.watchHistory = {}
        }
    }
})
