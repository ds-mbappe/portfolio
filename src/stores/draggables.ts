import { defineStore } from 'pinia'
import type { DragState } from '@/types'

export const useDraggablesStore = defineStore('draggables', {
  state: () => ({
    items: {} as Record<string, DragState>,
  }),
  actions: {
    upsert(id: string, patch: Partial<DragState>) {
      const cur = this.items[id] || { x: 0, y: 0, isDragging: false }
      this.items[id] = { ...cur, ...patch }
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
