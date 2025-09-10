<template>
  <div
    class="w-fit mx-auto self-center absolute bottom-4 z-50 flex items-center gap-3 pt-1 pb-2 rounded-3xl px-2 select-none backdrop-blur-3xl"
  >
    <home-bottom-bar-dock-item
      v-for="app in bottomItems"
      :key="app.id"
      :app="app"
      @open="openApp"
    />

    <v-divider vertical class="my-2 text-white" :thickness="2"></v-divider>

    <home-bottom-bar-dock-item
      key="trash"
      :app="{
        id: 'trash',
        logo: deletedElements?.length ? trashFull : trash,
        title: 'Trash',
        width: 55,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import trash from '@/assets/trash.png'
import trashFull from '@/assets/trash_full.png'
import { useGlobalStore } from '@/stores/global'
import HomeBottomBarDockItem from './HomeBottomBarDockItem.vue'
import { onMounted } from 'vue'

const deletedFoldersPersistKey = 'desktop.folders.deleted'

const { bottomItems, deletedElements, initialWindowsIndex } = storeToRefs(useGlobalStore())

onMounted(() => {
  try {
    const raw = localStorage.getItem(deletedFoldersPersistKey)

    if (raw) {
      const parsed = JSON.parse(raw) as unknown[]

      deletedElements.value = parsed
    }
  } catch {}
})

const openApp = (id: string) => {
  if (id) {
    const clicked = bottomItems.value.find((el) => el.id === id)

    if (!clicked) return

    for (const item of bottomItems.value) item.active = false

    clicked.zIndex = initialWindowsIndex.value += 1
    clicked.opened = true
    clicked.active = true
  }
}
</script>
