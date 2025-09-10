<template>
  <div
    class="flex flex-col fixed z-50 min-w-[130px] rounded-lg border outline outline-white/20 bg-gray-900 text-white backdrop-blur-sm shadow-xl select-none cursor-default overflow-hidden"
    :style="{ left: x + 'px', top: y + 'px' }"
    @click.stop
  >
    <div class="w-full hover:bg-blue-600 py-0.5" @click="$emit('new')">
      <span class="w-full px-2 text-sm">
        {{ 'New Folder' }}
      </span>
    </div>

    <div v-if="isSelected" class="w-full hover:bg-blue-600" @click="$emit('rename')">
      <span class="w-full px-2 text-sm">
        {{ 'Rename' }}
      </span>
    </div>

    <div v-if="isSelected" class="w-full hover:bg-blue-600" @click="$emit('delete')">
      <span class="w-full px-2 text-sm">
        {{ 'Delete' }}
      </span>
    </div>

    <v-divider class="self-center w-[90%] my-1" />

    <div class="w-full hover:bg-blue-600 py-0.5" @click="$emit('get-info')">
      <span class="w-full px-2 text-sm">
        {{ 'Get info' }}
      </span>
    </div>

    <div class="w-full hover:bg-blue-600 py-0.5" @click="$emit('change-wallpaper')">
      <span class="w-full px-2 text-sm">
        {{ 'Change wallpaper...' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  x: number
  y: number
  isSelected: boolean
}>()

defineEmits<{
  (e: 'new'): void
  (e: 'rename'): void
  (e: 'close'): void
  (e: 'get-info'): void
  (e: 'delete'): void
  (e: 'change-wallpaper'): void
}>()
</script>
