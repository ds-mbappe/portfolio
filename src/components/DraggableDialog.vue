<template>
  <div
    v-if="modelValue"
    class="absolute inset-0 w-full h-full cursor-default select-none"
    aria-hidden="false"
  >
    <!-- Overlay confined to the drop zone -->
    <div
      v-if="overlay"
      class="absolute inset-0 bg-black/30"
      @click="overlayClose ? close() : null"
    />

    <!-- The floating dialog (draggable as a whole, handle is header) -->
    <div
      ref="root"
      v-draggable="{ id, handle: '.dd-header' }"
      :style="{
        zIndex: zIndex?.toString() ?? 10,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? '100%' : height,
      }"
      class="absolute bg-white rounded-lg shadow-xl border overflow-hidden flex flex-col"
      role="dialog"
      :aria-modal="true"
      :aria-labelledby="labelId"
      tabindex="-1"
    >
      <!-- @mousedown="bringToFront" -->
      <header class="w-full dd-header h-7 px-2 bg-gray-100 border-b flex items-center justify-between gap-5">
        <v-hover>
          <template #default="{ isHovering, props }">            
            <div class="flex gap-2 items-center justify-center">
              <div v-bind="props" role="button" class="w-3 h-3 flex !justify-center !items-center rounded-full bg-red-500" aria-label="Close dialog" @click="close">
                <Icon v-if="isHovering" icon="bx:x" width="12" height="12" class="text-black" />
              </div>

              <div v-bind="props" role="button" class="w-3 h-3 flex justify-center items-center rounded-full bg-yellow-500" aria-label="Minimize dialog" @click="close">
                <Icon v-if="isHovering" icon="ic:baseline-minus" width="12" height="12" class="text-black" />
              </div>
    
              <div v-bind="props" role="button" class="w-3 h-3 flex justify-center items-center rounded-full bg-green-500" aria-label="Resize dialog" @click="toggleMaxWindowSize">
                <Icon v-if="isHovering" icon="gridicons:resize" width="8" height="8" class="text-black" />
              </div>       
            </div>
          </template>
        </v-hover>
        
        <div class="w-full !flex-1">
          <p class="font-semibold text-sm text-center text-ellipsis line-clamp-1">
            {{ title }}
          </p>
        </div>

        <div class="flex gap-2 items-center justify-center">
          <div role="button" class="w-3 h-3 rounded-full" />
    
          <div class="w-3 h-3 rounded-full" />
    
          <div class="w-3 h-3 rounded-full" />
        </div>
      </header>

      <section class="w-full overflow-y-auto flex-1">
        <slot />
      </section>

      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { useDraggablesStore } from '@/stores/draggables'
import { useDraggableArea } from '@/composables/useDraggableArea'
import { computed, onMounted, onBeforeUnmount, ref, nextTick, toRef, watch } from 'vue'

const { setPos } = useDraggablesStore()
const { items } = storeToRefs(useDraggablesStore())

// Props
const props = defineProps<{
  id: string
  modelValue: boolean
  title?: string
  width?: string
  height?: string
  overlay?: boolean
  overlayClose?: boolean
  zIndex?: number
  dropZone?: HTMLElement | undefined
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const { vDraggable } = useDraggableArea(toRef(props, 'dropZone'))
const title = computed(() => props.title ?? 'Dialog')
const width = computed(() => props.width ?? '520px')
const height = computed(() => props.height ?? '360px')
const overlay = computed(() => props.overlay ?? true)
const overlayClose = computed(() => props.overlayClose ?? false)

// This component assumes it is rendered INSIDE the drop zone.
// Parent must call useDraggableArea(dropZone) and provide v-draggable from there.
const root = ref<HTMLElement>()

const isMaximized = ref<boolean>(false)

const labelId = `dlg-${props.id}-label`

const close = () => {
  emit('update:modelValue', false)
}

// const onKeyDown = (e: KeyboardEvent) => {
//   if (e.key === 'Escape') close()
// }

onMounted(() => {
  // document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  // document.removeEventListener('keydown', onKeyDown)
})

// Center on first open (if no saved position)
const centerDialog = async () => {
  await nextTick()
  // Ensure styles (width/height) are applied and layout is ready
  await new Promise<void>((r) => requestAnimationFrame(() => r()))

  const dz = props.dropZone
  const el = root.value
  if (!dz || !el) return

  const cs = getComputedStyle(dz)
  const padL = parseFloat(cs.paddingLeft) || 0
  const padR = parseFloat(cs.paddingRight) || 0
  const padT = parseFloat(cs.paddingTop) || 0
  const padB = parseFloat(cs.paddingBottom) || 0

  // Size of the *content box* inside the drop zone
  const contentW = dz.clientWidth  - padL - padR
  const contentH = dz.clientHeight - padT - padB

  const elW = el.offsetWidth
  const elH = el.offsetHeight

  // If element still has no size, bail safely
  if (!contentW || !contentH || !elW || !elH) return

  const x = Math.max(0, (contentW - elW) / 2)
  const y = Math.max(0, (contentH - elH) / 2)

  // Update store and reflect immediately
  setPos(props.id, x, y)
  el.style.left = `${x}px`
  el.style.top  = `${y}px`
}

// Maximize or minimize window
const toggleMaxWindowSize = () => {
  if (isMaximized.value) {
    isMaximized.value = false

    centerDialog()
  } else {
    isMaximized.value = !isMaximized.value
  
    nextTick(() => {
      const el = root.value
  
      if (el) {
        el.style.left = `0px`
        el.style.top  = `0px`
      }
    })
    nextTick()
  }
}

watch(() => props.modelValue, (open) => {
  if (open) {
    const st = items.value[props.id]
    if (st && (st.x !== 0 || st.y !== 0)) {
      nextTick(() => {
        const el = root.value

        if (el) {
          el.style.left = `${st.x}px`
          el.style.top  = `${st.y}px`
        }
      })
    } else {
      centerDialog()
    }

    nextTick(() => root.value?.focus())
  }
})
</script>