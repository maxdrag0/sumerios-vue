import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAdminStore = defineStore('admin', () => {
  const administradorData = ref(null)
  const administracionData = ref(null)

  // Función para cargar datos del administrador
  const loadAdministradorData = async (username) => {
    try {
      const response = await axios.get(`http://192.168.0.1:8080/api/admins/username/${username}`)
      administradorData.value = response.data
      if (response.data.idAdm !== null) {
        await loadAdmintracionData(response.data.idAdm)
      }
    } catch (error) {
      console.error('Error al cargar los datos del administrador:', error)
    }
  }

  // Función para cargar datos de la administración
  const loadAdmintracionData = async (idAdm) => {
    try {
      const response = await axios.get(`http://192.168.0.1:8080/api/administraciones/${idAdm}`)
      administracionData.value = response.data
    } catch (error) {
      console.error('Error al cargar los datos de la administración:', error)
    }
  }

  return {
    administradorData,
    administracionData,
    loadAdministradorData,
    loadAdmintracionData
  }
})
