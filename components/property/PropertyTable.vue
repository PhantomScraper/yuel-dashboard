<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  useVueTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/vue-table'
import type { Property } from '~/types/property'
import RowActions from './RowActions.vue'
import { usePropertyStore } from '~/stores/property'

const props = defineProps<{
  data: Property[]
  isLoading?: boolean
  error?: string | null
  visibleColumns?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:note', propertyId: string, note: string): void
}>()

// Use the property store
const propertyStore = usePropertyStore()

// Debug logs for props
console.log('Table Props:', {
  data: props.data,
  isLoading: props.isLoading,
  error: props.error,
  visibleColumns: props.visibleColumns
})

const columnHelper = createColumnHelper<Property>()

const isToday = (date: unknown): boolean => {
  if (!date || typeof date !== 'string') return false
  const today = new Date()
  const propertyDate = new Date(date)
  return (
    propertyDate.getDate() === today.getDate() &&
    propertyDate.getMonth() === today.getMonth() &&
    propertyDate.getFullYear() === today.getFullYear()
  )
}

const formatDate = (date: unknown): string => {
  if (!date || typeof date !== 'string') return ''
  return new Date(date).toLocaleString()
}

type ActionCellData = {
  id: string
  note: string
}

const columns = [
  columnHelper.accessor('address', {
    id: 'address',
    header: 'Address',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('addressCity', {
    id: 'addressCity',
    header: 'City',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('addressState', {
    id: 'addressState',
    header: 'State',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('area', {
    id: 'area',
    header: 'Area (sqft)',
    cell: info => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('baths', {
    id: 'baths',
    header: 'Baths',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('beds', {
    id: 'beds',
    header: 'Beds',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('price', {
    id: 'price',
    header: 'Price',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('yearBuilt', {
    id: 'yearBuilt',
    header: 'Year Built',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('latestSoldYear', {
    id: 'latestSoldYear',
    header: 'Last Sold',
    cell: info => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('saves', {
    id: 'saves',
    header: 'Saves',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('detailUrl', {
    id: 'detailUrl',
    header: 'Details',
    cell: info => {
      const url = info.getValue()
      return url ? 
        h('a', { 
          href: url, 
          target: '_blank', 
          class: 'text-primary hover:underline'
        }, 'View') : 'N/A'
    },
  }),
  columnHelper.accessor('updated_at', {
    id: 'updated_at',
    header: 'Updated At',
    cell: info => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: info => {
      const property = info.row.original
      if (!property) return { id: '', note: '' }
      return {
        id: property.id || '',
        note: property.note || ''
      } as ActionCellData
    },
  }),
]

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})
const pageIndex = ref(0)
const pageSize = ref(10)

// Track expanded rows (for note display)
const expandedRows = ref<Record<string, boolean>>({})

// State for editing note
const editingNote = ref<{ id: string; note: string } | null>(null)

const toggleRowExpanded = (rowId: string) => {
  expandedRows.value[rowId] = !expandedRows.value[rowId]
}

const startEditingNote = (propertyId: string, currentNote: string) => {
  editingNote.value = { id: propertyId, note: currentNote }
}

const saveNote = async () => {
  if (editingNote.value) {
    const { id, note } = editingNote.value
    const success = await propertyStore.updateNote(id, note)
    if (success) {
      emit('update:note', id, note)
      editingNote.value = null
    }
  }
}

const deleteNoteForProperty = async (propertyId: string) => {
  const success = await propertyStore.deleteNote(propertyId)
  if (success) {
    emit('update:note', propertyId, '')
  }
}

const cancelEditNote = () => {
  editingNote.value = null
}

// Create reactive table that will rebuild when data or columns change
const table = computed(() => {
  console.log('Building table with data:', props.data.length, 'items')
  console.log('Visible columns:', props.visibleColumns)
  
  const visibleColumnsList = props.visibleColumns || columns.map(col => col.id || '')
  const filteredColumns = columns.filter(col => 
    col.id === 'actions' || (col.id && visibleColumnsList.includes(col.id))
  )
  
  return useVueTable({
    get data() {
      return props.data
    },
    columns: filteredColumns,
    state: {
      sorting: sorting.value,
      columnFilters: columnFilters.value,
      rowSelection: rowSelection.value,
      pagination: {
        pageIndex: pageIndex.value,
        pageSize: pageSize.value,
      },
    },
    onSortingChange: updaterOrValue => {
      sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
    },
    onColumnFiltersChange: updaterOrValue => {
      columnFilters.value = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters.value) : updaterOrValue
    },
    onRowSelectionChange: updaterOrValue => {
      rowSelection.value = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection.value) : updaterOrValue
    },
    onPaginationChange: updaterOrValue => {
      const newPagination = typeof updaterOrValue === 'function'
        ? updaterOrValue({ pageIndex: pageIndex.value, pageSize: pageSize.value })
        : updaterOrValue
      pageIndex.value = newPagination.pageIndex
      pageSize.value = newPagination.pageSize
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
  })
})

// Reset pagination when data changes
watch(() => props.data, () => {
  console.log('Data changed, resetting pagination')
  pageIndex.value = 0
}, { deep: true })

const getUpdatedAt = (cell: any): string => {
  const value = cell.getValue()
  return typeof value === 'string' ? value : ''
}

// Debug logs for data changes
watch(() => props.data, (newData) => {
  console.log('Table data changed:', newData)
  console.log('Table data length:', newData.length)
}, { deep: true })

watch(() => table.value.getRowModel().rows, (rows) => {
  console.log('Table rows changed:', rows.length)
}, { deep: true })

// Handle note update
const handleNoteUpdate = async (propertyId: string, note: string) => {
  await propertyStore.updateNote(propertyId, note)
  emit('update:note', propertyId, note)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Loading Animation -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="p-4 text-red-600 bg-red-50"
    >
      {{ error }}
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <div
                v-if="!header.isPlaceholder"
                class="flex items-center cursor-pointer"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <span class="ml-1">
                  {{ { asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? '' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="table.getRowModel().rows.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <tr class="hover:bg-gray-50">
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  <template v-if="cell.column.id === 'updated_at'">
                    <div class="flex items-center">
                      <span>{{ formatDate(getUpdatedAt(cell)) }}</span>
                      <span
                        v-if="isToday(getUpdatedAt(cell))"
                        class="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                      >
                        Today
                      </span>
                    </div>
                  </template>
                  <template v-else-if="cell.column.id === 'actions'">
                    <RowActions
                      :property-id="(cell.getValue() as ActionCellData)?.id || ''"
                      :note="(cell.getValue() as ActionCellData)?.note || ''"
                      @update:note="handleNoteUpdate"
                    />
                  </template>
                  <template v-else>
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </template>
                </td>
              </tr>
              
              <!-- Note indicator for properties with notes -->
              <tr v-if="row.original.note" class="bg-gray-50">
                <td :colspan="row.getVisibleCells().length" class="px-6 py-2">
                  <div class="flex items-center">
                    <button 
                      @click="toggleRowExpanded(row.id)"
                      class="flex items-center text-primary hover:text-primary-dark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path v-if="expandedRows[row.id]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="text-xs font-medium">
                        {{ expandedRows[row.id] ? 'Hide note' : 'View note' }}
                      </span>
                    </button>
                  </div>
                  
                  <!-- Expanded note content -->
                  <div v-if="expandedRows[row.id]" class="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                    <!-- View mode -->
                    <div v-if="!editingNote || editingNote.id !== row.original.id" class="flex justify-between items-start">
                      <p class="text-sm text-gray-700">{{ row.original.note }}</p>
                      <button
                        @click="toggleRowExpanded(row.id)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Edit mode -->
                    <div v-else class="mb-3">
                      <textarea 
                        v-model="editingNote.note"
                        class="w-full p-2 border border-gray-300 rounded-md text-sm"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div class="mt-2 flex justify-end">
                      <!-- View mode buttons -->
                      <template v-if="!editingNote || editingNote.id !== row.original.id">
                        <button
                          @click="deleteNoteForProperty(row.original.id)"
                          class="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                        <button
                          @click="startEditingNote(row.original.id, row.original.note || '')"
                          class="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                      </template>
                      
                      <!-- Edit mode buttons -->
                      <template v-else>
                        <button
                          @click="cancelEditNote"
                          class="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          @click="saveNote"
                          class="ml-2 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                        >
                          Save
                        </button>
                      </template>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
          <template v-else>
            <tr>
              <td :colspan="columns.length" class="px-6 py-4 text-center text-sm text-gray-500">
                No data available
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </button>
        <button
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ pageIndex * pageSize + 1 }}</span>
            to
            <span class="font-medium">
              {{ Math.min((pageSize * (pageIndex + 1)), table.getFilteredRowModel().rows.length) }}
            </span>
            of
            <span class="font-medium">{{ table.getFilteredRowModel().rows.length }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()"
            >
              Previous
            </button>
            <button
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :disabled="!table.getCanNextPage()"
              @click="table.nextPage()"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template> 