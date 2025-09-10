export interface DragState {
  x: number
  y: number
  isDragging: boolean
}

/** Single captured photo */
export interface Photo {
  id: string
  dataUrl: string
  capturedAt: Date
}

// Single bottom bar Dock item
export type AppItem = {
  id: string
  logo: string
  title: string
  width: number
  opened?: boolean
}

export type Folder = {
  id: string
  name: string
  x: number
  y: number
  isRenaming?: boolean
}
