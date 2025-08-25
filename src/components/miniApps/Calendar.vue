<template>
  <div class="w-full h-full">
    <ScheduleXCalendar :calendar-app="calendarApp" />
  </div>
</template>

<script setup lang="ts">
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createResizePlugin } from '@schedule-x/resize'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import '@schedule-x/theme-default/dist/index.css'
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD');

const eventsServicePlugin = createEventsServicePlugin();
const dragAndDropPlugin = createDragAndDropPlugin();
const resizePlugin = createResizePlugin();
const eventModalPlugin = createEventModalPlugin();

const calendarApp = createCalendar({
  views: [
    createViewDay(),
    createViewWeek(),
    createViewMonthGrid(),
    createViewMonthAgenda(),
  ],
  plugins: [
    eventsServicePlugin,
    dragAndDropPlugin,
    resizePlugin,
    eventModalPlugin,
  ],
  events: [
    {
      id: 1,
      location: 'Paris, France',
      title: "Consult Daniel's Portfolio",
      description: "This guy is not bad at all, I think I should give him a chance :)",
      start: `${today} 00:00`,
      end: `${today} 23:59`,   
    },
  ],
})
</script>

<style scoped>
</style>