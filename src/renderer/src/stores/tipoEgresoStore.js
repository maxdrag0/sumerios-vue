import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTipoEgresoStore = defineStore('tipoEgreso', () => {
  const selectedTipoEgreso = ref(null)

  const setTipoEgreso = (tipoEgreso) => {
    selectedTipoEgreso.value = tipoEgreso
  }

  return {
    selectedTipoEgreso,
    setTipoEgreso
  }
})
