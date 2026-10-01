<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue';

// State list kategori dari backend
const categories = ref([]);
const isLoading = ref(false);

// Filter tab: 'all' | 'masuk' | 'keluar'
const activeFilter = ref('all');

// Filtered categories
const filteredCategories = computed(() => {
  if (activeFilter.value === 'all') return categories.value;
  return categories.value.filter((cat) => cat.tipe === activeFilter.value);
});

// Modal state
const isModalOpen = ref(false);
const editingCategory = ref(null);
const form = ref({
  nama: '',
  tipe: 'keluar', // 'masuk' | 'keluar'
});

// Fetch kategori dari backend (GET /api/kategori)
const loadCategories = async () => {
  isLoading.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/kategori');
    const result = await res.json();
    if (result.success) {
      categories.value = result.data;
    }
  } catch (err) {
    console.error('Error memuat data kategori:', err);
  } finally {
    isLoading.value = false;
  }
};

// Buka modal tambah
const openAddModal = () => {
  editingCategory.value = null;
  form.value = { nama: '', tipe: 'keluar' };
  isModalOpen.value = true;
};

// Buka modal edit
const openEditModal = (cat) => {
  editingCategory.value = cat;
  form.value = { nama: cat.nama, tipe: cat.tipe };
  isModalOpen.value = true;
};

// Simpan Kategori (POST / PUT ke backend)
const handleSave = async () => {
  if (!form.value.nama.trim()) return;

  try {
    if (editingCategory.value) {
      // Edit: PUT /api/kategori/:id
      const res = await fetch(`http://localhost:3000/api/kategori/${editingCategory.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.value.nama.trim(),
          tipe: form.value.tipe,
        }),
      });
      const result = await res.json();
      if (result.success) {
        loadCategories();
      }
    } else {
      // Tambah baru: POST /api/kategori
      const res = await fetch('http://localhost:3000/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.value.nama.trim(),
          tipe: form.value.tipe,
        }),
      });
      const result = await res.json();
      if (result.success) {
        loadCategories();
      }
    }
  } catch (err) {
    console.error('Error menyimpan kategori:', err);
  }

  isModalOpen.value = false;
};

// Modal konfirmasi hapus kategori
const isDeleteModalOpen = ref(false);
const itemToDelete = ref(null);

const confirmDelete = (cat) => {
  itemToDelete.value = cat;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value) {
    try {
      const res = await fetch(`http://localhost:3000/api/kategori/${itemToDelete.value.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        isDeleteModalOpen.value = false;
        itemToDelete.value = null;
        loadCategories();
      } else {
        alert(result.message || 'Gagal menghapus kategori');
      }
    } catch (err) {
      console.error('Error menghapus kategori:', err);
      alert('Terjadi kesalahan saat menghapus kategori');
    }
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Kategori
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola daftar kategori untuk transaksi pemasukan dan pengeluaran Anda
        </p>
      </div>

      <div>
        <button
          type="button"
          @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition duration-150 cursor-pointer"
        >
          <Icon icon="carbon:add" class="w-4 h-4 stroke-2" />
          <span>Tambah Kategori</span>
        </button>
      </div>
    </div>

    <!-- Filter Tipe Tab Sederhana -->
    <div class="flex items-center gap-2 border-b border-slate-200/80 pb-3">
      <button
        type="button"
        @click="activeFilter = 'all'"
        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
        :class="
          activeFilter === 'all'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-200/60 bg-slate-100'
        "
      >
        Semua ({{ categories.length }})
      </button>

      <button
        type="button"
        @click="activeFilter = 'masuk'"
        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
        :class="
          activeFilter === 'masuk'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-emerald-700 hover:bg-emerald-100/70 bg-emerald-50'
        "
      >
        Pemasukan ({{ categories.filter((c) => c.tipe === 'masuk').length }})
      </button>

      <button
        type="button"
        @click="activeFilter = 'keluar'"
        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
        :class="
          activeFilter === 'keluar'
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-rose-700 hover:bg-rose-100/70 bg-rose-50'
        "
      >
        Pengeluaran ({{ categories.filter((c) => c.tipe === 'keluar').length }})
      </button>
    </div>

    <!-- Tabel Kategori Sederhana -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-6 font-semibold w-16">NO</th>
              <th class="py-3.5 px-6 font-semibold">NAMA KATEGORI</th>
              <th class="py-3.5 px-6 font-semibold text-center">TIPE</th>
              <th class="py-3.5 px-6 font-semibold text-center w-28">AKSI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <!-- Jika Kosong -->
            <tr v-if="filteredCategories.length === 0">
              <td colspan="5" class="py-10 text-center text-slate-400 text-xs">
                Belum ada kategori dalam daftar ini.
              </td>
            </tr>

            <!-- Baris Data Kategori -->
            <tr
              v-for="(cat, index) in filteredCategories"
              :key="cat.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- Nomor -->
              <td class="py-4 px-6 text-slate-400 text-xs font-medium">
                {{ index + 1 }}
              </td>

              <!-- Nama Kategori -->
              <td class="py-4 px-6 font-bold text-slate-800 text-xs sm:text-sm">
                {{ cat.nama }}
              </td>

              <!-- Tipe Kategori -->
              <td class="py-4 px-6 text-center whitespace-nowrap">
                <span
                  v-if="cat.tipe === 'masuk'"
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

              <!-- Aksi (Edit & Hapus Icon Saja) -->
              <td class="py-4 px-6 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="openEditModal(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Kategori"
                  >
                    <Icon icon="carbon:edit" class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Icon icon="carbon:trash-can" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-3.5 border-t border-slate-100 bg-white text-xs text-slate-400">
        Total: {{ filteredCategories.length }} kategori
      </div>
    </div>

    <!-- Modal Tambah / Edit Kategori Sederhana -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          @click.self="isModalOpen = false"
        >
          <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="font-bold text-slate-800 text-base">
                {{ editingCategory ? 'Edit Kategori' : 'Tambah Kategori' }}
              </h3>
              <button
                type="button"
                @click="isModalOpen = false"
                class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition cursor-pointer"
              >
                <Icon icon="carbon:close" class="w-4 h-4" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSave" class="mt-4 space-y-4">
              <!-- Nama Kategori -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Kategori <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model="form.nama"
                  type="text"
                  required
                  placeholder="Contoh: Makan & Minum"
                  class="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-white"
                />
              </div>

              <!-- Tipe Kategori -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe Kategori <span class="text-rose-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    @click="form.tipe = 'masuk'"
                    class="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    :class="
                      form.tipe === 'masuk'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    "
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Masuk</span>
                  </button>

                  <button
                    type="button"
                    @click="form.tipe = 'keluar'"
                    class="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    :class="
                      form.tipe === 'keluar'
                        ? 'border-rose-400 bg-rose-50 text-rose-600 ring-1 ring-rose-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    "
                  >
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Keluar</span>
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  @click="isModalOpen = false"
                  class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Konfirmasi Hapus Kategori (Reusable Component) -->
    <ConfirmDeleteModal
      v-model="isDeleteModalOpen"
      title="Hapus Kategori?"
      :item-name="itemToDelete?.nama"
      @confirm="executeDelete"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
