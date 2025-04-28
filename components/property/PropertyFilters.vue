<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: {
    minPrice?: number
    maxPrice?: number
    yearBuilt?: number
    startDate?: string
    endDate?: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// Local state for filters
const filters = ref({
  minPrice: props.modelValue.minPrice,
  maxPrice: props.modelValue.maxPrice,
  yearBuilt: props.modelValue.yearBuilt,
  startDate: props.modelValue.startDate || '',
  endDate: props.modelValue.endDate || '',
})

// Update parent when local state changes
watch(filters, (newFilters) => {
  emit('update:modelValue', { ...newFilters })
}, { deep: true })

// Watch for changes in props
watch(() => props.modelValue, (newValue) => {
  filters.value = {
    minPrice: newValue.minPrice,
    maxPrice: newValue.maxPrice,
    yearBuilt: newValue.yearBuilt,
    startDate: newValue.startDate || '',
    endDate: newValue.endDate || '',
  }
}, { deep: true })

// Clear all filters
const clearFilters = () => {
  filters.value = {
    minPrice: undefined,
    maxPrice: undefined,
    yearBuilt: undefined,
    startDate: '',
    endDate: '',
  }
}

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return (
    filters.value.minPrice !== undefined ||
    filters.value.maxPrice !== undefined ||
    filters.value.yearBuilt !== undefined ||
    !!filters.value.startDate ||
    !!filters.value.endDate
  )
})

// Format date for input field
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Set default date range to last 7 days
const setLastWeek = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  
  filters.value.startDate = formatDateForInput(start)
  filters.value.endDate = formatDateForInput(end)
}

// Set default date range to last 30 days
const setLastMonth = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  filters.value.startDate = formatDateForInput(start)
  filters.value.endDate = formatDateForInput(end)
}

// Set date range to today only
const setToday = () => {
  const today = new Date()
  const dateStr = formatDateForInput(today)
  
  filters.value.startDate = dateStr
  filters.value.endDate = dateStr
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 md:mb-0">Filters</h2>
      <div class="flex space-x-2">
        <button
          @click="setToday"
          class="px-4 py-2 text-xs font-medium text-primary bg-primary-50 rounded-md hover:bg-primary-100"
        >
          Today
        </button>
        <button
          @click="setLastWeek"
          class="px-4 py-2 text-xs font-medium text-primary bg-primary-50 rounded-md hover:bg-primary-100"
        >
          Last 7 days
        </button>
        <button
          @click="setLastMonth"
          class="px-4 py-2 text-xs font-medium text-primary bg-primary-50 rounded-md hover:bg-primary-100"
        >
          Last 30 days
        </button>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Price Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
        <input
          v-model.number="filters.minPrice"
          type="number"
          placeholder="Min Price"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
        <input
          v-model.number="filters.maxPrice"
          type="number"
          placeholder="Max Price"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      
      <!-- Year Built -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
        <input
          v-model.number="filters.yearBuilt"
          type="number"
          placeholder="Year Built"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      
      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
        <input
          v-model="filters.startDate"
          type="date"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
        <input
          v-model="filters.endDate"
          type="date"
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  </div>
</template> 