<template>
  <div
    class="flex flex-col items-center justify-center relative transition-all duration-300 gap-1"
    ref="referenceEl"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <v-img
      :id="app.id"
      :src="app.logo"
      :aspect-ratio="1"
      :lazy-src="app.logo"
      :width="app.width * 1.25"
      @click="$emit('open', app.id)"
    />

    <div v-if="app?.opened" class="w-1 h-1 rounded-full bg-white dark:bg-black absolute -bottom-1" />

    <!-- Tooltip + Arrow -->
    <div
      v-if="open"
      ref="floatingEl"
      :style="floatingStyles"
      class="relative px-4 py-1 rounded-md text-sm shadow-lg bg-gray-900 text-white outline-[0.5px] outline-gray-500 pointer-events-none"
    >
      {{ app.title }}
      <div
        ref="arrowEl"
        class="absolute w-2 h-2 rotate-45 bg-gray-900 outline-[0.5px] outline-gray-500 z-10"
        :style="arrowInlineStyles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  arrow as arrowMw
} from '@floating-ui/vue'
import type { AppItem } from '@/types';

defineProps<{ app: AppItem }>()
defineEmits<{ (e: 'open', id: string): void }>()

const open = ref(false)

const referenceEl = ref<HTMLElement | null>(null)
const floatingEl  = ref<HTMLElement | null>(null)
const arrowEl     = ref<HTMLElement | null>(null)

// Arrow size is 8px (w-2 h-2). Give the tooltip a little extra gap
const ARROW_SIZE = 8

const { floatingStyles, middlewareData, placement, update } = useFloating(
  referenceEl,
  floatingEl,
  {
    placement: 'top',
    middleware: [
      offset(ARROW_SIZE + 2), // space for the arrow tip
      flip(),
      shift(),
      arrowMw({ element: arrowEl })
    ],
    whileElementsMounted: autoUpdate
  }
)

watch(open, (isOpen) => {
  if (isOpen) update()
})

// Compute the inline styles for the arrow based on middlewareData + placement
const arrowInlineStyles = computed(() => {
  const arrowData = middlewareData.value?.arrow
  const side = placement.value.split('-')[0] as 'top' | 'right' | 'bottom' | 'left'
  const staticSide: Record<typeof side, 'bottom' | 'left' | 'top' | 'right'> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }

  const styles: Record<string, string> = {}
  if (arrowData) {
    if (arrowData.x != null) styles.left = `${arrowData.x}px`
    if (arrowData.y != null) styles.top = `${arrowData.y}px`
    // Nudge the arrow so its outer tip touches the reference
    styles[staticSide[side]] = `-${ARROW_SIZE / 2}px`
  }
  return styles
})
</script>
