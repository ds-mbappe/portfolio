import { defineStore } from 'pinia'

import sunrise from '@/assets/wallpapers/Sequoia-Sunrise.png'
import finder from '@/assets/finder.png'
import safari from '@/assets/safari.webp'
import terminal from '@/assets/terminal.png'
import photos from '@/assets/photos.png'
import maps from '@/assets/maps.png'
import facetime from '@/assets/facetime.png'
import calendar from '@/assets/calendar.webp'
import notes from '@/assets/notes.webp'
import calculator from '@/assets/calculator.webp'
import settings from '@/assets/settings.png'

import type { Photo } from '@/types'

const bottomItems = [
  {
    id: 'finder',
    logo: finder,
    width: 62,
    opened: true,
    active: true,
    zIndex: 1,
  },
  {
    id: 'safari',
    logo: safari,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'terminal',
    logo: terminal,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'photos',
    logo: photos,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'facetime',
    logo: facetime,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'maps',
    logo: maps,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'calendar',
    logo: calendar,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'notes',
    logo: notes,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'calculator',
    logo: calculator,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
  {
    id: 'settings',
    logo: settings,
    width: 62,
    opened: false,
    active: false,
    zIndex: 1,
  },
]

export const useGlobalStore = defineStore('global', {
  state: () => ({
    initialWindowsIndex: 10,
    background: sunrise,
    apps: [],
    folders: [],
    files: [],
    cameraPhotos: [] as Photo[],
    deletedElements: [],
    terminalItems: [],
    bottomItems: bottomItems,
    trashActive: false,
  }),
  actions: {},
})
