import { defineStore } from 'pinia'
import type { DragState } from '@/types'

const persistKey = 'desktop.draggables'

export const useDraggablesStore = defineStore('draggables', {
  state: () => ({
    items: {} as Record<string, DragState>,
  }),
  actions: {
    loadItems() {
      try {
        const raw = localStorage.getItem(persistKey)

        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, DragState>

          this.items = parsed
        }
      } catch {}
    },
    upsert(id: string, patch: Partial<DragState>) {
      const cur = this.items[id] || { x: 0, y: 0, isDragging: false }
      this.items[id] = { ...cur, ...patch }

      this.save()
    },
    save() {
      localStorage.setItem(persistKey, JSON.stringify(this.items))
    },
    setPos(id: string, x: number, y: number) {
      this.upsert(id, { x, y })
    },
    startDrag(id: string) {
      this.upsert(id, { isDragging: true })
    },
    stopDrag(id: string) {
      this.upsert(id, { isDragging: false })
    },
    remove(id: string) {
      delete this.items[id]
    },
  },
})
