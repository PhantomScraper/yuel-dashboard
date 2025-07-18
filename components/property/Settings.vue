<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const visibleColumns = ref<string[]>(props.modelValue)

const updateColumnVisibility = (columnId: string, checked: boolean) => {
  if (checked) {
    visibleColumns.value.push(columnId)
  } else {
    visibleColumns.value = visibleColumns.value.filter(id => id !== columnId)
  }
  emit('update:modelValue', visibleColumns.value)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="p-2 hover:bg-gray-100 rounded-full"
      title="Settings"
    >
      <svg
        class="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg p-2 z-50"
    >
      <div class="px-2 py-1.5 text-sm font-semibold text-gray-700">Visible Columns</div>
      <div class="space-y-1">
        <label
          v-for="column in columns"
          :key="column.id"
          class="flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="visibleColumns.includes(column.id)"
            @change="e => updateColumnVisibility(column.id, (e.target as HTMLInputElement).checked)"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
          />
          {{ column.header }}
        </label>
      </div>
    </div>
  </div>
</template> 