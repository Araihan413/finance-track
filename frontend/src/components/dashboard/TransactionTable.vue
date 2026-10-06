<script setup>
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';

defineProps({
  title: {
    type: String,
    default: 'Transaksi Terakhir',
  },
  badgeText: {
    type: String,
    default: '5 Catatan Terkini',
  },
  viewAllLink: {
    type: String,
    default: '/transaksi',
  },
  transactions: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
});

const formatCurrency = (val, type) => {
  const absVal = Math.abs(val).toLocaleString('id-ID');
  return type === 'Masuk' ? `+Rp ${absVal}` : `-Rp ${absVal}`;
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {{ title }}
        </h2>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
          {{ badgeText }}
        </span>
      </div>

      <RouterLink
        :to="viewAllLink"
        class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
      >
        <span>Lihat Semua</span>
        <Icon icon="carbon:arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/40 text-sm font-bold  tracking-wider text-slate-700">
            <th class="py-3.5 px-6 font-semibold">Tanggal</th>
            <th class="py-3.5 px-6 font-semibold">Kategori</th>
            <th class="py-3.5 px-6 font-semibold text-center">Tipe</th>
            <th class="py-3.5 px-6 font-semibold">Keterangan</th>
            <th class="py-3.5 px-6 font-semibold text-right">Jumlah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr
            v-for="item in transactions"
            :key="item.id"
            class="hover:bg-slate-50/60 transition-colors group"
          >
            <!-- Tanggal -->
            <td class="py-4 px-6 text-slate-500 text-xs sm:text-sm">
              {{ String(item.tanggal || item.date || '').split('T')[0].split('-').reverse().join('/') }}
            </td>

            <!-- Kategori -->
            <td class="py-4 px-6">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-800 text-xs sm:text-sm">
                  {{ item.kategori || item.category }}
                </span>
                <span
                  v-if="item.subCategory"
                  class="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100"
                >
                  {{ item.subCategory }}
                </span>
              </div>
            </td>

            <!-- Tipe (Keluar / Masuk badge) -->
            <td class="py-4 px-6 text-center">
              <span
                v-if="String(item.tipe || item.type).toLowerCase() === 'masuk'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Masuk
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-500"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Keluar
              </span>
            </td>

            <!-- Keterangan -->
            <td class="py-4 px-6 text-slate-600 text-xs sm:text-sm">
              {{ item.keterangan || item.description || '-' }}
            </td>

            <!-- Jumlah -->
            <td
              class="py-4 px-6 text-right font-bold text-xs sm:text-sm"
              :class="String(item.tipe || item.type).toLowerCase() === 'masuk' ? 'text-emerald-600' : 'text-rose-500'"
            >
              {{ formatCurrency(item.jumlah !== undefined ? item.jumlah : item.amount, String(item.tipe || item.type).toLowerCase() === 'masuk' ? 'Masuk' : 'Keluar') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Pagination -->
    <div class="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-white">
      <p class="text-xs text-slate-500">
        Menampilkan {{ transactions.length }} dari {{ totalCount }} total transaksi
      </p>
    </div>
  </div>
</template>
