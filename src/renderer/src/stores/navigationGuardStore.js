import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationGuardStore = defineStore('navigationGuard', () => {
  const navigationBlocked = ref(false)

  const blockNavigation = async () => {
    navigationBlocked.value = true
  }

  const allowNavigation = async () => {
    navigationBlocked.value = false
  }

  return {
    navigationBlocked,
    blockNavigation,
    allowNavigation
  }
})
