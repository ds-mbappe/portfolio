<template>
  <div class="w-full h-full p-5 justify-center items-center relative">
    <div ref="mapEl" class="relative flex flex-col w-full h-full inset-0"></div>

    <!-- Loader overlays but does not remove the map div -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/40">
      <v-progress-circular indeterminate />
    </div>

    <div v-if="error" class="absolute left-1/2 top-1/2 -translate-x-1/2 rounded bg-red-600 text-white shadow">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const mapEl = ref<HTMLDivElement | null>(null)
const map = shallowRef<google.maps.Map | null>(null)
const marker = shallowRef<google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Set your preferred initial center (Paris as example)
const initialZoom = 12
// const initialCenter = { lat: 48.8566, lng: 2.3522 }

onMounted(async () => {
  try {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      // libraries: ['places'], // Uncomment if you’ll use Autocomplete/Places details
    })

    // Load JS API
    await loader.load()

    if (!mapEl.value) throw new Error('Map container missing')

    const { AdvancedMarkerElement, Marker } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary

    // Create map
    map.value = new google.maps.Map(mapEl.value, {
      zoom: initialZoom,
      // center: initialCenter,
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      // gestureHandling: 'greedy',
      // disableDefaultUI: false,
    })

    // Try to center on user location and create the marker there
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }

          // move camera
          map.value!.panTo(userPos)
          map.value!.setZoom(14)

          // create marker directly at user location
          if (AdvancedMarkerElement) {
            marker.value = new AdvancedMarkerElement({
              map: map.value!,
              position: userPos,
              title: 'You are here',
            })
          } else {
            marker.value = new Marker({
              map: map.value!,
              position: userPos,
              title: 'You are here',
            })
          }
        },
        (err) => {
          console.warn('Geolocation failed or denied', err)
          error.value = 'You need to grant location access to view the Map.'
          // optional: leave map centered at initialCenter with no marker
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }

    loading.value = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load map'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  // Help GC
  marker.value = null
  map.value = null
})
</script>