<template>
  <div class="w-full h-full flex-1 flex flex-col !p-2.5">
    <div class="w-full h-full flex-1 flex flex-col relative rounded-lg overflow-hidden">
      <!-- Drop zone -->
      <div 
        ref="dropZone"
        class="relative w-full h-full flex-1 bg-transparent p-4 rounded-lg overflow-hidden"
        tabindex="0"
        @keydown.stop
        @click="closeCtx"
        @contextmenu.prevent="openCtx($event, null)"
      >
        <!-- Test draggable div -->
        <!-- <div v-draggable="{ id: 'box-1' }" class="w-fit hahaha p-3 bg-white rounded shadow cursor-move">
          Free div content
        </div> -->

        <!-- Folders -->
        <div
          v-for="f in folders"
          :key="f.id"
          class="absolute flex flex-col items-center select-none rounded-lg"
          v-draggable="{ id: f.id.toString() }"
          :class="{
            // 'backdrop-blur-3xl': f.id === selectedId,
            'bg-blue-500': f.id === selectedId
          }"
          @contextmenu.prevent.stop="openCtx($event, f.id)"
          @dblclick.stop
          @click.stop="select(f.id)"
        >
          <v-img
            :src="folderLogo"
            :aspect-ratio="1"
            :lazy-src="folderLogo"
            class="w-[100px] pointer-events-none"
          />

          <!-- Name or inline rename -->
          <div v-if="f.isRenaming">
            <input
              ref="renameInput"
              v-model="renameDraft"
              class="w-fit rounded bg-black/70 text-white text-xs px-2 outline-none border border-white/30"
              @keydown.enter.prevent="confirmRename(f.id)"
              @keydown.esc.prevent="cancelRename(f.id)"
              @blur="confirmRename(f.id)"
            />
          </div>
          
          <p
            v-else
            class="text-white text-sm text-center px-1 rounded -translate-y-1.5"
            :class="f.id === selectedId ? 'bg-blue-800' : ''"
          >
            {{ f.name }}
          </p>
        </div>

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

        <context-menu
          v-if="ctx.visible"
          :x="ctx.x"
          :y="ctx.y"
          :on-new="createFolderAtCtx"
          :on-rename="startRenameCtx"
          :can-rename="!!ctx.targetId"
          @close="closeCtx"
        />
      </div>
    </div>
    
    <!-- Toolbar -->
    <div class="w-full h-[120px] z-0 bg-transparent">
      <!-- <button @click="terminalOpened = !terminalOpened" class="text-white">CHANGE OPEN</button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { useDraggableArea } from "@/composables/useDraggableArea"
import DraggableDialog from './DraggableDialog.vue'
import Terminal from './miniApps/Terminal.vue'
import Calendar from './miniApps/Calendar.vue'
import { useGlobalStore } from '@/stores/global'
import { storeToRefs } from 'pinia'
import Facetime from './miniApps/Facetime.vue'
import Photos from './miniApps/Photos.vue'
import Maps from './miniApps/Maps.vue'
import ContextMenu from './ContextMenu.vue'
import type { Folder } from '@/types'
import folderLogo from '@/assets/folder.png'

const { bottomItems } = storeToRefs(useGlobalStore())

const dropZone = ref<HTMLElement>()
const folders = ref<Folder[]>([
  { id: crypto.randomUUID(), name: 'Documents', x: 40, y: 80 },
  { id: crypto.randomUUID(), name: 'Pictures',  x: 40, y: 180 },
])
const renameDraft = ref('')
const selectedId = ref<string | null>(null)
const renameInput = ref<HTMLInputElement | null>(null)
const { vDraggable } = useDraggableArea(dropZone)

const ctx = reactive({
  x: 0,
  y: 0,
  visible: false,
  targetId: null as string | null, // folder id if clicked on a folder
})

const openCtx = (e: MouseEvent, folderId: string | null) => {
  ctx.visible = true
  ctx.x = e.clientX
  ctx.y = e.clientY
  ctx.targetId = folderId
}

const select = (id: string) => {
  selectedId.value = id
}

const makeUniqueAgainstOthers = (candidate: string, id: string) => {
  const taken = new Set(folders.value.filter(f => f.id !== id).map(f => f.name))

  if (!taken.has(candidate)) return candidate

  let n = 2
  
  while (taken.has(`${candidate} ${n}`)) n++
  return `${candidate} (${n})`
}


const confirmRename = (id: string) => {
  const f = folders.value.find(f => f.id === id)

  if (!f) return

  const trimmed = renameDraft.value.trim()

  f.name = trimmed ? makeUniqueAgainstOthers(trimmed, id) : f.name
  f.isRenaming = false
}

const cancelRename = (id: string) => {
  const f = folders.value.find(f => f.id === id)

  if (!f) return

  f.isRenaming = false
}

const closeCtx = () => {
  ctx.visible = false
  ctx.targetId = null

  selectedId.value = null
}

const uniqueName = (base = 'Untitled Folder') => {
  const names = new Set(folders.value.map(f => f.name))

  if (!names.has(base)) return base

  let n = 2

  while (names.has(`${base} ${n}`)) n++
  return `${base} (${n})`
}

const createFolderAt = (x: number, y: number) => {
  const id = crypto.randomUUID()
  
  const f: Folder = { id, name: uniqueName(), x: Math.max(16, x - 56), y: Math.max(16, y - 32), isRenaming: true }

  folders.value.push(f)
  selectedId.value = id
  renameDraft.value = f.name

  nextTick(() => renameInput.value?.select())
}

const startRename = (id: string) => {
  const f = folders.value.find(f => f.id === id)

  if (!f) return

  folders.value.forEach(x => (x.isRenaming = false))

  f.isRenaming = true

  renameDraft.value = f.name

  nextTick(() => renameInput.value?.select())
}

const startRenameCtx = () => {
  if (!ctx.targetId) return

  startRename(ctx.targetId)
  closeCtx()
}

const createFolderAtCtx = () => {
  createFolderAt(ctx.x, ctx.y)
  closeCtx()
}
</script>