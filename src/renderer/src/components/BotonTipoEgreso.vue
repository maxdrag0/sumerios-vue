<template>
  <div class="dropdown-wrapper">
    <button
      @click="toggleDropdown"
      class="btn btn-primary fixed-size d-flex flex-column align-items-center"
    >
      <img src="@renderer/assets/gasto.png" alt="Edificio" class="edificio-icon" />
      <span class="text-center mt-2 text-truncate">
        {{ tipoEgresoStore.selectedTipoEgreso?.descripcion || 'Egreso' }}
      </span>
    </button>

    <div v-if="isDropdownOpen" class="dropdown-menu">
      <ul>
        <li v-for="(tipoEgreso, index) in tiposEgreso" :key="tipoEgreso.name">
          <button @click="selectTipoEgreso(tipoEgreso)" class="dropdown-item">
            {{ index }} - {{ tipoEgreso.descripcion }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTipoEgresoStore } from '@renderer/stores/tipoEgresoStore'

const tipoEgresoStore = useTipoEgresoStore()
// Simulación de datos de consorcios
const tiposEgreso = ref([
  { name: 'SELECCIONAR', descripcion: 'Seleccionar' },
  { name: 'REMUNERACION_AL_PERSONAL', descripcion: 'Remuneración al personal' },
  { name: 'CARGAS_SOCIALES', descripcion: 'Cargas sociales' },
  { name: 'SERVICIOS_PUBLICOS', descripcion: 'Servicios públicos' },
  { name: 'ABONOS_SERVICIOS', descripcion: 'Abonos de servicios' },
  { name: 'MANTENIMIENTO', descripcion: 'Mantenimiento de partes comunes' },
  { name: 'TRABAJO_EN_UNIDAD', descripcion: 'Trabajo de reparaciones en unidades' },
  { name: 'GASTOS_BANCARIOS', descripcion: 'Gastos bancarios' },
  { name: 'GASTOS_DE_LIMPIEZA', descripcion: 'Gastos de limpieza' },
  { name: 'GASTOS_ADM', descripcion: 'Gastos de administración' },
  { name: 'SEGURO', descripcion: 'Pago de seguro' },
  { name: 'OTROS', descripcion: 'Otros' },
  { name: 'GASTOS_PARTICULARES', descripcion: 'Gastos particulares' }
  // { name: 'FONDO_ADM', descripcion: 'Fondo de administración' }
])

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectTipoEgreso = (tipoEgreso) => {
  if (tipoEgreso.name === 'SELECCIONAR') {
    tipoEgresoStore.setTipoEgreso(null)
  } else {
    tipoEgresoStore.setTipoEgreso(tipoEgreso)
  }
  isDropdownOpen.value = false
}
</script>

<style>
.fixed-size {
  width: 80px;
  height: 80px;
  padding: 10px;
  overflow: hidden;
  text-align: center;
  white-space: nowrap;
  border-radius: 20%;
}

.edificio-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

.text-truncate {
  overflow: hidden; /* Oculta texto que excede el tamaño */
  text-overflow: ellipsis; /* Añade puntos suspensivos para texto largo */
  display: block;
  width: 100%; /* Se asegura de respetar el tamaño fijo del botón */
  font-size: 0.9em;
}

.dropdown-menu {
  position: absolute;
  margin-top: 10px;
  background: white;
  border: 1px solid black;
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

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>
