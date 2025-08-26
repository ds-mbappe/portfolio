<template>
  <div
    :class="[
      'fixed inset-0 flex items-center justify-center bg-black text-white select-none',
      'transition-opacity duration-1000',
      isFading ? 'opacity-0' : 'opacity-100'
    ]"
    @contextmenu.prevent
  >
    <div class="flex flex-col items-center gap-8">
      <!-- Logo -->
      <img
        v-if="logoUrl"
        :src="logoUrl"
        alt="Apple logo"
        class="w-20 h-20 object-contain"
        draggable="false"
      />

      <!-- Progress -->
      <div class="w-[320px] max-w-[70vw]">
        <v-progress-linear
          :model-value="displayProgress"
          height="6"
          rounded
          color="white"
          bg-color="white"
          bg-opacity="0.2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';
import logoUrl from '@/assets/apple_logo.png';
import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.mov'

const router = useRouter()

const DURATION_MS = 8000
const FADE_MS = 250

const internalProgress = ref(0)
const videoReady = ref(false)
const isFading = ref(false)

const displayProgress = computed(() =>
  videoReady.value ? internalProgress.value : Math.min(internalProgress.value, 99)
)

const startAuto = () => {
  const start = performance.now()
  const run = (t: number) => {
    const elapsed = t - start
    const x = Math.min(elapsed / DURATION_MS, 1)
    const eased = 1 - Math.pow(1 - x, 3)
    internalProgress.value = Math.min(100, eased * 100)
    if (x < 1) {
      requestAnimationFrame(run)
    }
  }
  requestAnimationFrame(run)
}

const preloadVideo = (): Promise<void> => {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.src = sunrise
    v.muted = true
    v.preload = 'auto'
    v.playsInline = true

    const done = () => {
      cleanup()
      resolve()
    }
    const cleanup = () => {
      v.removeEventListener('canplaythrough', done)
      v.removeEventListener('loadeddata', done)
    }

    v.addEventListener('canplaythrough', done, { once: true })
    v.addEventListener('loadeddata', done, { once: true })
    v.load()
  })
}

watch([internalProgress, videoReady], ([p, ready]) => {
  if (p >= 100 && ready && !isFading.value) {
    isFading.value = true
    setTimeout(() => {
      router.push('login')
    }, FADE_MS)
  }
})

onMounted(async () => {
  startAuto()
  await preloadVideo()
  videoReady.value = true
})
</script>

<style scoped>
img {
  image-rendering: -webkit-optimize-contrast;
}
</style>
