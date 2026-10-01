<script setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'update:isOpen', 'close', 'submit']);

// Tangani v-model maupun v-model:isOpen
const isVisible = computed({
  get: () => (props.isOpen !== undefined ? props.isOpen : props.modelValue),
  set: (val) => {
    emit('update:modelValue', val);
    emit('update:isOpen', val);
  },
});

// Helper tanggal hari ini (format YYYY-MM-DD untuk input type="date")
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const allCategories = ref([]);

// State data formulir transaksi
const form = ref({
  type: 'pengeluaran', // 'pemasukan' | 'pengeluaran'
  date: getTodayDate(),
  category: 'Makan & Minum',
  amount: '',
  description: '',
});

// Filter kategori berdasarkan tipe transaksi yang dipilih (pemasukan -> masuk, pengeluaran -> keluar)
const filteredCategories = computed(() => {
  const targetTipe = form.value.type === 'pemasukan' ? 'masuk' : 'keluar';
  return allCategories.value.filter(
    (c) => (c.tipe || 'keluar').toLowerCase() === targetTipe
  );
});

// Reset formulir ke kondisi awal
const resetForm = () => {
  form.value = {
    type: 'pengeluaran',
    date: getTodayDate(),
    category: '',
    amount: '',
    description: '',
  };
  const firstCategory = filteredCategories.value[0]?.nama || '';
  form.value.category = firstCategory;
};

// Otomatis sesuaikan kategori saat tipe transaksi berubah (Pemasukan vs Pengeluaran)
watch(
  () => form.value.type,
  () => {
    const isCategoryValid = filteredCategories.value.some((c) => c.nama === form.value.category);
    if (!isCategoryValid) {
      form.value.category = filteredCategories.value[0]?.nama || '';
    }
  }
);

// Pantau initialData untuk mengisi formulir saat mode edit
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const transType = (newData.type || newData.tipe || '').toLowerCase() === 'masuk' ? 'pemasukan' : 'pengeluaran';
      form.value = {
        id: newData.id,
        type: transType,
        date: newData.date?.includes('/') ? newData.date.split('/').reverse().join('-') : (newData.date || newData.tanggal || getTodayDate()),
        category: newData.category || newData.kategori || '',
        amount: Math.abs(newData.amount !== undefined ? newData.amount : (newData.jumlah || 0)).toLocaleString('id-ID'),
        description: newData.description || newData.keterangan || '',
      };
      // Periksa apakah kategori cocok dengan tipe transaksi saat ini
      const isCategoryValid = filteredCategories.value.some((c) => c.nama === form.value.category);
      if (!isCategoryValid && filteredCategories.value.length > 0) {
        form.value.category = filteredCategories.value[0].nama;
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Ambil data kategori langsung dari database backend
const fetchCategories = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/kategori');
    const result = await res.json();
    if (result.success && result.data && result.data.length > 0) {
      allCategories.value = result.data.map((c) => ({
        id: c.id,
        nama: c.nama,
        tipe: (c.tipe || 'keluar').toLowerCase(),
      }));
      // Periksa apakah kategori yang dipilih saat ini masih valid
      const isCategoryValid = filteredCategories.value.some((c) => c.nama === form.value.category);
      if (!isCategoryValid) {
        form.value.category = filteredCategories.value[0]?.nama || '';
      }
    }
  } catch (err) {
    console.error('Error saat mengambil data kategori di modal:', err);
  }
};

watch(isVisible, (val) => {
  if (val) {
    fetchCategories();
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});

// Tutup modal dialog
const closeModal = () => {
  isVisible.value = false;
  emit('close');
};

// Format input nominal dengan pemisah ribuan (titik)
const formatAmountInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (!val) {
    form.value.amount = '';
    return;
  }
  form.value.amount = new Intl.NumberFormat('id-ID').format(Number(val));
};

// Simpan atau kirim formulir transaksi
const handleSubmit = () => {
  if (!form.value.amount) return;

  const rawAmount = parseInt(form.value.amount.replace(/\./g, ''), 10) || 0;
  const matchedCat = allCategories.value.find((c) => c.nama === form.value.category);
  const payload = {
    type: form.value.type === 'pemasukan' ? 'Masuk' : 'Keluar',
    category: form.value.category,
    kategori_id: matchedCat?.id || null,
    date: form.value.date,
    amount: form.value.type === 'pemasukan' ? rawAmount : -rawAmount,
    description: form.value.description,
  };

  emit('submit', payload);
  closeModal();
  resetForm();
};

// Tangani penekanan tombol Escape pada keyboard
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isVisible.value) {
    closeModal();
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        @click.self="closeModal"
      >
        <!-- Kartu Dialog Modal -->
        <div
          class="relative w-full max-w-105 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <!-- Bagian Header Modal -->
          <div class="flex items-start justify-between pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon icon="carbon:wallet" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                  {{ initialData ? 'Edit Transaksi' : 'Tambah Transaksi' }}
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ initialData ? 'Perbarui rincian transaksi Anda' : 'Catat rincian alur kas baru' }}
                </p>
              </div>
            </div>

            <!-- Tombol Tutup Modal -->
            <button
              type="button"
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition cursor-pointer"
              aria-label="Tutup"
            >
              <Icon icon="carbon:close" class="w-4 h-4" />
            </button>
          </div>

          <!-- Konten Formulir -->
          <form @submit.prevent="handleSubmit" class="space-y-4 pt-1">
            <!-- Tipe Transaksi -->
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                TIPE TRANSAKSI <span class="text-rose-500">*</span>
              </label>

              <div class="grid grid-cols-2 gap-3">
                <!-- Tombol Opsi Pemasukan -->
                <button
                  type="button"
                  @click="form.type = 'pemasukan'"
                  class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer"
                  :class="
                    form.type === 'pemasukan'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 ring-1 ring-emerald-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  "
                >
                  <Icon icon="carbon:arrow-down" class="w-4 h-4 text-emerald-600" />
                  <span>Pemasukan</span>
                </button>

                <!-- Tombol Opsi Pengeluaran -->
                <button
                  type="button"
                  @click="form.type = 'pengeluaran'"
                  class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer"
                  :class="
                    form.type === 'pengeluaran'
                      ? 'border-rose-400 bg-rose-50/40 text-rose-600 ring-1 ring-rose-400 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  "
                >
                  <Icon icon="carbon:arrow-up" class="w-4 h-4 text-rose-500" />
                  <span>Pengeluaran</span>
                </button>
              </div>
            </div>

            <!-- Tanggal -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer bg-white"
                />
              </div>
            </div>

            <!-- Kategori -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.category"
                  required
                  class="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer bg-white"
                >
                  <option v-if="filteredCategories.length === 0" disabled value="">
                    Tidak ada kategori {{ form.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran' }}
                  </option>
                  <option v-for="cat in filteredCategories" :key="cat.id || cat.nama" :value="cat.nama">
                    {{ cat.nama }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <Icon icon="carbon:chevron-down" class="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- Jumlah -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-slate-400 pointer-events-none">
                  Rp
                </span>
                <input
                  :value="form.amount"
                  @input="formatAmountInput"
                  type="text"
                  required
                  placeholder="50.000"
                  class="w-full border border-slate-200 rounded-xl pl-11 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                Contoh format: 50.000 atau 1.500.000
              </p>
            </div>

            <!-- Keterangan -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Keterangan
              </label>
              <input
                v-model="form.description"
                type="text"
                placeholder="Catatan singkat transaksi..."
                class="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <!-- Tombol Aksi (Batal & Simpan) -->
            <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition cursor-pointer"
              >
                {{ initialData ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
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
