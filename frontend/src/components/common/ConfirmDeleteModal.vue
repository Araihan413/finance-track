<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Hapus Data?',
  },
  itemName: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Ya, Hapus',
  },
  cancelText: {
    type: String,
    default: 'Batal',
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const handleCancel = () => {
  isVisible.value = false;
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        @click.self="handleCancel"
      >
        <div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Icon icon="carbon:trash-can" class="w-6 h-6" />
          </div>

          <h3 class="text-base sm:text-lg font-bold text-slate-800 text-center mt-3">
            {{ title }}
          </h3>
          
          <p class="text-xs text-slate-500 text-center mt-1">
            <template v-if="description">
              {{ description }}
            </template>
            <template v-else-if="itemName">
              <strong class="text-slate-700">"{{ itemName }}"</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </template>
            <template v-else>
              Data akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </template>
          </p>

          <div class="flex items-center gap-3 mt-6">
            <button
              type="button"
              @click="handleCancel"
              class="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              @click="handleConfirm"
              class="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition cursor-pointer shadow-sm shadow-rose-500/20"
            >
              {{ confirmText }}
            </button>
          </div>
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
