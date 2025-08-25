<template>
  <div
    class="w-auto min-w-full min-h-[100dvh] max-w-none bg-contain bg-center flex flex-col relative"
    :style="{
      'background-image': background ? `url('${background}')` : '',
      'background-size': 'cover',
    }"
  >
    <home-top-bar />

    <home-content />
    
    <home-bottom-bar />
  </div>
</template>

<script setup lang="ts">
import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.png'
import { ref } from 'vue';
import HomeTopBar from '@/components/HomeTopBar.vue';
import HomeBottomBar from '@/components/HomeBottomBar.vue';
import HomeContent from '@/components/HomeContent.vue';

const background = ref(sunrise)
</script>