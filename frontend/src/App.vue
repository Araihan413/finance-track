<script setup>
import NavbarTop from './components/common/NavbarTop.vue';
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
    <NavbarTop v-if="!route.meta?.hideNavbar" />
    <main :class="route.meta?.hideNavbar ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-22 pb-12'">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
