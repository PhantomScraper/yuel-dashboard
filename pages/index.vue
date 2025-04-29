<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Property } from '~/types/property'
import PropertyTable from '~/components/property/PropertyTable.vue'
import PropertyFilters from '~/components/property/PropertyFilters.vue'
import Settings from '~/components/property/Settings.vue'
import ScrollableTabs from '~/components/property/ScrollableTabs.vue'
import PropertyStats from '~/components/property/PropertyStats.vue'
import { usePropertyStore } from '~/stores/property'

// Use the property store directly without destructuring
const propertyStore = usePropertyStore()

// Tabs
const tabs = ref(['600K - 1.2M', '1.2M - 5M', '1M - 4M', '600K - 1.3M Filtered', 'Pending Undercontract'])
const activeTab = ref('600K - 1.2M')

// Filter states
const filters = ref({
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  yearBuilt: undefined as number | undefined,
  startDate: '',
  endDate: '',
})

// Column visibility
const columns = [
  { id: 'address', header: 'Address' },
  { id: 'addressCity', header: 'City' },
  { id: 'addressState', header: 'State' },
  { id: 'area', header: 'Area (sqft)' },
  { id: 'baths', header: 'Baths' },
  { id: 'beds', header: 'Beds' },
  { id: 'price', header: 'Price' },
  { id: 'yearBuilt', header: 'Year Built' },
  { id: 'latestSoldYear', header: 'Last Sold' },
  { id: 'saves', header: 'Saves' },
  { id: 'detailUrl', header: 'Details' },
  { id: 'update_at', header: 'Updated At' },
]

const visibleColumns = ref(columns.map(col => col.id))

// Watch for filter changes
watch(filters, (newFilters) => {
  console.log('Filters changed in page:', newFilters)
  propertyStore.applyFilters(newFilters)
}, { deep: true })

// Stats computation
const totalProperties = computed(() => propertyStore.filteredProperties.length || 0)

// Function to check if a date is today
const isToday = (dateString: string): boolean => {
  if (!dateString) return false
  const today = new Date()
  const date = new Date(dateString)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Count properties updated today
const totalUpdatedToday = computed(() => {
  if (!propertyStore.filteredProperties.length) return 0
  return propertyStore.filteredProperties.filter(property => 
    isToday(property.update_at)
  ).length
})

const handleTabChange = async (tab: string) => {
  activeTab.value = tab
  await propertyStore.fetchProperties(activeTab.value)
}

const handleNoteUpdate = async (propertyId: string, note: string) => {
  console.log('Update note:', propertyId, note)
  await propertyStore.updateNote(propertyId, note)
}

// Debug logs
watch(() => propertyStore.filteredProperties, (newData) => {
  console.log('Filtered properties changed:', newData)
}, { deep: true })

// Fetch properties on component mount
onMounted(() => {
  propertyStore.fetchProperties()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Error State -->
      <div v-if="propertyStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ propertyStore.error }}</p>
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Property Dashboard</h1>
          <Settings
            v-model="visibleColumns"
            :columns="columns"
          />
        </div>

        <!-- Stats Section -->
        <PropertyStats
          :total-properties="totalProperties"
          :total-updated-today="totalUpdatedToday"
          class="mb-8"
        />

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow mb-8">
          <ScrollableTabs
            v-model="activeTab"
            :tabs="tabs"
            @update:modelValue="handleTabChange"
          />
        </div>

        <!-- Filters -->
        <PropertyFilters v-model="filters" class="mb-8" />

        <PropertyTable
          :data="propertyStore.filteredProperties"
          :is-loading="propertyStore.isLoading"
          :error="propertyStore.error"
          :visible-columns="visibleColumns"
          @update:note="handleNoteUpdate"
        />
      </template>
    </div>
  </div>
</template>