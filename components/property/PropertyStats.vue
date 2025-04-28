<script setup lang="ts">
defineProps<{
  totalProperties: number
  totalUpdatedToday: number
}>()

// Format number with thousands separator
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold text-gray-700">Total Properties</h3>
      <p class="text-3xl font-bold text-primary">{{ formatNumber(totalProperties) }}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold text-gray-700">Updated Today</h3>
      <p class="text-3xl font-bold text-primary">{{ formatNumber(totalUpdatedToday) }}</p>
      <p class="text-sm text-gray-500 mt-1">
        {{ totalUpdatedToday > 0 ? `${Math.round((totalUpdatedToday / totalProperties) * 100)}% of total` : 'No updates today' }}
      </p>
    </div>
  </div>
</template> 