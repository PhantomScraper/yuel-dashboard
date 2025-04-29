<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePropertyStore } from '~/stores/property'

const props = defineProps<{
  propertyId: string
  note: string
  priceChanges?: Array<{ price: number, updated_at?: string, update_at?: string }>
}>()

const emit = defineEmits<{
  (e: 'update:note', propertyId: string, note: string): void
  (e: 'toggle:priceHistory', propertyId: string): void
}>()

// Use the property store
const propertyStore = usePropertyStore()

// Check if current tab is a price tracking tab
const isPriceTrackingTab = computed(() => {
  const currentTab = propertyStore.currentTab
  console.log('Current tab in RowActions:', currentTab)
  return currentTab === 'Tracking price 600_1.2M' || currentTab === 'Tracking price 1.2M_5M'
})

// Track if the note modal is open
const isNoteModalOpen = ref(false)
// Note content in the modal
const noteContent = ref(props.note)

// Open the note modal and populate with existing note if it exists
const openNoteModal = () => {
  noteContent.value = props.note
  isNoteModalOpen.value = true
}

// Close the note modal
const closeNoteModal = () => {
  isNoteModalOpen.value = false
}

// Save the note
const saveNote = async () => {
  try {
    const success = await propertyStore.updateNote(props.propertyId, noteContent.value)
    if (success) {
      emit('update:note', props.propertyId, noteContent.value)
      closeNoteModal()
    }
  } catch (error) {
    console.error('Error updating note:', error)
  }
}

// Toggle price history visibility
const togglePriceHistory = () => {
  console.log('Toggle price history from RowActions, property ID:', props.propertyId)
  emit('toggle:priceHistory', props.propertyId)
}

// Check if a property has price history data
const hasPriceChanges = computed(() => {
  const result = !!props.priceChanges && 
         Array.isArray(props.priceChanges) && 
         props.priceChanges.length > 0
  console.log('Property has price changes:', result, props.priceChanges)
  return result
})

// Debug information
console.log('RowActions props:', {
  propertyId: props.propertyId,
  hasNote: !!props.note,
  priceChanges: props.priceChanges,
  isPriceTrackingTab: isPriceTrackingTab.value,
  hasPriceChanges: hasPriceChanges.value
})
</script>

<template>
  <div class="flex space-x-2">
    <!-- Note button -->
    <button
      @click="openNoteModal"
      class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center"
    >
      <template v-if="note">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit note
      </template>
      <template v-else>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add note
      </template>
    </button>

    <!-- Price history button - always show in price tracking tabs for debugging -->
    <button 
      v-if="isPriceTrackingTab"
      @click="togglePriceHistory"
      class="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      History
    </button>

    <!-- Note Modal -->
    <div 
      v-if="isNoteModalOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeNoteModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ note ? 'Edit Note' : 'Add Note' }}
        </h3>
        
        <textarea
          v-model="noteContent"
          rows="4"
          class="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-primary focus:border-primary"
          placeholder="Add your note here..."
        ></textarea>
        
        <div class="flex justify-end space-x-2">
          <button
            @click="closeNoteModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="saveNote"
            class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>