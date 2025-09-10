import type { Folder } from '@/types'
import { defineStore } from 'pinia'
import { useGlobalStore } from './global'

const foldersPersistKey = 'desktop.folders'
const deletedFoldersPersistKey = 'desktop.folders.deleted'

function uuid() {
  return (
    crypto?.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  )
}

export const useFolderStore = defineStore('desktop', {
  state: () => ({
    folders: [] as Folder[],
    selectedId: null as string | null,
  }),

  getters: {
    selected(state) {
      return state.folders.find((f) => f.id === state.selectedId) ?? null
    },
    names(state) {
      return new Set(state.folders.map((f) => f.name))
    },
  },

  actions: {
    loadFolders() {
      try {
        const raw = localStorage.getItem(foldersPersistKey)

        if (raw) {
          const parsed = JSON.parse(raw) as Folder[]

          if (Array.isArray(parsed)) {
            this.folders = parsed.map((f) => ({ ...f, isRenaming: false }))
          }
        }
      } catch {}
    },
    save() {
      localStorage.setItem(foldersPersistKey, JSON.stringify(this.folders))
    },
    uniqueName(base = 'Untitled Folder') {
      const names = new Set(this.folders.map((f) => f.name))

      if (!names.has(base)) return base

      let n = 2

      while (names.has(`${base} (${n})`)) n++

      return `${base} (${n})`
    },
    makeUniqueAgainstOthers(candidate: string, id: string) {
      const taken = new Set(this.folders.filter((f) => f.id !== id).map((f) => f.name))

      if (!taken.has(candidate)) return candidate

      let n = 2

      while (taken.has(`${candidate} (${n})`)) n++

      return `${candidate} (${n})`
    },
    createFolderAt(x?: number, y?: number) {
      const id = uuid()
      const f: Folder = {
        id,
        name: this.uniqueName(),
        x: Math.max(16, x ?? 0 - 56),
        y: Math.max(16, y ?? 0 - 32),
        isRenaming: false,
      }

      this.folders.push(f)
      this.selectedId = id
      this.save()

      return id
    },
    removeFolder(id: string) {
      if (!id) return

      const deletedFolder = this.folders.find((folder) => folder.id === id)
      const globalStore = useGlobalStore()

      globalStore.deletedElements.push(deletedFolder)

      localStorage.setItem(deletedFoldersPersistKey, JSON.stringify(globalStore.deletedElements))

      this.folders = this.folders.filter((f) => f.id !== id)

      if (this.selectedId === id) {
        this.selectedId = null
      }

      this.save()
    },
    moveFolder(id: string, x: number, y: number) {
      const f = this.folders.find((f) => f.id === id)

      if (!f) return

      f.x = x
      f.y = y

      this.save()
    },
    select(id: string | null) {
      this.selectedId = id
    },
    startRename(id: string) {
      this.folders.forEach((x) => (x.isRenaming = false))

      const f = this.folders.find((f) => f.id === id)

      if (!f) return

      f.isRenaming = true
    },
    confirmRename(id: string, nextNameRaw: string) {
      const f = this.folders.find((f) => f.id === id)

      if (!f) return

      const trimmed = nextNameRaw.trim()

      if (trimmed) {
        f.name = this.makeUniqueAgainstOthers(trimmed, id)
      }

      f.isRenaming = false

      this.save()
    },
    cancelRename(id: string) {
      const f = this.folders.find((f) => f.id === id)

      if (f) {
        f.isRenaming = false
      }
    },
  },
})
