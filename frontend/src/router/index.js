import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/views/DashboardPage.vue'
import TransactionPage from '@/views/TransactionPage.vue'
import CategoryPage from '@/views/CategoryPage.vue'
import ReportPage from '@/views/ReportPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import LoginPage from '@/views/LoginPage.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { hideNavbar: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/transaksi',
    name: 'transaction',
    component: TransactionPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/kategori',
    name: 'category',
    component: CategoryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profil',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard (Proteksi Halaman)
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')

  // 1. Jika halaman mewajibkan login tapi user belum login
  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
  }
  // 2. Jika user sudah login tapi mencoba membuka halaman /login
  else if (to.name === 'login' && user) {
    next({ name: 'dashboard' })
  }
  // 3. Izinkan akses
  else {
    next()
  }
})

export default router
