<template>
  <div class="w-full h-full flex-1 flex flex-col !p-2.5">
    <div class="w-full h-full flex-1 flex flex-col relative rounded-lg overflow-hidden">
      <!-- Drop zone -->
      <div 
        ref="dropZone"
        class="relative w-full h-full flex-1 bg-transparent p-4 rounded-lg overflow-hidden"
      >
        <!-- Test draggable div -->
        <!-- <div v-draggable="{ id: 'box-1' }" class="p-3 bg-white rounded shadow cursor-move">
          Free div content
        </div> -->

        <draggable-dialog
          v-model="bottomItems[2].opened"
          :id="'terminal'"
          :drop-zone="dropZone"
          :z-index="bottomItems[2].zIndex"
          title="danielstephane - zsh"
        >
          <terminal />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[6].opened"
          :id="'calendar'"
          width="1080px"
          height="560px"
          :z-index="bottomItems[6].zIndex"
          :drop-zone="dropZone"
          title="Calendar"
        >
          <calendar />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[4].opened"
          :id="'camera'"
          width="768px"
          height="560px"
          :drop-zone="dropZone"
          :z-index="bottomItems[4].zIndex"
          title="Camera"
        >
          <facetime />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[3].opened"
          :id="'photos'"
          :drop-zone="dropZone"
          :z-index="bottomItems[3].zIndex"
          title="Photos"
        >
          <photos />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[5].opened"
          :id="'maps'"
          width="768px"
          height="560px"
          :drop-zone="dropZone"
          :z-index="bottomItems[5].zIndex"
          title="Maps"
        >
          <maps />
        </draggable-dialog>
      </div>
    </div>
    
    <!-- Toolbar -->
    <div class="w-full h-[120px] z-0 bg-transparent">
      <!-- <button @click="terminalOpened = !terminalOpened" class="text-white">CHANGE OPEN</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useDraggableArea } from "@/composables/useDraggableArea"
import DraggableDialog from './DraggableDialog.vue'
import Terminal from './miniApps/Terminal.vue'
import Calendar from './miniApps/Calendar.vue'
import { useGlobalStore } from '@/stores/global'
import { storeToRefs } from 'pinia'
import Facetime from './miniApps/Facetime.vue'
import Photos from './miniApps/Photos.vue'
import Maps from './miniApps/Maps.vue'

const { bottomItems } = storeToRefs(useGlobalStore())

const dropZone = ref<HTMLElement>()
// const { vDraggable } = useDraggableArea(dropZone)
</script>