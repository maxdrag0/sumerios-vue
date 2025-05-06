<template>
  <div class="dropdown-wrapper">
    <!-- Botón para abrir el desplegable -->
    <button
      @click="toggleDropdown"
      class="btn btn-primary fixed-size d-flex flex-column align-items-center"
    >
      <img src="@renderer/assets/edificio.svg" alt="Edificio" class="edificio-icon" />
      <span class="text-center mt-2 text-truncate">
        {{ consorcioStore.selectedConsorcio?.nombre || 'Consorcio' }}
      </span>
    </button>

    <!-- Desplegable -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <ul>
        <li v-for="consorcio in consorcios" :key="consorcio.idConsorcio">
          <button @click="selectConsorcio(consorcio)" class="dropdown-item">
            {{ consorcio.nombre }} - {{ consorcio.direccion }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { API_CONSORCIOS } from '@renderer/config/config'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useUfStore } from '../stores/ufStore'
import { showErrorDialog } from '../utils/dialogs'

const consorcioStore = useConsorcioStore()
const adminStore = useAdminStore()
const ufStore = useUfStore()
const idAdm = adminStore.administracionData.idAdm
const consorciosUrl = API_CONSORCIOS(idAdm)

// Simulación de datos de consorcios
const consorcios = ref([])

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectConsorcio = (consorcio) => {
  consorcioStore.setConsorcio(consorcio)
  if (ufStore.selectedUf !== null) {
    ufStore.setUf(null)
  }
  isDropdownOpen.value = false
}

const obtenerConsorcios = async () => {
  try {
    const response = await axios.get(consorciosUrl)

    // Asegúrate de que response.data sea un arreglo
    const consorciosData = Array.isArray(response.data) ? response.data : []

    // Ordena solo si consorciosData no está vacío
    consorcios.value = consorciosData.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } catch (error) {
    console.error('Error al obtener consorcios:', error)
    showErrorDialog(error)
  }
}

onMounted(() => {
  obtenerConsorcios()
})
</script>

<style>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

/* Estilo para el botón con tamaño fijo */
.fixed-size {
  width: 80px;
  height: 80px;
  padding: 10px;
  border-radius: 20%;

  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.fixed-size:hover {
  background-color: rgb(223, 223, 223);
  cursor: pointer;
}

/* Estilo para la imagen del edificio */
.edificio-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

/* Ajuste para el texto del consorcio */
.text-truncate {
  display: block;
  width: 100%;
  overflow: hidden; /* Oculta texto que excede el tamaño */
  text-overflow: ellipsis; /* Añade puntos suspensivos para texto largo */
  font-size: 0.9em;
  text-align: center;
}

/* Estilos del dropdown */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  z-index: 1000;
  min-width: max-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  width: 100%;
  padding: 8px 12px;
  text-align: center;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f0f0f0;
}
</style>
