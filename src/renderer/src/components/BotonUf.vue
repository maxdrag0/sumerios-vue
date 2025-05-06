<template>
  <div class="dropdown-wrapper">
    <!-- Botón para abrir el desplegable -->
    <button
      @click="toggleDropdown"
      class="btn btn-primary fixed-size d-flex flex-column align-items-center"
    >
      <img src="@renderer/assets/edificio.svg" alt="Edificio" class="edificio-icon" />
      <span class="text-center mt-2 text-truncate">
        {{ ufStore.selectedUf?.titulo || 'UF' }}
      </span>
    </button>

    <!-- Desplegable -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <ul>
        <li v-for="uf in ufs" :key="uf.idUf">
          <button @click="selectUf(uf)" class="dropdown-item">
            UF - {{ uf.titulo }} - {{ uf.apellidoPropietario }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { API_UF } from '@renderer/config/config'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useUfStore } from '@renderer/stores/ufStore'
import { showErrorDialog } from '../utils/dialogs'

const consorcioStore = useConsorcioStore()
const adminStore = useAdminStore()
const ufStore = useUfStore()

// Simulación de datos de consorcios
const ufs = ref([])

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectUf = (uf) => {
  ufStore.setUf(uf)
  isDropdownOpen.value = false
}

const obtenerUfsConsorcio = async () => {
  if (!consorcioStore.selectedConsorcio) return

  try {
    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, consorcioStore.selectedConsorcio.idConsorcio)}`
    )
    ufs.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error al obtener las unidades funcionales:', error)
    showErrorDialog(error)
    ufs.value = [] // Reinicializa en caso de error
  }
}

watch(
  () => consorcioStore.selectedConsorcio,
  () => {
    obtenerUfsConsorcio()
  },
  { immediate: true }
) // `immediate: true` para ejecutarlo también en el montaje

onMounted(() => {
  obtenerUfsConsorcio()
})
</script>

<style>
/* Estilo para el botón con tamaño fijo */
.fixed-size {
  width: 80px;
  height: 80px;
  padding: 10px;
  overflow: hidden;
  text-align: center;
  white-space: nowrap;
  border-radius: 20%;
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
  overflow: hidden; /* Oculta texto que excede el tamaño */
  text-overflow: ellipsis; /* Añade puntos suspensivos para texto largo */
  display: block;
  width: 100%; /* Se asegura de respetar el tamaño fijo del botón */
  font-size: 0.9em;
}

/* Estilos del dropdown */
.dropdown-menu {
  position: absolute;
  margin-top: 10px;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  z-index: 1000;
}

.dropdown-item {
  cursor: pointer;
  padding: 5px 10px;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
}

.dropdown-item:hover {
  background: #f0f0f0;
}
</style>
