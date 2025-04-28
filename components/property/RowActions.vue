<script setup lang="ts">
import { ref } from 'vue'
import { usePropertyStore } from '~/stores/property'

const props = defineProps<{
  propertyId: string
  note: string
}>()

const emit = defineEmits<{
  (e: 'update:note', propertyId: string, note: string): void
}>()

// Use the property store
const propertyStore = usePropertyStore()

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
</script>

<template>
  <div class="flex space-x-2">
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