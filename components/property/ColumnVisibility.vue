<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  columns: {
    id: string
    header: string
  }[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const visibleColumns = ref<string[]>(props.modelValue)

watch(visibleColumns, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow mb-8">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Visible Columns</h3>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <label
        v-for="column in columns"
        :key="column.id"
        class="flex items-center space-x-3"
      >
        <input
          type="checkbox"
          :checked="visibleColumns.includes(column.id)"
          @change="e => {
            if ((e.target as HTMLInputElement).checked) {
              visibleColumns.push(column.id)
            } else {
              visibleColumns = visibleColumns.filter(col => col !== column.id)
            }
          }"
          class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <span class="text-sm text-gray-700">{{ column.header }}</span>
      </label>
    </div>
  </div>
</template> 