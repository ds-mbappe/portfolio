import { useDraggablesStore } from '@/stores/draggables'
import { nextTick, onMounted, onBeforeUnmount, effectScope, watch } from 'vue'

type Cleanup = () => void

const getPadding = (el: HTMLElement) => {
  const s = getComputedStyle(el)
  return {
    left: parseFloat(s.paddingLeft) || 0,
    right: parseFloat(s.paddingRight) || 0,
    top: parseFloat(s.paddingTop) || 0,
    bottom: parseFloat(s.paddingBottom) || 0,
  }
}

export const useDraggableArea = (dropZoneRef: { value: HTMLElement | undefined }) => {
  const store = useDraggablesStore()
  let ro: ResizeObserver | null = null
  const scope = effectScope()
  const registered = new Map<string, { el: HTMLElement; cleanups: Cleanup[] }>()

  onMounted(() => {
    const dz = dropZoneRef.value
    if (!dz) return
    ro = new ResizeObserver(() => clampAll())
    ro.observe(dz)
    window.addEventListener('resize', clampAll)
  })

  onBeforeUnmount(() => {
    ro?.disconnect()
    ro = null
    window.removeEventListener('resize', clampAll)
    scope.stop()
    for (const id of [...registered.keys()]) unmakeDraggable(id)
  })

  const getContentSize = (dz: HTMLElement) => {
    const pad = getPadding(dz)
    const width = dz.clientWidth - pad.left - pad.right
    const height = dz.clientHeight - pad.top - pad.bottom
    return { pad, width, height }
  }

  const clamp = (id: string) => {
    const dz = dropZoneRef.value
    const reg = registered.get(id)
    if (!dz || !reg) return
    const { el } = reg
    const { width, height } = getContentSize(dz)
    const st = store.items[id] ?? { x: 0, y: 0, isDragging: false }

    const maxX = Math.max(0, width - el.offsetWidth)
    const maxY = Math.max(0, height - el.offsetHeight)

    // clamp
    const x = Math.max(0, Math.min(st.x, maxX))
    const y = Math.max(0, Math.min(st.y, maxY))
    if (x !== st.x || y !== st.y) store.setPos(id, x, y)

    // apply style (absolute within the zone)
    el.style.position = 'absolute'
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    el.style.willChange = 'transform' // small perf hint
  }

  const clampAll = () => {
    for (const id of registered.keys()) clamp(id)
  }

  const startPointerDrag = (id: string, e: MouseEvent) => {
    const dz = dropZoneRef.value
    const reg = registered.get(id)
    if (!dz || !reg) return

    e.preventDefault()
    e.stopPropagation()

    const rect = dz.getBoundingClientRect()
    const { pad } = getContentSize(dz)
    const st = store.items[id] ?? { x: 0, y: 0, isDragging: false }
    const el = reg.el

    store.startDrag(id)

    const offsetX = e.clientX - (rect.left + pad.left + st.x)
    const offsetY = e.clientY - (rect.top + pad.top + st.y)

    const onMove = (ev: MouseEvent) => {
      const content = getContentSize(dz)
      const newX = ev.clientX - rect.left - content.pad.left - offsetX
      const newY = ev.clientY - rect.top - content.pad.top - offsetY
      const maxX = Math.max(0, content.width - el.offsetWidth)
      const maxY = Math.max(0, content.height - el.offsetHeight)
      store.setPos(id, Math.max(0, Math.min(newX, maxX)), Math.max(0, Math.min(newY, maxY)))
      // reflect in style immediately
      const cur = store.items[id]
      el.style.left = `${cur.x}px`
      el.style.top = `${cur.y}px`
    }

    const onUp = () => {
      store.stopDrag(id)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      clamp(id) // final snap in case of rounding/layout changes
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const makeDraggable = (id: string, el: HTMLElement, handleSelector?: string) => {
    registered.set(id, { el, cleanups: [] })

    if (!store.items[id]) store.upsert(id, { x: 0, y: 0, isDragging: false })
    nextTick().then(() => clamp(id))

    const downTarget = handleSelector ? el.querySelector<HTMLElement>(handleSelector) ?? el : el
    const onMouseDown = (e: MouseEvent) => startPointerDrag(id, e)
    downTarget.addEventListener('mousedown', onMouseDown)

    const stop = scope.run(() =>
      watch(() => store.items[id], (st) => {
        if (!st) return
        el.style.left = `${st.x}px`
        el.style.top  = `${st.y}px`
      }, { deep: true, immediate: true })
    )!

    registered.get(id)!.cleanups.push(() => {
      downTarget.removeEventListener('mousedown', onMouseDown)
      stop()
    })
  }

  const unmakeDraggable = (id: string) => {
    const reg = registered.get(id)
    if (!reg) return
    reg.cleanups.forEach((fn) => fn())
    registered.delete(id)
  }

  // Ready-to-use directive we can drop on any element
  const vDraggable = {
    mounted(el: HTMLElement, binding: { value: { id: string; handle?: string } }) {
      const id = binding?.value?.id
      const handle = binding?.value?.handle
      if (!id) return
      makeDraggable(id, el, handle)
    },
    // updated(el: HTMLElement, binding: { value: { id: string } }) {
    //   const id = binding?.value?.id
    //   if (!id) return
    // },
    unmounted(_el: HTMLElement, binding: { value: { id: string } }) {
      const id = binding?.value?.id
      if (id) unmakeDraggable(id)
    },
  }

  return {
    makeDraggable,
    unmakeDraggable,
    clampAll,
    vDraggable,
  }
}
