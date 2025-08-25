<template>
  <div class="w-fit mx-auto self-center absolute bottom-4 z-5 flex items-center gap-3 pt-1 pb-2 rounded-3xl px-2 select-none backdrop-blur-3xl">
    <div
      v-for="app in bottomItems"
      :key="app.id"
      class="flex flex-col items-center justify-center relative transition-all duration-300 gap-1"
    >
      <v-img
        :id="app.id"
        :src="app.logo"
        :aspect-ratio="1"
        :lazy-src="app.logo"
        :width="app.width * 1.25"
        @click="openApp(app.id)"
      />

      <div v-if="app?.opened" class="w-1 h-1 rounded-full bg-white dark:bg-black absolute -bottom-1" />
    </div>

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
import trash from '@/assets/trash.png'
import trashFull from '@/assets/trash_full.png'
import { useGlobalStore } from '@/stores/global';
import { storeToRefs } from 'pinia';

const { deletedElements, bottomItems, trashActive, initialWindowsIndex } = storeToRefs(useGlobalStore());

const openApp = (id: string) => {
  if (id) {
    const clickedApp = bottomItems.value.find(el => el.id === id)

    if (clickedApp) {
      for (const item of bottomItems.value) {
        item.active = false;
      }
      
      clickedApp.zIndex = initialWindowsIndex.value += 1;
      clickedApp.opened = true;
      clickedApp.active = true;
    }
  }
}
</script>