<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['edit', 'delete', 'prev-page', 'next-page']);

const formatCurrency = (val, type) => {
  const absVal = Math.abs(val || 0).toLocaleString('id-ID');
  return String(type).toLowerCase() === 'masuk' ? `+Rp ${absVal}` : `-Rp ${absVal}`;
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th class="py-3.5 px-6 font-semibold">TANGGAL</th>
            <th class="py-3.5 px-6 font-semibold">KATEGORI</th>
            <th class="py-3.5 px-6 font-semibold text-center">TIPE</th>
            <th class="py-3.5 px-6 font-semibold">KETERANGAN</th>
            <th class="py-3.5 px-6 font-semibold text-right">JUMLAH</th>
            <th class="py-3.5 px-6 font-semibold text-center">AKSI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <!-- Empty State -->
          <tr v-if="transactions.length === 0">
            <td colspan="6" class="py-12 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Icon icon="carbon:document-blank" class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-slate-500">Tidak ada transaksi ditemukan</p>
                <p class="text-xs text-slate-400">Coba ubah filter atau kata kunci pencarian Anda</p>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="item in transactions"
            :key="item.id"
            class="hover:bg-slate-50/60 transition-colors group"
          >
            <!-- Tanggal -->
            <td class="py-4 px-6 text-slate-500 text-xs sm:text-sm whitespace-nowrap">
              {{ String(item.tanggal || item.date || '').split('T')[0].split('-').reverse().join('/') }}
            </td>

            <!-- Kategori -->
            <td class="py-4 px-6 whitespace-nowrap">
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

            <!-- Tipe (Masuk / Keluar) -->
            <td class="py-4 px-6 text-center whitespace-nowrap">
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
              class="py-4 px-6 text-right font-bold text-xs sm:text-sm whitespace-nowrap"
              :class="String(item.tipe || item.type).toLowerCase() === 'masuk' ? 'text-emerald-600' : 'text-rose-500'"
            >
              {{ formatCurrency(item.jumlah !== undefined ? item.jumlah : item.amount, item.tipe || item.type) }}
            </td>

            <!-- Aksi (Edit & Hapus menggunakan Icon saja) -->
            <td class="py-4 px-6 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  @click="emit('edit', item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                  title="Edit Transaksi"
                >
                  <Icon icon="carbon:edit" class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="emit('delete', item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Hapus Transaksi"
                >
                  <Icon icon="carbon:trash-can" class="w-4 h-4" />
                </button>
              </div>
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

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="currentPage <= 1"
          @click="emit('prev-page')"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition"
          :class="
            currentPage <= 1
              ? 'text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed opacity-75'
              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs'
          "
        >
          Sebelumnya
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="emit('next-page')"
          class="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition"
          :class="
            currentPage >= totalPages
              ? 'text-slate-400 bg-slate-50 border border-slate-200/80 cursor-not-allowed opacity-75'
              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs'
          "
        >
          Selanjutnya
        </button>
      </div>
    </div>
  </div>
</template>
