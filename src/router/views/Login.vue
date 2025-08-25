<template>
  <div
    class="w-auto min-w-full min-h-[100dvh] max-w-none bg-contain bg-center flex flex-col items-center justify-center select-none cursor-default absolute"
    :style="{
      'background-image': sunrise ? `url('${sunrise}')` : '',
      'background-size': 'cover',
    }"
    @click="navigateToHome"
  >
    <div class="flex flex-col items-center flex-1">
      <div class="w-full h-20"></div>

      <div class="flex h-full flex-col items-center">
        <p class="text-white text-4xl font-medium text-center">
          {{ currentDate }}
        </p>
  
        <p class="text-white font-medium text-9xl">
          {{ currentTime }}
        </p>
      </div>

      <div class="flex-1"></div>

      <div class="flex flex-col gap-2 items-center">
        <div class="flex flex-col gap-1 items-center">
          <!-- <v-img
            :src="siri"
            :width="64"
            :height="64"
            :lazy-src="siri"
            cover
            class="rounded-full"
          /> -->

          <v-avatar
            :size="64"
            :image="siri"
          />

          <p class="text-white font-semibold text-sm">
            {{ 'Guest' }}
          </p>
        </div>

        <p class="text-white font-medium text-sm">
          {{ 'Click anywhere to unlock' }}
        </p>
      </div>

      <div class="w-full h-10"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.png'
import siri from '@/assets/siri.png';
import { useRouter } from 'vue-router';
import { useClock } from '@/composables/useClock'

const router  = useRouter()
const { currentTime, currentDate } = useClock()

const navigateToHome = () => {
  router.push('home')
}

// const toggleAnimation = () => {
//   document.querySelector('.login').classList.add('clicked')
// }
</script>
