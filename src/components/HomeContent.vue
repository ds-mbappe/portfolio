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

        <ContextMenu
          v-if="ctx.visible"
          :x="ctx.x"
          :y="ctx.y"
          :is-selected="isFolderSelected"
          @new="createFolderAtCtx"
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
import { computed, onMounted, reactive, ref } from 'vue'
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

const { setPos, loadItems: loadDraggables } = useDraggablesStore()
const {
  // selected,
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

  // Shortcuts
  window.addEventListener('keydown', (e) => {
    // const cmd = e.metaKey || e.ctrlKey
    // if (cmd && e.shiftKey && e.key.toLowerCase() === 'n') {
    //   e.preventDefault()

    //   const id = createNewFolder(window.innerWidth / 2, window.innerHeight / 2)

    //   renameDraft.value = folders.value.find(f => f.id === id)?.name ?? ''

    //   nextTick(() => renameInput.value?.focus())
    // }

    // if (e.ctrlKey && e.key === 'F2' && selectedId.value) {
    //   e.preventDefault()

    //   startRenamingFolder(selectedId.value)

    //   renameDraft.value = selected?.name ?? ''

    //   nextTick(() => renameInput.value?.focus())
    // }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId.value) {
      e.preventDefault()

      deleteFolder(selectedId.value)
    }
  })
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
  ctx.visible = true
  ctx.x = e.clientX
  ctx.y = e.clientY
  ctx.targetId = folderId
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

  // nextTick(() => renameInput.value?.blur())

  closeCtx()
}

const createFolderAtCtx = () => {
  const id = createNewFolder(ctx.x, ctx.y)

  setPos(id, ctx.x, ctx.y)

  renameDraft.value = folders.value.find((f) => f.id === id)?.name ?? ''

  // nextTick(() => renameInput.value?.blur())

  closeCtx()
}

const deleteFolderAndCloseMenu = () => {
  deleteFolder(selectedId.value ?? '')

  closeCtx()
}
</script>
