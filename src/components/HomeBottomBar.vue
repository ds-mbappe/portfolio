<template>
  <div class="w-fit mx-auto self-center absolute bottom-4 z-50 flex items-center gap-3 pt-1 pb-2 rounded-3xl px-2 select-none backdrop-blur-3xl">
    <home-bottom-bar-dock-item
      v-for="app in bottomItems"
      :key="app.id"
      :app="app"
      @open="openApp"
    />

    <v-divider vertical class="my-2 text-white" :thickness="2"></v-divider>

    <!-- Trash not empty -->
    <div v-if="deletedElements?.length" class="flex flex-col items-center justify-center relative transition-all duration-300 gap-1">
      <v-img :lazy-src="trashFull" :src="trashFull" :aspect-ratio="1" :width="52 * 1.25" />

      <div v-if="trashActive" class="w-1 h-1 rounded-full absolute -bottom-1.5 bg-white dark:bg-black" />
    </div>

    <!-- Trash empty -->
    <div v-else class="flex flex-col items-center justify-center relative transition-all duration-300 gap-1">
      <v-img :lazy-src="trash" :src="trash" :aspect-ratio="1" :width="52 * 1.25" />

      <div v-if="trashActive" class="w-1 h-1 rounded-full absolute -bottom-1.5 bg-white dark:bg-black" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import trash from '@/assets/trash.png';
import trashFull from '@/assets/trash_full.png';
import { useGlobalStore } from '@/stores/global';
import HomeBottomBarDockItem from './HomeBottomBarDockItem.vue';

const { deletedElements, bottomItems, trashActive, initialWindowsIndex } = storeToRefs(useGlobalStore());

const openApp = (id: string) => {
  if (id) {
    const clicked = bottomItems.value.find(el => el.id === id)

    if (!clicked) return

    for (const item of bottomItems.value) item.active = false

    clicked.zIndex = (initialWindowsIndex.value += 1)
    clicked.opened = true
    clicked.active = true
  }
}
</script>