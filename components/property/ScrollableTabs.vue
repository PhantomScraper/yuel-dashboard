<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  tabs: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollLeft = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const checkScroll = () => {
  if (!containerRef.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = containerRef.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth
}

const scroll = (direction: 'left' | 'right') => {
  if (!containerRef.value) return
  
  const scrollAmount = 200
  const newScrollLeft = direction === 'left' 
    ? containerRef.value.scrollLeft - scrollAmount
    : containerRef.value.scrollLeft + scrollAmount
  
  containerRef.value.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth'
  })
}

onMounted(() => {
  checkScroll()
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', checkScroll)
  }
})
</script>

<template>
  <div class="relative">
    <!-- Scroll Buttons -->
    <button
      v-if="canScrollLeft"
      @click="scroll('left')"
      class="absolute left-0 top-0 bottom-0 w-8 bg-white/80 hover:bg-white flex items-center justify-center z-10"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      v-if="canScrollRight"
      @click="scroll('right')"
      class="absolute right-0 top-0 bottom-0 w-8 bg-white/80 hover:bg-white flex items-center justify-center z-10"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Tabs Container -->
    <div
      ref="containerRef"
      class="overflow-x-auto scrollbar-hide"
      @scroll="checkScroll"
    >
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="emit('update:modelValue', tab)"
          :class="[
            modelValue === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 