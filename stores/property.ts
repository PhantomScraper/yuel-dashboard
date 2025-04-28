import { defineStore } from 'pinia'
import type { Property } from '~/types/property'

type FilterOptions = {
  minPrice?: number
  maxPrice?: number
  yearBuilt?: number
  startDate?: string
  endDate?: string
}

export const usePropertyStore = defineStore('property', () => {
  const properties = ref<Property[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<FilterOptions>({})
  const filteredProperties = ref<Property[]>([])

  // Mock API endpoints
  const API_ENDPOINTS = {
    GET_PROPERTIES: '/api/properties',
    UPDATE_NOTE: '/api/properties/note',
    DELETE_NOTE: '/api/properties/note',
  }

  const fetchProperties = async () => {
    isLoading.value = true
    error.value = null
    try {
      console.log('Fetching properties from API...')
      const response = await fetch(API_ENDPOINTS.GET_PROPERTIES)
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
        updated_at: item.updated_at || new Date().toISOString(),
        note: item.note || '',
      })) as Property[]

      // Apply current filters after fetching
      updateFilteredProperties()
      console.log('Properties updated:', properties.value)
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
      
      // In a real app, this would be a POST/PUT request
      const response = await fetch(API_ENDPOINTS.UPDATE_NOTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId, note }),
      })
      
      if (!response.ok) throw new Error('Failed to update note')
      
      // Mock response - in real app would come from server
      const updatedProperty = { propertyId, note }
      console.log('Note updated:', updatedProperty)
      
      // Update local state
      const propertyIndex = properties.value.findIndex(p => p.id === propertyId)
      if (propertyIndex !== -1) {
        properties.value[propertyIndex].note = note
        
        // Update filtered properties too
        const filteredIndex = filteredProperties.value.findIndex(p => p.id === propertyId)
        if (filteredIndex !== -1) {
          filteredProperties.value[filteredIndex].note = note
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
      
      // In a real app, this would be a DELETE request
      const response = await fetch(`${API_ENDPOINTS.DELETE_NOTE}/${propertyId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete note')
      
      console.log('Note deleted for property:', propertyId)
      
      // Update local state
      const propertyIndex = properties.value.findIndex(p => p.id === propertyId)
      if (propertyIndex !== -1) {
        properties.value[propertyIndex].note = ''
        
        // Update filtered properties too
        const filteredIndex = filteredProperties.value.findIndex(p => p.id === propertyId)
        if (filteredIndex !== -1) {
          filteredProperties.value[filteredIndex].note = ''
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
    updateFilteredProperties()
  }

  // Helper function to check if a date is within a range
  const isDateInRange = (dateStr: string, startDate?: string, endDate?: string): boolean => {
    if (!dateStr) return false
    if (!startDate && !endDate) return true
    
    const date = new Date(dateStr)
    
    if (startDate) {
      const start = new Date(startDate)
      if (date < start) return false
    }
    
    if (endDate) {
      const end = new Date(endDate)
      // Set to end of day
      end.setHours(23, 59, 59, 999)
      if (date > end) return false
    }
    
    return true
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

      // Date range filter
      if (!isDateInRange(property.updated_at, currentFilters.startDate, currentFilters.endDate)) {
        return false
      }

      return true
    })

    console.log('Properties after filtering:', filtered.length)
    filteredProperties.value = filtered
  }

  // Initialize
  onMounted(() => {
    fetchProperties()
  })

  // Watch for filter changes
  watch(filters, () => {
    console.log('Filters changed, updating filtered properties')
    updateFilteredProperties()
  }, { deep: true })

  return {
    properties,
    filteredProperties,
    isLoading,
    error,
    filters,
    fetchProperties,
    applyFilters,
    updateNote,
    deleteNote,
  }
}) 