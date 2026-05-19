import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import MovieDetail from "../views/MovieDetail.vue";
import Genre from "../views/Genre.vue";
import Country from "../views/Country.vue";
import Series from "../views/Series.vue";
import MovieWatch from "../views/MovieWatch.vue";
import Animation from "../views/Animation.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/movie/:slug",
        name: "MovieDetail",
        component: MovieDetail,
    },
    {
        path: "/genre",
        name: "Genre",
        component: Genre,
    },
    {
        path: "/country",
        name: "Country",
        component: Country,
    },
    {
        path: "/movies",
        redirect: "/tim-kiem",
    },
    {
        path: "/series",
        name: "Series",
        component: Series,
    },
    {
        path: "/animation",
        name: "Animation",
        component: Animation,
    },
    {
        path: "/new-movies",
        name: "NewMovies",
        component: () => import("../views/NewMovies.vue"),
    },
    {
        path: "/category/:slug",
        name: "CategoryView",
        component: () => import("../views/CategoryView.vue"),
    },
    {
        path: "/danh-sach/:slug",
        redirect: to => ({ name: 'CategoryView', params: { slug: to.params.slug } })
    },
    {
        path: "/genre/:slug",
        name: "GenreView",
        component: () => import("../views/GenreWrapper.vue"),
    },
    {
        path: "/the-loai/:slug",
        redirect: to => ({ name: 'GenreView', params: { slug: to.params.slug } })
    },
    {
        path: "/country/:slug",
        name: "CountryView",
        component: () => import("../views/CountryWrapper.vue"),
    },
    {
        path: "/quoc-gia/:slug",
        redirect: to => ({ name: 'CountryView', params: { slug: to.params.slug } })
    },
    {
        path: "/watch/:slug",
        name: "MovieWatch",
        component: MovieWatch,
    },
    {
        path: "/tim-kiem",
        name: "SearchResults",
        component: () => import("../views/SearchResults.vue"),
    },
    {
        path: "/tu-phim",
        name: "Bookmarks",
        component: () => import("../views/Bookmarks.vue"),
        meta: { title: "Tủ Phim Của Bạn" }
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("../views/NotFound.vue"),
        meta: { title: "404 - Không tìm thấy trang" }
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0, behavior: 'smooth' }
        }
    }
});

router.beforeEach((to, from, next) => {
    // Default title
    let title = "Phim Chùa - Xem Phim Online"

    // Check if route has meta title
    if (to.meta && to.meta.title) {
        title = `${to.meta.title} | Phim Chùa`
    }

    // Determine dynamic title based on logic (optional, mainly handled in components or here)
    if (to.name === 'Home') title = "Phim Chùa - Trang Chủ"
    if (to.name === 'Movies') title = "Danh Sách Phim - Phim Chùa"
    if (to.name === 'Series') title = "Phim Bộ - Phim Chùa"

    document.title = title
    next()
})

export default router;