import moment from 'moment'
import { ref, onMounted, onUnmounted } from 'vue'

export const useClock = (updateInterval = 1000) => {
  const currentTime = ref('')
  const currentDate = ref('')
  const currentDateTime = ref('')
  let interval: number | null = null

  const updateTime = () => {
    currentTime.value = moment().format('HH:mm')
    currentDate.value = moment().format('dddd, MMM D')
    currentDateTime.value = moment().format("ddd MMM D HH:mm")
  }

  const startClock = () => {
    if (interval) return
    
    updateTime()
    interval = setInterval(updateTime, updateInterval)
  }

  const stopClock = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  onMounted(() => {
    startClock()
  })

  onUnmounted(() => {
    stopClock()
  })

  return {
    currentTime,
    currentDate,
    currentDateTime,
  }
}