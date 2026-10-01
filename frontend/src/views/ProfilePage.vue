<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const router = useRouter();

// Ambil sesi user langsung dari localStorage saat komponen dibuat
const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { nama: 'Pengguna', username: 'admin' };
  } catch (e) {
    console.error('Error membaca sesi pengguna:', e);
    return { nama: 'Pengguna', username: 'admin' };
  }
};

const user = ref(getStoredUser());

const handleLogout = () => {
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        Profil Saya
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Kelola informasi akun dan preferensi Anda
      </p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
        <div class="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold shadow-inner">
          <Icon icon="carbon:user" class="w-10 h-10" />
        </div>
        <div class="text-center sm:text-left flex-1">
          <h2 class="text-xl font-bold text-slate-800">
            {{ user?.nama || 'Raihan' }}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            @{{ user?.username || 'admin' }}
          </p>
          <span class="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold rounded-full">
            Akun Aktif
          </span>
        </div>
      </div>

      <!-- Detail Info -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-100 text-sm">
        <div>
          <span class="text-xs font-medium text-slate-400 block">Nama Lengkap</span>
          <span class="font-semibold text-slate-700">{{ user?.nama || 'Raihan' }}</span>
        </div>
        <div>
          <span class="text-xs font-medium text-slate-400 block">Username</span>
          <span class="font-semibold text-slate-700">@{{ user?.username || 'admin' }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-6 flex justify-end">
        <button
          type="button"
          @click="handleLogout"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 transition cursor-pointer"
        >
          <Icon icon="carbon:logout" class="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  </div>
</template>
