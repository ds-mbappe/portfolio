<template>
  <div
    class="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm leading-6 overflow-y-auto"
    @click="focusInput"
    ref="termEl"
  >
    <div class="flex flex-col gap-1.5">
      <!-- HISTORY -->
      <template v-for="(line, i) in lines" :key="i">
        <div v-if="line.type === 'cmd'" class="items-start gap-2">
          <span class="text-green-500 shrink-0 select-none">{{ prompt(line.cwd ?? []) }}</span>

          <span class="whitespace-pre-wrap break-words ml-2">{{ line.text }}</span>
        </div>

        <div v-else class="whitespace-pre-wrap break-words">
          <span v-if="line.text === ''">&nbsp;</span>

          <span v-else>{{ line.text }}</span>
        </div>
      </template>

      <!-- LIVE INPUT (prompt + v-text-field) -->
      <div class="w-full items-start gap-2 relative">
        <span class="text-green-500 shrink-0 select-none">{{ prompt(cwd) }}</span>

        <span class="text-white select-none cursor-blink !ml-2">{{ buffer }}</span>

        <v-text-field
          ref="inputEl"
          v-model="buffer"
          variant="plain"
          density="compact"
          hide-details
          autofocus
          autocomplete="off"
          spellcheck="false"
          class="hidden mb-10"
          @keydown.tab.prevent.stop
          @keydown.left.prevent.stop
          @keydown.right.prevent.stop
          @keydown.enter.prevent="run(buffer)"
          @keydown.up.prevent="navHistory(-1)"
          @keydown.down.prevent="navHistory(1)"
          @keydown.tab.prevent="tabComplete"
        />
      </div>

      <div v-if="suggestions.length" class="w-full text-sky-400 -translate-y-16">
        {{ suggestions.join('    ') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, onMounted, type Ref } from 'vue'
import type { VTextField } from 'vuetify/components'

/** Types */
type FileNode = null
type DirNode = { [name: string]: FileSystemNode }
type FileSystemNode = FileNode | DirNode
type LineType = 'cmd' | 'out'
interface Line {
  type: LineType
  text: string
  cwd?: string[]
}

/** Fake filesystem */
const FS: DirNode = reactive<DirNode>({
  portfolio: { projects: { 'vue-term': { 'README.md': null } }, docs: {}, 'readme.txt': null },
  etc: { config: { 'app.json': null } },
  var: { log: {} },
})

/** State */
const termEl: Ref<HTMLDivElement | null> = ref(null)
const inputEl: Ref<InstanceType<typeof VTextField> | null> = ref(null)
const lines: Ref<Line[]> = ref([])
const cwd: Ref<string[]> = ref(['portfolio'])
const buffer: Ref<string> = ref('')
const history: Ref<string[]> = ref([])
const suggestions: Ref<string[]> = ref([])
let historyIndex: number = -1

/** Helpers (arrow) */
const prompt = (pathArr: string[]): string =>
  `thedastem@Daniels-MacBook-Pro ${formatPath(pathArr)} %`

const formatPath = (pathArr: string[]): string =>
  pathArr.length === 0 ? '/' : '/' + pathArr.join('/')

const isDir = (node: FileSystemNode | undefined): node is DirNode =>
  !!node && typeof node === 'object'

const getNodeFrom = (pathArr: string[]): FileSystemNode | undefined => {
  let node: FileSystemNode = FS
  for (const part of pathArr) {
    if (!isDir(node) || !(part in node)) return undefined
    node = node[part]
  }
  return node
}

const resolvePath = (input: string, base: string[] = cwd.value): string[] => {
  if (!input || input.trim() === '') return [...base]
  const parts: string[] = input.split('/').filter(Boolean)
  const result: string[] = input.startsWith('/') ? [] : [...base]
  for (const p of parts) {
    if (p === '.') continue
    if (p === '..') {
      if (result.length > 0) result.pop()
      continue
    }
    result.push(p)
  }
  return result
}

const listDir = (pathArr: string[]): { entries: [string, boolean][] } | { error: string } => {
  const node: FileSystemNode | undefined = getNodeFrom(pathArr)
  if (!isDir(node)) return { error: 'Not a directory' }
  const entries: [string, boolean][] = Object.keys(node)
    .sort()
    .map((name: string): [string, boolean] => {
      const child: FileSystemNode = node[name]
      return [name, isDir(child)]
    })
  return { entries }
}

const addOut = (text: string = ''): void => {
  lines.value.push({ type: 'out', text })
}
const addCmd = (text: string, cwdSnap: string[]): void => {
  lines.value.push({ type: 'cmd', text, cwd: [...cwdSnap] })
}

const scrollToBottom = (): void => {
  void nextTick(() => {
    const el: HTMLDivElement | null = termEl.value
    if (el) el.scrollTo({ top: el.scrollHeight })
  })
}

/** Command runner */
const run = (raw: string): void => {
  if (suggestions.value.length) {
    suggestions.value = []
  }

  const input: string = (raw || '').trim()
  addCmd(input, cwd.value)
  if (input) {
    history.value.push(input)
    historyIndex = history.value.length
  }

  const parts: string[] = input.split(/\s+/).filter(Boolean)
  const cmd: string = (parts[0] ?? '').toLowerCase()
  const args: string[] = parts.slice(1)

  switch (cmd) {
    case '':
      break
    case 'clear':
      lines.value = []
      break
    case 'pwd':
      addOut(formatPath(cwd.value))
      break
    case 'ls': {
      const target: string[] = resolvePath(args[0] ?? '', cwd.value)
      const res = listDir(target)
      if ('error' in res) addOut(`ls: ${args[0] ?? '.'}: ${res.error}`)
      else addOut(res.entries.map(([n, d]) => (d ? n + '/' : n)).join('  '))
      break
    }
    case 'cd': {
      const target: string[] = resolvePath(args[0] ?? '', cwd.value)
      const node: FileSystemNode | undefined = getNodeFrom(target)
      if (node === undefined) addOut(`cd: no such file or directory: ${args[0] ?? ''}`)
      else if (!isDir(node)) addOut(`cd: not a directory: ${args[0] ?? ''}`)
      else cwd.value = target
      break
    }
    case 'help':
      addOut('Available commands: ls, cd, pwd, clear, help')
      break
    default:
      if (cmd) addOut(`command not found: ${cmd}`)
  }

  buffer.value = ''
  focusInput()
  scrollToBottom()
}

/** History nav */
const navHistory = (delta: number): void => {
  if (!history.value.length) return
  historyIndex = Math.min(history.value.length, Math.max(0, historyIndex + delta))
  buffer.value = historyIndex === history.value.length ? '' : history.value[historyIndex]
  // put caret at end
  void nextTick(() => {
    // Vuetify exposes underlying input via $el; this keeps it simple:
    const el: HTMLInputElement | null = inputEl.value?.$el?.querySelector(
      'input',
    ) as HTMLInputElement | null
    const len: number = buffer.value.length
    el?.setSelectionRange?.(len, len)
  })
}

/** Focus */
const focusInput = (): void => {
  // prefer component method, fall back to querying the native input
  if (inputEl.value?.focus) inputEl.value.focus()
  else {
    const el: HTMLInputElement | null = inputEl.value?.$el?.querySelector(
      'input',
    ) as HTMLInputElement | null
    el?.focus()
  }
}

/** Tab suggestions */
const tabComplete = (): void => {
  const parts = buffer.value.split(/\s+/)
  const cmd = parts[0]
  const arg = parts[1] ?? ''

  // only complete after `cd` or `ls`
  if (cmd === 'cd' || cmd === 'ls') {
    const basePath = resolvePath('.', cwd.value)
    const node = getNodeFrom(basePath)
    if (!isDir(node)) return

    const matches = Object.keys(node).filter((name) => name.startsWith(arg))
    suggestions.value = matches

    if (matches.length === 1) {
      // auto-complete in buffer
      parts[1] = matches[0] + (isDir(node[matches[0]]) ? '/' : '')
      buffer.value = parts.join(' ')
      suggestions.value = []
    }
  }
}

/** Lifecycle */
onMounted((): void => {
  focusInput()
  addOut('Type "help" to get started.')
  scrollToBottom()
})
</script>

<style scoped>
* :deep(.v-field__input) {
  margin-top: 0px !important;
  padding-left: 4px !important;
  padding-right: 4px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  opacity: 0 !important;

  font-size: 16px !important;
  font-weight: 600 !important;

  min-height: 24px !important;

  background-color: transparent !important;
}

@keyframes cursor-blink {
  0% {
    opacity: 0;
  }
}

.cursor-blink::after {
  content: '';
  position: absolute;
  padding-top: 5px;
  margin-left: 1px;
  width: 8px;
  height: 20px;
  background: white;
  display: inline-block;
  animation: cursor-blink 1.4s steps(2) infinite;
}
</style>
