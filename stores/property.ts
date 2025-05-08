import { defineStore } from 'pinia'
import type { Property } from '~/types/property'

type FilterOptions = {
  minPrice?: number
  maxPrice?: number
  yearBuilt?: number
  startDate?: string
  endDate?: string
  priceChanges?: boolean
}

type TabName = '600K - 1.2M' | '1.2M - 5M' | '1M - 4M' | '600K - 1.3M Filtered' | 'Pending Undercontract' | 'Tracking price 600_1.2M' | 'Tracking price 1.2M_5M'

const TAB_COLLECTIONS: Record<TabName, string> = {
  '600K - 1.2M': '600_1.2M',
  '1.2M - 5M': '1.2M_5M',
  '1M - 4M': '1M_4M',
  '600K - 1.3M Filtered': '600_1.3M',
  'Pending Undercontract': 'pending_under_contract',
  'Tracking price 600_1.2M': '600_1.2M',
  'Tracking price 1.2M_5M': '1.2M_5M',
}

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Property[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<FilterOptions>({})
  const filteredProperties = ref<Property[]>([])
  const currentTab = ref<TabName>('600K - 1.2M')
  const currentCollection = ref(TAB_COLLECTIONS[currentTab.value])

  // API endpoints
  const API_ENDPOINTS = {
    GET_PROPERTIES: '/api/properties',
    UPDATE_NOTE: '/api/properties/note',
    DELETE_NOTE: '/api/properties/note',
  }

  const shouldSortByCreatedAt = computed(() => {
    return currentTab.value === '600K - 1.2M' || currentTab.value === '1.2M - 5M'
  })

  const fetchProperties = async (tab?: TabName) => {
    isLoading.value = true
    error.value = null

    try {
      if (tab) {
        currentTab.value = tab
        currentCollection.value = TAB_COLLECTIONS[tab]
      }

      console.log('Fetching properties from collection:', currentCollection.value)

      // Prepare query parameters
      const queryParams = new URLSearchParams()
      queryParams.append('collection', currentCollection.value)

      // Add filter parameters
      if (!!filters.value.minPrice) {
        queryParams.append('minPrice', filters.value.minPrice.toString())
      }

      if (!!filters.value.maxPrice) {
        queryParams.append('maxPrice', filters.value.maxPrice.toString())
      }

      if (!!filters.value.yearBuilt) {
        queryParams.append('yearBuilt', filters.value.yearBuilt.toString())
      }

      if (!!filters.value.startDate) {
        queryParams.append('startDate', filters.value.startDate)
      }

      if (!!filters.value.endDate) {
        queryParams.append('endDate', filters.value.endDate)
      }

      if (tab === 'Tracking price 600_1.2M' || tab === 'Tracking price 1.2M_5M') {
        queryParams.append('priceChanges', 'true')
      }

      // Fetch data from API with query parameters
      const response = await fetch(`${API_ENDPOINTS.GET_PROPERTIES}?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

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
        insertedAt: item.insertedAt || new Date().toISOString(),
        note: item.note || '',
        priceChanges: item.priceChanges || [],
      })) as Property[]

      // We're doing server-side filtering now, so we can just use the returned data
      filteredProperties.value = [...properties.value]

      console.log('Properties updated:', properties.value.length)
    } catch (e) {
      console.error('Error fetching properties:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      properties.value = []
      filteredProperties.value = []
    } finally {
      isLoading.value = false
    }
  }

  const updateNote = async (propertyId: string, note: string) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Updating note for property:', propertyId)

      const response = await fetch(API_ENDPOINTS.UPDATE_NOTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          note,
          collection: currentCollection.value
        }),
      })

      if (!response.ok) throw new Error('Failed to update note')

      const result = await response.json()
      console.log('Note updated:', result)

      // Update local state
      const propertyIndex = properties.value.findIndex(p => p.id === propertyId)
      if (propertyIndex !== -1) {
        properties.value[propertyIndex].note = note
        properties.value[propertyIndex].update_at = result.update_at

        // Update filtered properties too
        const filteredIndex = filteredProperties.value.findIndex(p => p.id === propertyId)
        if (filteredIndex !== -1) {
          filteredProperties.value[filteredIndex].note = note
          filteredProperties.value[filteredIndex].update_at = result.update_at
        }
      }

      return true
    } catch (e) {
      console.error('Error updating note:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteNote = async (propertyId: string) => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Deleting note for property:', propertyId)

      // Add collection as query parameter
      const queryParams = new URLSearchParams()
      queryParams.append('collection', currentCollection.value)

      const response = await fetch(`${API_ENDPOINTS.DELETE_NOTE}/${propertyId}?${queryParams.toString()}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete note')

      const result = await response.json()
      console.log('Note deleted for property:', result)

      // Update local state
      const propertyIndex = properties.value.findIndex(p => p.id === propertyId)
      if (propertyIndex !== -1) {
        properties.value[propertyIndex].note = ''
        properties.value[propertyIndex].update_at = result.update_at

        // Update filtered properties too
        const filteredIndex = filteredProperties.value.findIndex(p => p.id === propertyId)
        if (filteredIndex !== -1) {
          filteredProperties.value[filteredIndex].note = ''
          filteredProperties.value[filteredIndex].update_at = result.update_at
        }
      }

      return true
    } catch (e) {
      console.error('Error deleting note:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const applyFilters = (options: FilterOptions) => {
    console.log('Applying filters:', options)
    filters.value = options

    fetchProperties(currentTab.value)
  }

  // Initialize
  onMounted(() => {
    fetchProperties()
  })

  return {
    properties,
    filteredProperties,
    isLoading,
    error,
    filters,
    currentTab,
    currentCollection,
    fetchProperties,
    applyFilters,
    updateNote,
    deleteNote,
  }
})