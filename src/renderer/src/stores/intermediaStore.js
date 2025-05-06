import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { showErrorDialog } from '../utils/dialogs'

export const useIntermediaStore = defineStore('intermedia', () => {
  const intermedias = ref([])
  const selectedIntermedia = ref(null)
  const expensas = ref([])
  const expensa = ref({
    idConsorcio: '',
    periodo: '',
    porcentajeIntereses: 0,
    segundoVencimiento: 0
  })

  const loadIntermedias = async () => {
    try {
      const response = await axios.get('http://192.168.0.1:8080/api/intermedia_expensa_consorcio')
      intermedias.value = response.data
    } catch (error) {
      console.error('Error al cargar los datos intermedios:', error)
      showErrorDialog(error)
    }
  }

  const setIntermediaForConsorcio = (idConsorcio) => {
    if (idConsorcio === null) {
      selectedIntermedia.value = null
      return
    }

    if (!Array.isArray(intermedias.value)) {
      console.error('intermedias.value no es un arreglo:', intermedias.value)
      return
    }

    selectedIntermedia.value =
      intermedias.value.find((intermedia) => intermedia.idConsorcio === idConsorcio) || null

    console.log(JSON.stringify(selectedIntermedia.value))

    if (selectedIntermedia.value === null) {
      loadExpensas(idConsorcio)
      console.log(JSON.stringify(expensas.value))
      expensa.value.idConsorcio = idConsorcio

      const now = new Date()
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      expensa.value.periodo = yearMonth
      crearPeriodo()

      loadExpensas(idConsorcio)
    }

    expensas.value = []
  }

  const loadExpensas = async (idConsorcio) => {
    try {
      const response = await axios.get(
        `http://192.168.0.1:8080/api/expensas/consorcio/${idConsorcio}`
      )
      expensas.value = response.data
    } catch (error) {
      console.error('Error al cargar los datos intermedios:', error)
      showErrorDialog(error)
    }
  }

  const crearPeriodo = async () => {
    try {
      const response = await axios.post('http://192.168.0.1:8080/api/expensas', expensa.value)
      toast.success('Periodo creado correctamente...', {
        theme: 'colored',
        type: 'info',
        position: 'top-center',
        transition: 'zoom',
        dangerouslyHTMLString: true
      })
    } catch (error) {
      console.error('Error al crear la expensa:', error)
      showErrorDialog(error)
    }
  }

  return {
    intermedias,
    selectedIntermedia,
    loadIntermedias,
    setIntermediaForConsorcio
  }
})
