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