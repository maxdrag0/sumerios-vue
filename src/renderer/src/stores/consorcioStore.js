import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIntermediaStore } from './intermediaStore'

export const useConsorcioStore = defineStore('consorcio', () => {
  const selectedConsorcio = ref(null)

  const setConsorcio = (consorcio) => {
    selectedConsorcio.value = consorcio
    const intermediaStore = useIntermediaStore()

    if (consorcio !== null) {
      intermediaStore.loadIntermedias()
      intermediaStore.setIntermediaForConsorcio(consorcio.idConsorcio)
    } else {
      intermediaStore.setIntermediaForConsorcio(null)
    }
  }

  return {
    selectedConsorcio,
    setConsorcio
  }
})
