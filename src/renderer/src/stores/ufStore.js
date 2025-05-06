import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUfStore = defineStore('uf', () => {
  const selectedUf = ref(null)

  const setUf = (uf) => {
    selectedUf.value = uf
  }

  return {
    selectedUf,
    setUf
  }
})
