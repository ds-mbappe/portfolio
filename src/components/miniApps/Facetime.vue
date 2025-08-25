<template>
  <div class="w-full h-full">
    <!-- If permission denied or not yet granted -->
    <div
      v-if="permission === 'denied' || permission === 'prompt'"
      class="h-full w-full flex flex-col gap-6 text-center items-center justify-center"
    >
      <h1 class="text-2xl font-semibold">
        Camera Access Needed
      </h1>

      <p
        v-if="error"
        class="text-sm text-red-600"
      >
        {{ error }}
      </p>

      <div
        v-else
        class="flex flex-col gap-4 items-center"
      >
        <p class="max-w-md mx-auto text-gray-600">
          To take pictures, please allow access to your camera. Taken pictures are not saved anywhere, and are only shown for UX purposes.
        </p>

        <v-btn
          variant="elevated"
          color="primary"
          rounded="xl"
          class="w-fit"
          text="Authorize Camera"
          @click="requestCameraAccess"
        />
      </div>
    </div>

    <!-- Main camera preview UI & controls -->
    <div v-else class="w-full h-full overflow-hidden flex-1 bg-black relative flex items-center justify-center">
      <!-- Live preview -->
      <video
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="w-full object-contain transform -scale-x-100"
      ></video>

      <!-- Transition to make the taken picture appear -->
      <transition name="fade-transition">
        <div
          v-if="latestPhotoUrl"
          class="absolute bottom-5 left-5"
        >
          <img
            :src="latestPhotoUrl"
            alt="Latest photo"
            title="Click to open the gallery"
            class="w-14 h-14 rounded-full object-cover object-center bg-black/60 cursor-pointer outline outline-white"
            @click="openPhotosApp"
          />
        </div>
      </transition>

      <!-- Button to take picture -->
      <button
        @click="takePhoto"
        :disabled="!stream"
        title="Click to take a picture"
        class="absolute bottom-5 w-16 h-16 rounded-full bg-white outline-4 outline-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:shadow-2xl active:scale-90 transition-all"
      ></button>
    </div>

    <!-- Offscreen canvas for capture -->
    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { Photo } from '@/types';
import { useGlobalStore } from '@/stores/global';
import { debounce } from 'vuetify/lib/util/helpers.mjs';
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue';

const { cameraPhotos: photos, bottomItems, initialWindowsIndex } = storeToRefs(useGlobalStore())

type PermissionState = 'granted' | 'denied' | 'prompt'

const error = ref<string | null>(null)
const permission = ref<PermissionState>('prompt')
const videoEl = ref<HTMLVideoElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)

const latestPhotoUrl = computed<string | null>(() => {
  const p = photos.value[photos.value.length - 1]
  return p ? p.dataUrl : null
})

const requestCameraAccess = async (): Promise<void> => {
  error.value = null
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    permission.value = 'granted'
    await nextTick()
    await attachStream(s)
  } catch (e) {
    console.warn(e)
    permission.value = 'denied'
    error.value = 'Camera access was denied. You can change this in your browser settings.'
  }
}

const attachStream = async (s: MediaStream): Promise<void> => {
  if (stream.value) {
    stopStream()
  }
  stream.value = s

  const el = videoEl.value
  if (el) {
    el.srcObject = s

    await new Promise<void>((resolve) => {
      if (el.readyState >= 1) return resolve()
      const onMeta = () => {
        el.removeEventListener('loadedmetadata', onMeta)
        resolve()
      }
      el.addEventListener('loadedmetadata', onMeta)
    })

    try {
      await el.play()
    } catch (e) {
      console.warn('Autoplay prevented:', e)
    }
  }
}

const stopStream = (): void => {
  if (stream.value) {
    for (const track of stream.value.getTracks()) track.stop()
  }
  if (videoEl.value) {
    videoEl.value.srcObject = null
  }
  stream.value = null
}

const startCamera = async (): Promise<void> => {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    await attachStream(s)
  } catch (e) {
    console.error(e)
    error.value = 'Unable to start the camera.'
  }
}

const takePhoto = debounce(async (): Promise<void> => {
  const video = videoEl.value
  const canvas = canvasEl.value

  if (!video || !canvas) return

  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) {
    error.value = 'Camera not ready yet. Try again in a second.'
    return
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Mirror horizontally so the saved image matches the mirrored preview
  ctx.save()
  ctx.translate(width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, width, height)
  ctx.restore()

  const dataUrl = canvas.toDataURL('image/png')
  const photo: Photo = {
    id: crypto.randomUUID(),
    dataUrl,
    capturedAt: new Date(),
  }
  photos.value.push(photo)
}, 250)

const openPhotosApp = debounce(() => {
  const clickedApp = bottomItems.value.find(el => el.id === 'photos')

  if (clickedApp) {
    for (const item of bottomItems.value) {
      item.active = false;
    }
    
    clickedApp.zIndex = initialWindowsIndex.value += 1;
    clickedApp.opened = true;
    clickedApp.active = true;
  }
}, 250)

onMounted(async () => {
  try {
    if ('permissions' in navigator) {
      const status: PermissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
      permission.value = status.state as PermissionState
      status.onchange = () => {
        permission.value = status.state as PermissionState
      }
    }
  } catch {
    // Permissions API not available or 'camera' unsupported.
  }

  if (permission.value === 'granted') {
    await startCamera()
  }
})

onBeforeUnmount(() => {
  stopStream()
})

watch(
  () => videoEl.value,
  (el) => {
    if (el && stream.value) {
      el.srcObject = stream.value
      el.play().catch((e) => console.warn('Autoplay prevented:', e))
    }
  },
  { immediate: true }
)

watch(
  () => permission.value,
  (val) => {
    if (val === 'granted' && !stream.value) {
      void startCamera()
    }
  },
  { immediate: true }
)
</script>