# macOS Portfolio

An interactive portfolio built as a macOS desktop simulation running in the browser. Visitors navigate a fully functional desktop UI — draggable windows, a dock, a menu bar, folders on the desktop, and a suite of mini-apps — all built with Vue 3.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)
![Vuetify](https://img.shields.io/badge/Vuetify-3-1867c0?logo=vuetify)

## Features

### Desktop environment
- **Draggable windows** — every app opens in a resizable, draggable dialog that snaps within the viewport. Windows can be maximised/minimised and brought to front.
- **Dock** — bottom bar with app icons that open the corresponding mini-apps.
- **Top menu bar** — macOS-style status bar with clock and system info.
- **Desktop folders** — create, rename, delete and drag folders directly on the desktop. State is persisted in `localStorage`.
- **Context menu** — right-click on the desktop or a folder to access actions (New Folder, Get Info, Change Wallpaper, Rename, Delete).
- **Keyboard shortcuts** — `⌘N` / `Ctrl+N` to create a new folder, `Delete`/`Backspace` to remove the selected folder, `Esc` to dismiss menus.

### Mini-apps
| App | Description |
|-----|-------------|
| **Safari** | Embedded browser-like viewer |
| **Terminal** | Simulated zsh terminal |
| **Calendar** | Interactive calendar powered by Schedule-X with drag-and-drop events |
| **Photos** | Photo gallery viewer |
| **Maps** | Interactive map via the Google Maps JS API |
| **Camera / FaceTime** | Webcam feed viewer |
| **Calculator** | Fully functional calculator with operator chaining, percentage, sign toggle, keyboard support, and a collapsible history panel |

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | [Vue 3](https://vuejs.org/) + Composition API |
| Language | TypeScript 5 |
| Build tool | [Vite 7](https://vite.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Component library | [Vuetify 3](https://vuetifyjs.com/) |
| Icons | [Iconify](https://iconify.design/) |
| State management | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router 4](https://router.vuejs.org/) |
| Calendar | [Schedule-X](https://schedule-x.dev/) |
| Maps | [Google Maps JS API Loader](https://www.npmjs.com/package/@googlemaps/js-api-loader) |
| Date utils | [Day.js](https://day.js.org/) |

## Project setup

```sh
npm install
```

### Development server

```sh
npm run dev
```

### Type-check, compile and minify for production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

### Format

```sh
npm run format
```

## Project structure

```
src/
├── assets/            Static assets (images, icons)
├── components/
│   ├── miniApps/      Individual app components (Terminal, Safari, Calendar…)
│   ├── DraggableDialog.vue   Reusable draggable window shell
│   ├── HomeContent.vue       Desktop canvas (folders, dialogs, context menu)
│   ├── HomeTopBar.vue        Menu bar
│   ├── HomeBottomBar.vue     Dock
│   └── ContextMenu.vue       Right-click context menu
├── composables/
│   └── useDraggableArea.ts   Drag-and-drop directive + clamp logic
├── stores/
│   ├── draggables.ts  Persisted window positions
│   ├── folder.ts      Desktop folder state
│   └── global.ts      App open/close state and z-index
├── router/            Vue Router configuration and views
└── types/             Shared TypeScript types
```
