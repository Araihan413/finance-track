<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();

// State dropdown & mobile menu
const isProfileMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const profileDropdownRef = ref(null);

// Ambil data user langsung dari localStorage
const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { nama: 'Raihan', username: 'admin' };
  } catch (e) {
    console.error('Error loading user session', e);
    return { nama: 'Raihan', username: 'admin' };
  }
};

const user = ref(getStoredUser());

onMounted(() => {
  // Ketika klik di luar dropdown menu profil, maka dropdown akan tertutup
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = (e) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    isProfileMenuOpen.value = false;
  }
};

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeAllMenus = () => {
  isProfileMenuOpen.value = false;
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  closeAllMenus();
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<template>
  <nav class="bg-white fixed top-0 w-full z-50 shadow-xs border-b border-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo Brand -->
        <RouterLink to="/" @click="closeAllMenus" class="flex gap-2.5 items-center">
          <div class="bg-blue-600 p-2 rounded-full text-white shadow-xs">
            <Icon icon="carbon:finance" class="w-5 h-5" />
          </div>
          <h1 class="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
            Finance Track
          </h1>
        </RouterLink>

        <!-- Desktop Navigation Menu -->
        <div class="hidden md:block">
          <ul class="flex items-center gap-6 font-semibold text-sm text-slate-600">
            <li>
              <RouterLink
                to="/"
                class="hover:text-blue-600 transition-colors py-1 cursor-pointer"
              >
                Dashboard
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/transaksi"
                class="hover:text-blue-600 transition-colors py-1 cursor-pointer"
              >
                Transaksi
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/kategori"
                class="hover:text-blue-600 transition-colors py-1 cursor-pointer"
              >
                Kategori
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Right Side: Profile & Burger Button -->
        <div class="flex items-center gap-2">
          <!-- Profile Badge (Desktop & Tablet) -->
          <div ref="profileDropdownRef" class="relative">
            <button
              type="button"
              @click="toggleProfileMenu"
              class="flex gap-2.5 items-center px-3 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition duration-150 focus:outline-none"
              aria-label="Menu Pengguna"
            >
              <div class="bg-blue-100 text-blue-600 rounded-full p-1.5 flex items-center justify-center">
                <Icon icon="carbon:user" class="w-4 h-4" />
              </div>
              <div class="hidden sm:flex items-center gap-1.5">
                <p class="text-sm font-semibold text-slate-700">
                  {{ user?.nama || 'Raihan' }}
                </p>
                <Icon
                  icon="carbon:chevron-down"
                  class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
                  :class="{ 'rotate-180': isProfileMenuOpen }"
                />
              </div>
            </button>

            <!-- Dropdown Menu Profil Kecil -->
            <Transition name="dropdown">
              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <!-- Info Header -->
                <div class="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <p class="text-xs font-bold text-slate-800">{{ user?.nama || 'Raihan' }}</p>
                  <p class="text-[11px] text-slate-400">@{{ user?.username || 'admin' }}</p>
                </div>

                <!-- Opsi Profil -->
                <RouterLink
                  to="/profil"
                  @click="closeAllMenus"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <Icon icon="carbon:user" class="w-4 h-4" />
                  <span>Profil Saya</span>
                </RouterLink>

                <div class="h-px bg-slate-100 my-1"></div>

                <!-- Opsi Logout -->
                <button
                  type="button"
                  @click="handleLogout"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                >
                  <Icon icon="carbon:logout" class="w-4 h-4 text-rose-500" />
                  <span>Keluar</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Mobile Hamburger Button -->
          <button
            type="button"
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle menu navigasi"
          >
            <Icon :icon="isMobileMenuOpen ? 'carbon:close' : 'carbon:menu'" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Dropdown Navigation -->
    <Transition name="slide">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg"
      >
        <RouterLink
          to="/"
          @click="closeAllMenus"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Icon icon="carbon:dashboard" class="w-4 h-4 text-slate-400" />
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink
          to="/transaksi"
          @click="closeAllMenus"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Icon icon="carbon:receipt" class="w-4 h-4 text-slate-400" />
          <span>Transaksi</span>
        </RouterLink>

        <RouterLink
          to="/kategori"
          @click="closeAllMenus"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Icon icon="carbon:tag" class="w-4 h-4 text-slate-400" />
          <span>Kategori</span>
        </RouterLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.router-link-active {
  color: #2563eb;
  font-weight: 700;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Slide animation for mobile */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
