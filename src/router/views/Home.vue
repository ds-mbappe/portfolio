<template>
  <div
    :style="{
      backgroundImage: background ? `url(${background})` : '',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
    :class="[
      'min-w-full min-h-[100dvh] flex flex-col relative',
      'transition-all duration-1000',
      isFading ? 'opacity-0 scale-[140%]' : 'opacity-100',
    ]"
  >
    <home-top-bar />

    <home-content />

    <home-bottom-bar />
  </div>
</template>

<script setup lang="ts">
import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.png'
import { onMounted, onUnmounted, ref } from 'vue'
import HomeTopBar from '@/components/HomeTopBar.vue'
import HomeBottomBar from '@/components/HomeBottomBar.vue'
import HomeContent from '@/components/HomeContent.vue'

const isFading = ref(true)
const background = ref(sunrise)

let fallbackTimer: number | null = null

onMounted(() => {
  const img = new Image()

  img.src = background.value
  img
    .decode?.()
    .then(() => {
      isFading.value = false
    })
    .catch(() => {})
  img.onload = () => {
    isFading.value = false
  }

  fallbackTimer = window.setTimeout(() => {
    isFading.value = false
  }, 500)
})

onUnmounted(() => {
  if (fallbackTimer !== null) {
    clearTimeout(fallbackTimer)
  }
})
</script>
