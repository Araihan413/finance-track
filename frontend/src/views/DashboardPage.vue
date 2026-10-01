<script setup>
import { ref, onMounted } from 'vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import TransactionTable from '@/components/dashboard/TransactionTable.vue';

// Stat summary data
const stats = ref([
  {
    id: 'income',
    title: 'Total Pemasukan',
    amount: 'Rp 0',
    variant: 'emerald',
    icon: 'carbon:arrow-down',
  },
  {
    id: 'expense',
    title: 'Total Pengeluaran',
    amount: 'Rp 0',
    variant: 'rose',
    icon: 'carbon:arrow-up',
  },
  {
    id: 'balance',
    title: 'Sisa Saldo',
    amount: 'Rp 0',
    variant: 'blue',
    icon: 'carbon:wallet',
  },
]);

const recentTransactions = ref([]);
const totalTransactions = ref(0);
const isLoading = ref(false);

// Format Rupiah
const formatRupiah = (val) => {
  return `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
};

// Fetch Dashboard Data from Backend
const loadDashboardData = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Ringkasan Summary
    const summaryRes = await fetch('http://localhost:3000/api/transaksi/summary');
    const summaryResult = await summaryRes.json();
    if (summaryResult.success) {
      stats.value[0].amount = formatRupiah(summaryResult.data.totalMasuk);
      stats.value[1].amount = formatRupiah(summaryResult.data.totalKeluar);
      stats.value[2].amount = formatRupiah(summaryResult.data.sisaSaldo);
    }

    // 2. Fetch 5 Transaksi Terakhir
    const txRes = await fetch('http://localhost:3000/api/transaksi?page=1&limit=5');
    const txResult = await txRes.json();
    if (txResult.success) {
      recentTransactions.value = txResult.data;
      totalTransactions.value = txResult.total;
    }
  } catch (error) {
    console.error('Error memuat data dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Header: Title -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Ringkasan keuangan Anda
        </p>
      </div>
    </div>

    <!-- Summary Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        v-for="stat in stats"
        :key="stat.id"
        :title="stat.title"
        :amount="stat.amount"
        :variant="stat.variant"
        :icon="stat.icon"
      />
    </div>

    <!-- Recent Transactions Table Section (Modular Component) -->
    <div>
      <TransactionTable
        :transactions="recentTransactions"
        :total-count="totalTransactions"
      />
    </div>
  </div>
</template>
