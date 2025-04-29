import { ref, computed, watch } from 'vue'
import type { Property } from '~/types/property'

type FilterOptions = {
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  yearBuilt?: number
  advancedSearch?: string
}

export const usePropertyData = () => {
  const properties = ref<Property[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<FilterOptions>({})
  const filteredProperties = ref<Property[]>([])

  const applyFilters = (options: FilterOptions) => {
    console.log('Applying filters:', options)
    filters.value = options
  }

  const updateFilteredProperties = () => {
    if (!properties.value.length) {
      console.log('No properties available for filtering')
      filteredProperties.value = []
      return
    }

    console.log('Filtering properties with options:', filters.value)
    console.log('Total properties before filtering:', properties.value.length)

    const filtered = properties.value.filter(property => {
      const currentFilters = filters.value

      // City filter
      if (currentFilters.city && property.addressCity && 
          !property.addressCity.toLowerCase().includes(currentFilters.city.toLowerCase())) {
        return false
      }

      // State filter
      if (currentFilters.state && property.addressState && 
          !property.addressState.toLowerCase().includes(currentFilters.state.toLowerCase())) {
        return false
      }

      // Price range filter
      if (currentFilters.minPrice !== undefined && property.price < currentFilters.minPrice) {
        return false
      }
      if (currentFilters.maxPrice !== undefined && property.price > currentFilters.maxPrice) {
        return false
      }

      // Year built filter
      if (currentFilters.yearBuilt !== undefined && property.yearBuilt !== currentFilters.yearBuilt) {
        return false
      }

      // Advanced search
      if (currentFilters.advancedSearch) {
        const search = currentFilters.advancedSearch.toLowerCase()
        const searchableFields = [
          property.address,
          property.addressCity,
          property.addressState,
          property.brokerName,
          property.detailUrl,
        ].filter(Boolean)

        if (!searchableFields.some(field => field.toLowerCase().includes(search))) {
          return false
        }
      }

      return true
    })

    console.log('Properties after filtering:', filtered.length)
    filteredProperties.value = filtered
  }

  // Watch for changes in filters
  watch(filters, () => {
    console.log('Filters changed, updating filtered properties')
    updateFilteredProperties()
  }, { deep: true })

  // Watch for changes in properties
  watch(properties, () => {
    console.log('Properties changed, updating filtered properties')
    updateFilteredProperties()
  }, { deep: true })

  const fetchProperties = async () => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Fetching properties from API...')
      const response = await fetch('/api/properties')
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      console.log('API Response:', data)

      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API')
      }

      // Ensure all required fields are present
      properties.value = data.map(item => ({
        id: item.id || '',
        address: item.address || '',
        addressCity: item.addressCity || '',
        addressState: item.addressState || '',
        addressStreet: item.addressStreet || '',
        addressZipcode: item.addressZipcode || '',
        area: Number(item.area) || 0,
        baths: Number(item.baths) || 0,
        beds: Number(item.beds) || 0,
        brokerName: item.brokerName || '',
        detailUrl: item.detailUrl || '',
        price: Number(item.price) || 0,
        saves: Number(item.saves) || 0,
        latestSoldYear: Number(item.latestSoldYear) || 0,
        yearBuilt: Number(item.yearBuilt) || 0,
        update_at: item.update_at || new Date().toISOString(),
        note: item.note || '',
      })) as Property[]

      console.log('Properties updated:', properties.value)
    } catch (e) {
      console.error('Error fetching properties:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      properties.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    properties,
    filteredProperties,
    isLoading,
    error,
    fetchProperties,
    applyFilters,
  }
} 