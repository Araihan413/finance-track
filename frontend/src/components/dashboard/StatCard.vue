<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'emerald', // 'emerald' | 'rose' | 'blue'
  },
  icon: {
    type: String,
    required: true,
  },
});

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'green':
      return {
        iconBg: 'bg-emerald-50 text-emerald-600',
      };
    case 'rose':
    case 'red':
      return {
        iconBg: 'bg-rose-50 text-rose-500',
      };
    case 'blue':
    default:
      return {
        iconBg: 'bg-blue-50 text-blue-600',

      };
  }
});
</script>

<template>
  <div class="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow duration-200 overflow-hidden">

    <!-- Top header: Label & Icon badge -->
    <div class="flex items-center justify-between pl-2">
      <span class="text-xs font-bold tracking-wider text-slate-400">
        {{ title }}
      </span>
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
        :class="variantStyles.iconBg"
      >
        <Icon :icon="icon" class="w-5 h-5" />
      </div>
    </div>

    <!-- Amount value -->
    <div class="mt-3 pl-2">
      <h3 class="text-2xl lg:text-[1.65rem] font-bold text-slate-800 tracking-tight">
        {{ amount }}
      </h3>
    </div>
  </div>
</template>
