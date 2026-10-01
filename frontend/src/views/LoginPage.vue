<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const router = useRouter();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';

  if (!username.value || !password.value) {
    errorMessage.value = 'Username dan password wajib diisi!';
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Set session di browser
      localStorage.setItem('user', JSON.stringify(result.user));
      // Redirect ke dashboard
      router.push('/');
    } else {
      errorMessage.value = result.message || 'Login gagal!';
    }
  } catch {
    errorMessage.value = 'Gagal terhubung ke server backend!';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
    <!-- Login Card -->
    <div class="relative w-full max-w-98 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

      <div class="p-7">
        <!-- Logo Area -->
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Icon icon="carbon:finance" class="w-6 h-6" />
          </div>
          <span class="font-bold text-sm text-slate-900 tracking-tight mt-2.5">
            Finance Track
          </span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-1.5">
            Selamat Datang
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Masuk ke akun pengelolaan finansial Anda
          </p>
        </div>

        <!-- Alert Error akan muncul jika ada error -->
        <div
          v-if="errorMessage"
          class="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2"
        >
          <Icon icon="carbon:warning" class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
          <!-- Username Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon icon="carbon:user" class="w-4 h-4" />
              </span>
              <input
                v-model="username"
                type="text"
                required
                placeholder="Username"
                class="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon icon="carbon:locked" class="w-4 h-4" />
              </span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Password"
                class="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label="Toggle password visibility"
              >
                <Icon :icon="showPassword ? 'carbon:view-off' : 'carbon:view'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition duration-150 cursor-pointer"
          >
            <span>Masuk</span>
            <Icon icon="carbon:arrow-right" class="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  </div>
</template>
