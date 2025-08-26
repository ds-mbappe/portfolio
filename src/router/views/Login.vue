<template>
  <div
    class="relative w-auto min-w-full min-h-[100dvh] max-w-none flex flex-col items-center justify-center select-none cursor-default"
    @click="navigateToHome"
    @contextmenu.prevent
  >
    <video
      ref="bg"
      class="absolute inset-0 w-full h-full object-cover pointer-events-none"
      :class="videoVisible ? 'opacity-100' : 'opacity-0'"
      :src="sunrise"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
      @loadeddata="onVideoReady"
      @canplay="onVideoReady"
    ></video>

    <div class="relative z-10 flex flex-col items-center flex-1 w-full">
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

      <div class="flex flex-col gap-2.5 items-center">
        <div class="flex flex-col items-center">
          <v-avatar
            :size="64"
            :image="siri"
          />

          <p class="text-white font-semibold text-sm">Daniel Stéphane MBAPPE</p>
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
import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.mov'
import siri from '@/assets/siri.png';
import { useRouter } from 'vue-router';
import { useClock } from '@/composables/useClock'
import { ref } from 'vue';

const router = useRouter()
const { currentTime, currentDate } = useClock()

const videoVisible = ref(false)
const bg = ref<HTMLVideoElement | null>(null)

const onVideoReady = () => {
  bg.value?.play().catch(() => {})
  videoVisible.value = true
}

const navigateToHome = () => {
  router.push({ name: 'home' })
}
</script>
