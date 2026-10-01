<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import TransactionTable from '@/components/transaction/TransactionTable.vue';
import AddTransactionModal from '@/components/common/AddTransactionModal.vue';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue';
import Papa from 'papaparse';

// State list transaksi dari backend
const transactions = ref([]);
const totalCount = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const limit = 10;
const isLoading = ref(false);

// Filter States
const searchQuery = ref('');
const selectedType = ref('all');
const selectedCategory = ref('all');
const sortBy = ref('latest');

// Categories list from backend with type support
const rawCategories = ref([]);

// Categories available for filtering based on selected transaction type
const availableFilterCategories = computed(() => {
  if (selectedType.value === 'all') {
    return rawCategories.value;
  }
  return rawCategories.value.filter(
    (c) => (c.tipe || 'keluar').toLowerCase() === selectedType.value.toLowerCase()
  );
});

// Check if any filter is active
const hasActiveFilter = computed(() => {
  return searchQuery.value !== '' || selectedType.value !== 'all' || selectedCategory.value !== 'all' || sortBy.value !== 'latest';
});

// Reset all filters
const resetFilters = () => {
  searchQuery.value = '';
  selectedType.value = 'all';
  selectedCategory.value = 'all';
  sortBy.value = 'latest';
  currentPage.value = 1;
  loadTransactions();
};

// Fetch categories from backend
const loadCategories = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/kategori');
    const result = await res.json();
    if (result.success) {
      rawCategories.value = result.data.map((c) => ({
        id: c.id,
        nama: c.nama,
        tipe: (c.tipe || 'keluar').toLowerCase(),
      }));
    }
  } catch (err) {
    console.error('Error memuat kategori:', err);
  }
};

// Fetch transactions with filter & pagination from backend
const loadTransactions = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: limit,
      tipe: selectedType.value,
      kategori: selectedCategory.value,
      search: searchQuery.value.trim(),
    });

    const res = await fetch(`http://localhost:3000/api/transaksi?${params.toString()}`);
    const result = await res.json();

    if (result.success) {
      let data = result.data;

      // Handle client-side sorting if needed
      if (sortBy.value === 'highest') {
        data.sort((a, b) => Number(b.jumlah) - Number(a.jumlah));
      } else if (sortBy.value === 'lowest') {
        data.sort((a, b) => Number(a.jumlah) - Number(b.jumlah));
      } else if (sortBy.value === 'oldest') {
        data.sort((a, b) => a.id - b.id);
      }

      transactions.value = data;
      totalCount.value = result.total;
      totalPages.value = result.totalPages || 1;
    }
  } catch (err) {
    console.error('Error memuat data transaksi:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watchers for filters (debounce/trigger reload)
let searchTimeout = null;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadTransactions();
  }, 300);
});

// Pantau perubahan tipe transaksi (otomatis reset kategori jika tidak cocok)
watch(selectedType, () => {
  if (selectedCategory.value !== 'all') {
    const isValid = availableFilterCategories.value.some((c) => c.nama === selectedCategory.value);
    if (!isValid) {
      selectedCategory.value = 'all';
      // Mengubah selectedCategory akan memicu watcher di bawah, jadi cukup return agar tidak double fetch
      return;
    }
  }
  currentPage.value = 1;
  loadTransactions();
});

// Pantau filter kategori dan urutan sorting
watch([selectedCategory, sortBy], () => {
  currentPage.value = 1;
  loadTransactions();
});

// Pagination handlers
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadTransactions();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadTransactions();
  }
};

// Modal Add / Edit state
const isModalOpen = ref(false);
const editingItem = ref(null);

const handleOpenAdd = () => {
  editingItem.value = null;
  isModalOpen.value = true;
};

const handleEdit = (item) => {
  editingItem.value = {
    ...item,
    amount: item.jumlah !== undefined ? item.jumlah : item.amount,
    type: item.tipe || item.type,
    category: item.kategori || item.category,
    description: item.keterangan || item.description,
    date: item.tanggal || item.date,
  };
  isModalOpen.value = true;
};

// Save transaction (POST or PUT to backend)
const handleSaveTransaction = async (payload) => {
  try {
    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      console.log(e)
    }

    const bodyData = {
      user_id: savedUser?.id || 1,
      kategori_id: payload.kategori_id || null,
      tanggal: payload.date,
      kategori: payload.category,
      tipe: payload.type,
      keterangan: payload.description,
      jumlah: Math.abs(payload.amount),
    };

    if (editingItem.value && editingItem.value.id) {
      // Edit: PUT /api/transaksi/:id
      const res = await fetch(`http://localhost:3000/api/transaksi/${editingItem.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (result.success) {
        loadTransactions();
      } else {
        alert(result.message || 'Gagal memperbarui transaksi');
      }
    } else {
      // Add: POST /api/transaksi
      const res = await fetch('http://localhost:3000/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (result.success) {
        loadTransactions();
      } else {
        alert(result.message || 'Gagal menambahkan transaksi');
      }
    }
  } catch (err) {
    console.error('Error menyimpan transaksi:', err);
    alert('Terjadi kesalahan saat menyimpan transaksi!');
  }
};

// Delete confirmation modal state
const isDeleteModalOpen = ref(false);
const itemToDelete = ref(null);

const confirmDelete = (item) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (itemToDelete.value) {
    try {
      const res = await fetch(`http://localhost:3000/api/transaksi/${itemToDelete.value.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        isDeleteModalOpen.value = false;
        itemToDelete.value = null;
        loadTransactions();
      }
    } catch (err) {
      console.error('Error menghapus transaksi:', err);
    }
  }
};

// State & fungsi Export CSV
const isExporting = ref(false);

const exportToCSV = async () => {
  if (isExporting.value) return;
  isExporting.value = true;

  try {
    // Ambil data transaksi sesuai filter yang sedang aktif (limit besar agar mencakup semua data)
    const params = new URLSearchParams({
      page: 1,
      limit: 10000,
      tipe: selectedType.value,
      kategori: selectedCategory.value,
      search: searchQuery.value.trim(),
    });

    const res = await fetch(`http://localhost:3000/api/transaksi?${params.toString()}`);
    const result = await res.json();

    if (!result.success || !result.data || result.data.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor!');
      return;
    }

    const dataToExport = result.data;

    // Siapkan data objek terformat
    const formattedData = dataToExport.map((item, index) => ({
      No: index + 1,
      Tanggal: String(item.tanggal || '').split('T')[0],
      Tipe: (item.tipe || '').toLowerCase() === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: item.kategori || 'Lainnya',
      'Jumlah (Rp)': Number(item.jumlah || 0),
      Keterangan: item.keterangan || '',
    }));

    // Konversi ke format CSV secara otomatis menggunakan library PapaParse
    const csvContent = Papa.unparse(formattedData);

    // Unduh file CSV dengan BOM UTF-8 (\uFEFF) untuk kompatibilitas Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.href = url;
    link.download = `transaksi-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error saat mengekspor CSV:', err);
    alert('Terjadi kesalahan saat mengekspor data CSV!');
  } finally {
    isExporting.value = false;
  }
};

onMounted(() => {
  loadCategories();
  loadTransactions();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Daftar Transaksi
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola dan pantau seluruh catatan pemasukan dan pengeluaran Anda
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Tombol Export CSV -->
        <button
          type="button"
          @click="exportToCSV"
          :disabled="isExporting"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition duration-150 cursor-pointer disabled:opacity-50"
          title="Ekspor data transaksi saat ini ke format CSV"
        >
          <Icon icon="carbon:document-export" class="w-4 h-4 text-emerald-600" />
          <span>{{ isExporting ? 'Mengekspor...' : 'Export CSV' }}</span>
        </button>

        <!-- Tombol Tambah Transaksi -->
        <button
          type="button"
          @click="handleOpenAdd"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition duration-150 cursor-pointer"
        >
          <Icon icon="carbon:add" class="w-4 h-4 stroke-2" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 w-full">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Icon icon="carbon:search" class="w-4 h-4" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi atau keterangan..."
          class="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition bg-white"
        />
      </div>

      <!-- Filter Controls Row -->
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <!-- Filter Tipe -->
        <div class="relative flex-1 sm:flex-initial min-w-32.5">
          <select
            v-model="selectedType"
            class="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer bg-white"
          >
            <option value="all">Semua Tipe</option>
            <option value="Masuk">Pemasukan</option>
            <option value="Keluar">Pengeluaran</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <Icon icon="carbon:chevron-down" class="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Filter Kategori -->
        <div class="relative flex-1 sm:flex-initial min-w-35">
          <select
            v-model="selectedCategory"
            class="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer bg-white"
          >
            <option value="all">Semua Kategori</option>
            <option v-for="cat in availableFilterCategories" :key="cat.id || cat.nama" :value="cat.nama">
              {{ cat.nama }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <Icon icon="carbon:chevron-down" class="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Sort By -->
        <div class="relative flex-1 sm:flex-initial min-w-32.5">
          <select
            v-model="sortBy"
            class="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer bg-white"
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Nominal Terbesar</option>
            <option value="lowest">Nominal Terkecil</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <Icon icon="carbon:chevron-down" class="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Reset Button -->
        <button
          v-if="hasActiveFilter"
          type="button"
          @click="resetFilters"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200 transition cursor-pointer"
          title="Reset Semua Filter"
        >
          <Icon icon="carbon:reset" class="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- Table Component -->
    <div>
      <TransactionTable
        :transactions="transactions"
        :total-count="totalCount"
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev-page="prevPage"
        @next-page="nextPage"
        @edit="handleEdit"
        @delete="confirmDelete"
      />
    </div>

    <!-- Add / Edit Modal -->
    <AddTransactionModal
      v-model="isModalOpen"
      :initial-data="editingItem"
      @submit="handleSaveTransaction"
    />

    <!-- Modal Konfirmasi Hapus Transaksi (Reusable Component) -->
    <ConfirmDeleteModal
      v-model="isDeleteModalOpen"
      title="Hapus Transaksi?"
      :item-name="itemToDelete?.keterangan || itemToDelete?.description"
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
