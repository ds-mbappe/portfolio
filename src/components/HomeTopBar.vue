<template>
  <div
    class="w-full h-8 flex justify-between items-center z-2 overflow-hidden select-none cursor-default bg-transparent backdrop-blur-lg px-4"
  >
    <div class="h-full flex items-center gap-5">
      <!-- Apple Logo -->
      <div class="">
        <Icon icon="ic:baseline-apple" height="20" width="20" class="text-white dark:text-black" />
      </div>

      <!-- Active App -->
      <p
        class="font-semibold text-sm capitalize cursor-default h-full flex items-center text-white dark:text-black"
      >
        {{ trashActive ? 'Trash' : bottomItems?.find((item) => item?.active)?.id }}
      </p>
    </div>

    <div class="h-full flex items-center gap-4">
      <!-- Battery Percentage -->
      <div class="">
        <Icon
          icon="heroicons:battery-50-solid"
          height="26"
          width="29"
          class="text-white dark:text-black"
        />
      </div>

      <!-- Siri -->
      <div class="">
        <img :src="siri" width="16" height="16" alt="Artificial Intelligence" />
      </div>

      <!-- Dark Mode -->
      <div @click="toggleTheme" class="">
        <Icon icon="gg:dark-mode" height="20" width="20" class="text-white dark:text-black" />
      </div>

      <!-- Date -->
      <p base medium class="text-white dark:text-black text-sm font-semibold">
        {{ currentDateTime }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import siri from '@/assets/siri.png'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/global'
import { useClock } from '@/composables/useClock'

const { currentDateTime } = useClock()

const { bottomItems, trashActive } = storeToRefs(useGlobalStore())

const toggleTheme = () => {
  // document.documentElement.classList.toggle('dark')
}
</script>
