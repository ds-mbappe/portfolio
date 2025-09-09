<template>
  <div
    class="fixed z-50 min-w-[130px] rounded-md border border-white/20 bg-black/80 text-white backdrop-blur-sm shadow-xl"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <button class="w-full text-left px-3 py-2 hover:bg-white/10" @click="onNew()">New Folder</button>

    <button
      class="w-full text-left px-3 py-2 hover:bg-white/10 disabled:opacity-40 disabled:cursor-default"
      :disabled="!canRename"
      @click="onRename()"
    >
      Rename
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  x: number
  y: number
  canRename: boolean
  onNew: () => void
  onRename: () => void
}>()

defineEmits<{ (e: 'close'): void }>()
</script>
