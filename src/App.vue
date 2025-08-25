<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="String(route.meta.transition)">
      <component :is="Component" :key="route.name" />
    </transition>
  </router-view>
</template>

<script setup lang="ts"></script>

<style scoped></style>
