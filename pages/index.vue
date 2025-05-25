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
const tabs = ref([
  '600K - 1.2M',
  '1.2M - 5M',
  //'1M - 4M',
  //'600K - 1.3M Filtered',
  // 'Pending Undercontract',
  'Tracking price 600_1.2M',
  'Tracking price 1.2M_5M'
  ])
const activeTab = ref('600K - 1.2M')

const isRegularTab = computed(() => {
  return activeTab.value === '600K - 1.2M' || activeTab.value === '1.2M - 5M'
})

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

// Download all links function
const downloadAllLinks = () => {
  // Filter out properties that don't have detailUrl or have empty/null detailUrl
  const validLinks = propertyStore.filteredProperties
    .filter(property => property.detailUrl && property.detailUrl.trim() !== '')
    .map(property => property.detailUrl)
  
  if (validLinks.length === 0) {
    alert('No valid links found to download')
    return
  }
  
  // Create content with each link on a new line
  const content = validLinks.join('\n')
  
  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `property-links-${activeTab.value.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

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

const totalUpdatedToday = computed(() => {
  if (!propertyStore.filteredProperties.length) return 0
  
  return propertyStore.filteredProperties.filter(property => {
    if (isRegularTab.value) {
      // For regular tabs, check insertedAt
      return isToday(property.insertedAt)
    } else {
      // For tracking tabs, check update_at
      return isToday(property.update_at)
    }
  }).length
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

        <!-- Download Button Section -->
        <div class="mb-4">
          <button
            @click="downloadAllLinks"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            :disabled="!propertyStore.filteredProperties || propertyStore.filteredProperties.length === 0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download All Links
          </button>
        </div>

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