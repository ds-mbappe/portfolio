<template>
  <div class="w-full h-full flex-1 flex flex-col !p-2.5">
    <div class="w-full h-full flex-1 flex flex-col relative rounded-lg overflow-hidden">
      <!-- Drop zone -->
      <div
        id="dropZone"
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
          class="absolute flex flex-col items-center rounded-lg cursor-default"
          v-draggable="{
            id: f.id.toString(),
            handle: '.handle-folder',
          }"
          :class="{
            'bg-blue-800': f.id === selectedId && !f.isRenaming,
          }"
          @contextmenu.prevent.stop="openCtx($event, f.id)"
          @dblclick.stop
          @click.stop="selectFolder(f.id)"
        >
          <v-img
            :src="folderLogo"
            :aspect-ratio="1"
            :lazy-src="folderLogo"
            class="w-[100px] select-none handle-folder"
          />

          <!-- Name or inline rename -->
          <div v-if="f.isRenaming">
            <input
              v-model="renameDraft"
              ref="renameInput"
              class="!w-fit rounded text-white bg-blue-800 text-sm px-2 outline-none border border-white/30"
              @keydown.enter.prevent="renameFolder(f.id, renameDraft)"
              @keydown.esc.prevent="cancelRenameFolder(f.id)"
              @blur="renameFolder(f.id, renameDraft)"
            />
          </div>

          <p
            v-else
            class="text-white text-sm text-center px-1 rounded -translate-y-1.5 select-none"
            :class="f.id === selectedId ? 'bg-blue-800' : ''"
          >
            {{ f.name }}
          </p>
        </div>

        <draggable-dialog
          v-model="bottomItems[1].opened"
          width="768px"
          height="560px"
          title="Safari"
          :id="'safari'"
          :drop-zone="dropZone"
          :z-index="bottomItems[1].zIndex"
          @bring-to-front="bottomItems[1].zIndex = bottomItems[1].zIndex + 1"
        >
          <safari />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[2].opened"
          title="danielstephane - zsh"
          :id="'terminal'"
          :drop-zone="dropZone"
          :z-index="bottomItems[2].zIndex"
          @bring-to-front="bottomItems[2].zIndex = bottomItems[2].zIndex + 1"
        >
          <terminal />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[6].opened"
          width="1080px"
          height="560px"
          title="Calendar"
          :id="'calendar'"
          :drop-zone="dropZone"
          :z-index="bottomItems[6].zIndex"
          @bring-to-front="bottomItems[6].zIndex = bottomItems[6].zIndex + 1"
        >
          <calendar />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[4].opened"
          width="768px"
          height="560px"
          title="Camera"
          :id="'camera'"
          :drop-zone="dropZone"
          :z-index="bottomItems[4].zIndex"
          @bring-to-front="bottomItems[4].zIndex = bottomItems[4].zIndex + 1"
        >
          <facetime />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[3].opened"
          title="Photos"
          :id="'photos'"
          :drop-zone="dropZone"
          :z-index="bottomItems[3].zIndex"
          @bring-to-front="bottomItems[3].zIndex = bottomItems[3].zIndex + 1"
        >
          <photos />
        </draggable-dialog>

        <draggable-dialog
          v-model="bottomItems[5].opened"
          width="768px"
          height="560px"
          title="Maps"
          :id="'maps'"
          :drop-zone="dropZone"
          :z-index="bottomItems[5].zIndex"
          @bring-to-front="bottomItems[5].zIndex = bottomItems[5].zIndex + 1"
        >
          <maps />
        </draggable-dialog>

        <ContextMenu
          v-if="ctx.visible"
          :x="ctx.x"
          :y="ctx.y"
          :is-selected="isFolderSelected"
          @new="createFolderAtCtx"
          @get-info="getMacInfo"
          @change-wallpaper="changeWallpaper"
          @delete="deleteFolderAndCloseMenu"
          @rename="startRenameCtx"
          @close="closeCtx"
        />
      </div>
    </div>

    <!-- Toolbar -->
    <div class="w-full h-[120px] z-0 bg-transparent"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useDraggableArea } from '@/composables/useDraggableArea'
import DraggableDialog from './DraggableDialog.vue'
import Terminal from './miniApps/Terminal.vue'
import Calendar from './miniApps/Calendar.vue'
import { useGlobalStore } from '@/stores/global'
import { storeToRefs } from 'pinia'
import Facetime from './miniApps/Facetime.vue'
import Photos from './miniApps/Photos.vue'
import Maps from './miniApps/Maps.vue'
import ContextMenu from './ContextMenu.vue'
import folderLogo from '@/assets/folder.png'
import { useFolderStore } from '@/stores/folder'
import { useDraggablesStore } from '@/stores/draggables'
import Safari from './miniApps/Safari.vue'

const { setPos, loadItems: loadDraggables } = useDraggablesStore()
const {
  loadFolders,
  select: selectFolder,
  confirmRename: renameFolder,
  cancelRename: cancelRenameFolder,
  startRename: startRenamingFolder,
  createFolderAt: createNewFolder,
  removeFolder: deleteFolder,
} = useFolderStore()

const { bottomItems } = storeToRefs(useGlobalStore())
const { folders, selectedId } = storeToRefs(useFolderStore())

onMounted(() => {
  loadFolders()
  loadDraggables()

  window.addEventListener('keydown', onAddShortcuts)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onAddShortcuts)
})

const renameDraft = ref('')
const dropZone = ref<HTMLElement>()
const renameInput = ref<HTMLInputElement | null>(null)

const { vDraggable } = useDraggableArea(dropZone)

const ctx = reactive({
  x: 0,
  y: 0,
  visible: false,
  targetId: null as string | null,
})

const isFolderSelected = computed(() => {
  return ctx.targetId !== null && selectedId.value !== null
})

const openCtx = (e: MouseEvent, folderId: string | null) => {
  const targetElement: HTMLElement = e.target as HTMLElement

  if (targetElement?.id === 'dropZone') {
    ctx.visible = true
    ctx.x = e.clientX
    ctx.y = e.clientY
    ctx.targetId = folderId
  }
}

const closeCtx = () => {
  ctx.visible = false
  ctx.targetId = null

  selectedId.value = null
}

const startRenameCtx = () => {
  if (!ctx.targetId) return

  startRenamingFolder(ctx.targetId)

  renameDraft.value = folders.value.find((f) => f.id === ctx.targetId)?.name ?? ''

  closeCtx()
}

const createFolderAtCtx = () => {
  const id = createNewFolder(ctx.x, ctx.y)

  setPos(id, ctx.x, ctx.y)

  renameDraft.value = folders.value.find((f) => f.id === id)?.name ?? ''

  closeCtx()
}

const deleteFolderAndCloseMenu = () => {
  deleteFolder(selectedId.value ?? '')

  closeCtx()
}

const getMacInfo = () => {
  closeCtx()
}

const changeWallpaper = () => {
  closeCtx()
}

const onAddShortcuts = (e: KeyboardEvent) => {
  const cmd = e.metaKey || e.ctrlKey

  if (cmd && e.key.toLowerCase() === 'n') {
    e.preventDefault()

    if (dropZone.value) {
      createNewFolder(dropZone.value.clientWidth / 2, dropZone.value.clientHeight / 2)
    }
  }

  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId.value) {
    e.preventDefault()

    deleteFolder(selectedId.value)
  }
}
</script>
