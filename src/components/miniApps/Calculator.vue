<template>
  <div class="flex h-full overflow-hidden select-none" style="background-color: #1c1c1e; color: white">
    <!-- History sidebar -->
    <div
      v-if="showHistory"
      class="shrink-0 flex flex-col border-r"
      style="width: 256px; border-color: rgba(255,255,255,0.1)"
    >
      <div class="px-4 py-2.5 border-b" style="border-color: rgba(255,255,255,0.1)">
        <p class="text-xs font-semibold uppercase tracking-widest" style="color: rgba(255,255,255,0.45)">
          Previous 30 Days
        </p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <template v-if="history.length">
          <div
            v-for="(entry, i) in history"
            :key="i"
            class="px-4 py-3 border-b cursor-pointer transition-colors hover:bg-white/5"
            style="border-color: rgba(255,255,255,0.06)"
            @click="recallHistory(entry)"
          >
            <p class="text-xs mb-0.5 break-all" style="color: rgba(255,255,255,0.4)">
              {{ entry.expression }}
            </p>
            <p class="text-xl font-light tracking-tight">{{ entry.result }}</p>
          </div>
        </template>
        <div v-else class="px-4 py-10 text-center text-sm" style="color: rgba(255,255,255,0.25)">
          No calculations yet
        </div>
      </div>
    </div>

    <!-- Calculator column -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Toolbar -->
      <div class="shrink-0 flex items-center justify-between px-2.5 pt-2 pb-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          :style="{
            backgroundColor: showHistory ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: showHistory ? 'white' : 'rgba(255,255,255,0.5)',
          }"
          title="History"
          @click="toggleHistory"
        >
          <Icon icon="fluent:panel-left-20-regular" width="17" />
        </button>

        <!-- <button
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style="color: rgba(255,255,255,0.5)"
          title="Calculator"
        >
          <Icon icon="mdi:calculator-variant-outline" width="18" />
        </button> -->
      </div>

      <!-- Display -->
      <div class="flex-1 flex items-end justify-end px-5 pb-3 min-h-0 overflow-hidden">
        <p
          class="text-right leading-none font-normal break-all"
          :style="{ fontSize: display.length > 14 ? '2.5rem' : display.length > 9 ? '3.25rem' : '4.75rem' }"
        >
          {{ formattedDisplay }}
        </p>
      </div>

      <!-- Button grid — 5 rows × 4 columns of circles -->
      <div class="shrink-0 grid grid-cols-4 gap-2 px-3 pb-3">
        <!-- Row 1 -->
        <div v-bind="btn('fn')" @click="backspace">⌫</div>
        <div v-bind="btn('fn')" @click="allClear">AC</div>
        <div v-bind="btn('fn')" @click="percent">%</div>
        <div v-bind="btn('op', isActiveOp('÷'))" @click="setOp('÷')">÷</div>

        <!-- Row 2 -->
        <div v-bind="btn('num')" @click="inputDigit('7')">7</div>
        <div v-bind="btn('num')" @click="inputDigit('8')">8</div>
        <div v-bind="btn('num')" @click="inputDigit('9')">9</div>
        <div v-bind="btn('op', isActiveOp('×'))" @click="setOp('×')">×</div>

        <!-- Row 3 -->
        <div v-bind="btn('num')" @click="inputDigit('4')">4</div>
        <div v-bind="btn('num')" @click="inputDigit('5')">5</div>
        <div v-bind="btn('num')" @click="inputDigit('6')">6</div>
        <div v-bind="btn('op', isActiveOp('−'))" @click="setOp('−')">−</div>

        <!-- Row 4 -->
        <div v-bind="btn('num')" @click="inputDigit('1')">1</div>
        <div v-bind="btn('num')" @click="inputDigit('2')">2</div>
        <div v-bind="btn('num')" @click="inputDigit('3')">3</div>
        <div v-bind="btn('op', isActiveOp('+'))" @click="setOp('+')">+</div>

        <!-- Row 5 -->
        <div v-bind="btn('fn')" @click="toggleSign" style="font-size: 1rem">+/-</div>
        <div v-bind="btn('num')" @click="inputDigit('0')">0</div>
        <div v-bind="btn('fn')" @click="inputDecimal">,</div>
        <div v-bind="btn('op')" @click="calculate">=</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
  (e: 'resize', width: string): void
}>()

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  expression: string
  result: string
}

// ── State ─────────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'calculator.history'

const showHistory = ref(false)
const display = ref('0')
const firstOperand = ref<number | null>(null)
const activeOp = ref<string | null>(null)
const waitingForOperand = ref(false)
const justCalculated = ref(false)
const history = ref<HistoryEntry[]>([])

// ── Display ───────────────────────────────────────────────────────────────────

const formattedDisplay = computed(() => {
  if (display.value === 'Error') return 'Error'
  if (display.value.endsWith('.') || /\.\d*0$/.test(display.value)) return display.value
  const num = parseFloat(display.value)
  if (isNaN(num)) return display.value
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }).format(num)
})

// ── Button helpers ────────────────────────────────────────────────────────────

const COLORS = {
  num: '#3a3a3c',
  fn:  '#636366',
  op:  '#ff9f0a',
  opActive: '#ffffff',
}

const btn = (type: 'num' | 'fn' | 'op', active = false) => ({
  role: 'button',
  class:
    'aspect-square rounded-full flex items-center justify-center text-xl font-light cursor-pointer transition-transform active:scale-95 active:brightness-75 select-none',
  style: {
    backgroundColor: type === 'op' && active ? COLORS.opActive : COLORS[type],
    color: type === 'op' && active ? COLORS.op : 'white',
    fontSize: type === 'op' ? '1.6rem' : undefined,
  },
})

const isActiveOp = (op: string) => activeOp.value === op && waitingForOperand.value

// ── Logic ─────────────────────────────────────────────────────────────────────

const inputDigit = (digit: string) => {
  if (waitingForOperand.value || justCalculated.value) {
    display.value = digit
    waitingForOperand.value = false
    justCalculated.value = false
  } else {
    display.value = display.value === '0' ? digit : display.value + digit
  }
}

const inputDecimal = () => {
  if (waitingForOperand.value || justCalculated.value) {
    display.value = '0.'
    waitingForOperand.value = false
    justCalculated.value = false
    return
  }
  if (!display.value.includes('.')) display.value += '.'
}

const allClear = () => {
  display.value = '0'
  firstOperand.value = null
  activeOp.value = null
  waitingForOperand.value = false
  justCalculated.value = false
}

const backspace = () => {
  if (waitingForOperand.value || justCalculated.value) { allClear(); return }
  display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0'
}

const percent = () => {
  const val = parseFloat(display.value)
  if (!isNaN(val)) display.value = String(val / 100)
}

const toggleSign = () => {
  const val = parseFloat(display.value)
  if (!isNaN(val) && val !== 0) display.value = String(-val)
}

const compute = (a: number, b: number, op: string): number => {
  switch (op) {
    case '+':  return a + b
    case '−':  return a - b
    case '×':  return a * b
    case '÷':  return b !== 0 ? a / b : NaN
    default:   return b
  }
}

const setOp = (op: string) => {
  const val = parseFloat(display.value)
  if (firstOperand.value !== null && !waitingForOperand.value && !justCalculated.value) {
    const result = compute(firstOperand.value, val, activeOp.value!)
    display.value = isNaN(result) ? 'Error' : String(parseFloat(result.toPrecision(12)))
    firstOperand.value = isNaN(result) ? null : result
  } else {
    firstOperand.value = val
  }
  activeOp.value = op
  waitingForOperand.value = true
  justCalculated.value = false
}

const calculate = () => {
  if (firstOperand.value === null || activeOp.value === null) return
  const b = parseFloat(display.value)
  const raw = compute(firstOperand.value, b, activeOp.value!)
  const resultStr = isNaN(raw) ? 'Error' : String(parseFloat(raw.toPrecision(12)))

  addHistory({ expression: `${firstOperand.value} ${activeOp.value} ${b}`, result: resultStr })

  display.value = resultStr
  firstOperand.value = null
  activeOp.value = null
  waitingForOperand.value = false
  justCalculated.value = true
}

const recallHistory = (entry: HistoryEntry) => {
  display.value = entry.result
  firstOperand.value = null
  activeOp.value = null
  waitingForOperand.value = false
  justCalculated.value = true
}

// ── History ───────────────────────────────────────────────────────────────────

const addHistory = (entry: HistoryEntry) => {
  history.value.unshift(entry)
  if (history.value.length > 50) history.value.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) history.value = JSON.parse(raw)
  } catch {}
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
  emit('resize', showHistory.value ? '590px' : '330px')
}

// ── Keyboard ──────────────────────────────────────────────────────────────────

const onKeydown = (e: KeyboardEvent) => {
  if ('0123456789'.includes(e.key)) { inputDigit(e.key); return }
  if (e.key === '.' || e.key === ',') { inputDecimal(); return }
  if (e.key === '+') { setOp('+'); return }
  if (e.key === '-') { setOp('−'); return }
  if (e.key === '*') { setOp('×'); return }
  if (e.key === '/') { e.preventDefault(); setOp('÷'); return }
  if (e.key === '%') { percent(); return }
  if (e.key === 'Enter' || e.key === '=') { calculate(); return }
  if (e.key === 'Backspace') { backspace(); return }
  if (e.key === 'Escape') { allClear(); return }
}

onMounted(() => {
  loadHistory()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
