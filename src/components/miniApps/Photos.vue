<template>
  <transition v-if="isViewMode" name="fade-transition">
    <div
      v-if="isViewMode"
      class="w-full h-full flex relative justify-center bg-black"
    >
      <img
        :src="selectedPhoto?.dataUrl"
        :alt="`Photo`"
        class="h-full object-cover object-center bg-black/60 cursor-default"
      />

      <div class="absolute left-3 top-3">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          @click="isViewMode = false"
        />
      </div>

      <div class="absolute right-3 top-3">
        <v-btn
          icon="mdi-trash-can-outline"
          color="error"
          variant="text"
          size="small"
          @click="deleteSelectedPhoto"
        />
      </div>
    </div>
  </transition>

  <template v-else>
    <div v-if="photos.length" class="w-full flex flex-col gap-5 pb-4">
      <div class="w-full h-full flex flex-wrap gap-0.5">
        <img
          v-for="photo in photos"
          :key="photo.id"
          :src="photo.dataUrl"
          :alt="`Photo ${photo.id}`"
          class="w-[124px] h-[124px] rounded-md object-cover object-center bg-black/60 cursor-pointer"
          @click="selectAndDisplayPhoto(photo)"
        />
      </div>
  
      <div class="flex flex-col text-center">
        <p class="text-base font-semibold">
          {{ `${photos.length} Photos` }}
        </p>
  
        <p class="text-sm text-gray-500">
          {{ `Last photo taken at ${dayjs(photos[photos.length - 1].capturedAt).format('ddd MMM YYYY, HH:mm')}` }}
        </p>
      </div>
    </div>

    <div v-else class="w-full h-full flex justify-center items-center">
      <p class="text-base font-medium">
        {{ 'No pictures for now.' }}
      </p>
    </div>
  </template>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores/global';
import dayjs from 'dayjs';
import { ref } from 'vue';
import type { Photo } from '@/types';

const { cameraPhotos: photos } = storeToRefs(useGlobalStore())

const isViewMode = ref<boolean>(false)
const selectedPhoto = ref<Photo | null>(null)

const selectAndDisplayPhoto = (photo: Photo): void => {
  selectedPhoto.value = photo

  isViewMode.value = true
}

const deleteSelectedPhoto = (): void => {
  photos.value = photos.value.filter((photo) => photo.id !== selectedPhoto.value?.id)

  isViewMode.value = false
}
</script>