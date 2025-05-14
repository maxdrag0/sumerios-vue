<template>
  <div class="container-view">
    <div class="period-selector">
      <label for="periodo">Seleccionar Período:</label>
      <input id="periodo" type="month" v-model="periodoSeleccionado" required />
    </div>

    <div class="main-content">
      <div class="uf-list">
        <table>
          <thead>
            <tr>
              <th>N° UF</th>
              <th>Titulo</th>
              <th>%</th>
              <th>Propietario</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(unidad, index) in unidadesOrdenadas"
              :key="index"
              class="clickable-row"
              @click="seleccionarUnidad(unidad, unidad.estadoCuentaUfDTO)"
            >
              <td>{{ unidad.unidadFuncional }}</td>
              <td>{{ unidad.titulo }}</td>
              <td>{{ unidad.porcentajeUnidad }}</td>
              <td>{{ unidad.apellidoPropietario }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="edit-section">
        <h3 style="font-weight: bold; margin-bottom: 5px">
          Editar Estado de Cuenta de UF {{ unidadSeleccionada.unidadFuncional }} -
          {{ unidadSeleccionada.apellidoPropietario }}. PERIODO {{ estadoCuentaUf.periodo }}
        </h3>
        <form @submit.prevent="guardarCambios" class="form-grid">
          <div>
            <label for="deuda">Deuda:</label>
            <input id="deuda" type="number" v-model="estadoCuentaUf.deuda" />
          </div>
          <div>
            <label for="intereses">Intereses:</label>
            <input id="intereses" type="number" v-model="estadoCuentaUf.intereses" />
          </div>
          <div>
            <label for="totalA">Total A:</label>
            <input id="totalA" type="number" v-model="estadoCuentaUf.totalA" />
          </div>
          <div>
            <label for="totalB">Total B:</label>
            <input id="totalB" type="number" v-model="estadoCuentaUf.totalB" />
          </div>
          <div>
            <label for="totalC">Total C:</label>
            <input id="totalC" type="number" v-model="estadoCuentaUf.totalC" />
          </div>
          <div>
            <label for="totalD">Total D:</label>
            <input id="totalD" type="number" v-model="estadoCuentaUf.totalD" />
          </div>
          <div>
            <label for="totalE">Total E:</label>
            <input id="totalE" type="number" v-model="estadoCuentaUf.totalE" />
          </div>
          <div>
            <label for="gastoParticular">Gasto Particular:</label>
            <input id="gastoParticular" type="number" v-model="estadoCuentaUf.gastoParticular" />
          </div>
          <div>
            <label for="totalFinal">Total Final:</label>
            <input id="totalFinal" type="number" v-model="estadoCuentaUf.totalExpensa" />
          </div>
          <div v-if="consorcio.segundoVencimiento">
            <label for="segundoVencimiento">Segundo Vencimiento:</label>
            <input id="segundoVencimiento" type="number" v-model="estadoCuentaUf.segundoVencimiento" />
          </div>
          <div class="form-actions">
            <button type="submit">Guardar Cambios</button>
            <button type="button" @click="cancelarEdicion">Cancelar</button>
          </div>
        </form>
        <button type="submit" @click="crearPeriodo">Terminar</button>
      </div>

      <div v-if="mostrarAdvertencia" class="mensaje-error">
        Por favor, seleccione un período antes de elegir una unidad funcional.
      </div>
    </div>
  </div>
</template>

<script setup>
// IMPORTS
import { API_CONSORCIO } from '@renderer/config/config'
import { API_UF } from '@renderer/config/config'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import axios from 'axios'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useConsorcioStore } from '@renderer/stores/consorcioStore.js'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useNavigationGuardStore } from '@renderer/stores/navigationGuardStore'
import { useRouter, useRoute } from 'vue-router'
import { showErrorDialog } from '../utils/dialogs'

// ROUTER
const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const consorcioStore = useConsorcioStore()
const intermediaStore = useIntermediaStore()
const navigationGuardStore = useNavigationGuardStore()

const idAdm = adminStore.administracionData.idAdm
const idConsorcio = route.params.idConsorcio
const consorcioUrl = API_CONSORCIO(idAdm, idConsorcio)

// API
const apiUF = `${API_UF(idAdm, idConsorcio)}`
const periodoSeleccionado = ref('')
const siguientePeriodo = ref('')

const unidades = ref([])
const consorcio = ref({})
const unidadesOrdenadas = computed(() =>
  unidades.value.slice().sort((a, b) => a.unidadFuncional - b.unidadFuncional)
)

const unidadSeleccionada = ref({})
const estadoCuentaUf = ref({
  idEstadoCuentaUf: null,
  idUf: null,
  periodo: '',
  totalMesPrevio: 0,
  deuda: 0,
  intereses: 0,
  totalA: 0,
  totalB: 0,
  totalC: 0,
  totalD: 0,
  totalE: 0,
  gastoParticular: 0,
  redondeo: 0,
  totalExpensa: 0,
  saldoFinal: 0,
  saldoExpensa: 0,
  saldoIntereses: 0,
  segundoVencimientoActivo: false,
  segundoVencimiento: 0
})

const mostrarAdvertencia = ref(false)

const expensa = ref({
  idConsorcio,
  periodo: periodoSeleccionado.value || '',
  porcentajeIntereses: 0,
  segundoVencimiento: 0
})

const seleccionarUnidad = (unidad, selectEstadoCuentaUf) => {
  if (!periodoSeleccionado.value) {
    mostrarAdvertencia.value = true
    setTimeout(() => (mostrarAdvertencia.value = false), 2000)
    return
  }
  unidadSeleccionada.value = unidad
  estadoCuentaUf.value = {
    ...selectEstadoCuentaUf,
    periodo: periodoSeleccionado.value
  }
}

const mostrarSiguientePeriodo = () => {
  if (periodoSeleccionado.value) {
    const [year, month] = periodoSeleccionado.value.split('-').map(Number)

    const fecha = new Date(year, month - 1)

    fecha.setMonth(fecha.getMonth() + 1)

    const siguienteFecha = fecha.toISOString().slice(0, 7)

    siguientePeriodo.value = siguienteFecha
  }
}

watch(periodoSeleccionado, (nuevoPeriodo) => {
  siguientePeriodo.value = ''
  mostrarSiguientePeriodo()
  expensa.value.periodo = siguientePeriodo.value
  if (unidadSeleccionada.value.unidadFuncional) {
    estadoCuentaUf.value.periodo = nuevoPeriodo
    expensa.value.periodo = nuevoPeriodo
  }
})

watch(
  () => estadoCuentaUf.value.totalExpensa,
  (nuevoValor) => {
    estadoCuentaUf.value.saldoFinal = nuevoValor
  }
)

const cargarUnidadesFuncionales = async () => {
  try {
    const response = await axios.get(apiUF)
    unidades.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error al obtener las unidades funcionales:', error)
    showErrorDialog(error)
  }
}

const guardarCambios = async () => {
  console.log('ESTADO DE CUENTA')
  console.log(JSON.stringify(estadoCuentaUf.value))
  console.log(JSON.stringify(periodoSeleccionado.value))

  try {
    await axios.put(
      `http://192.168.0.1:8080/api/estado_cuenta_uf/${estadoCuentaUf.value.idEstadoCuentaUf}`,
      estadoCuentaUf.value
    )
    cargarUnidadesFuncionales()
    cancelarEdicion()
    unidadSeleccionada.value = {}
  } catch (error) {
    console.error('Error al guardar los cambios:', error)
    showErrorDialog(error)
  }
}

const cancelarEdicion = () => {
  estadoCuentaUf.value = {
    idEstadoCuentaUf: null,
    idUf: null,
    periodo: '',
    totalMesPrevio: 0,
    deuda: 0,
    intereses: 0,
    totalA: 0,
    totalB: 0,
    totalC: 0,
    totalD: 0,
    totalE: 0,
    gastoParticular: 0,
    redondeo: 0,
    totalExpensa: 0,
    saldoFinal: 0,
    saldoExpensa: 0,
    saldoIntereses: 0,
    segundoVencimientoActivo: false,
    segundoVencimiento: 0
  }
}

const crearPeriodo = async () => {
  console.log(JSON.stringify(expensa.value))
  try {
    const response = await axios.post('http://192.168.0.1:8080/api/expensas', expensa.value)
    intermediaStore.loadIntermedias()
    navigationGuardStore.allowNavigation()
    window.api.alert('Estados de cuenta editados exitosamente.')
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error al crear la expensa:', error)
    window.api.alert('Error al crear la expensa.')
    showErrorDialog(error)
  }
}

const obtenerConsorcio = async () => {
  try {
    const response = await axios.get(consorcioUrl)
    consorcio.value = response.data
  } catch (error) {
    console.error('Error al obtener el consorcio:', error)
    showErrorDialog(error)
  }
}

onMounted(() => {
  cargarUnidadesFuncionales()
  navigationGuardStore.blockNavigation()
  obtenerConsorcio()
})

onUnmounted(() => {
  intermediaStore.loadIntermedias()
  consorcioStore.setConsorcio(null)
})
</script>

<style scoped>
.container-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.period-selector {
  margin: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.period-selector label {
  margin-right: 10px;
}

.period-selector button {
  margin-left: 10px;
}

.main-content {
  display: flex;
  justify-content: space-between;
  width: 99%;
  background: #f3d08e;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  padding: 15px;
  border: 1px solid black;
  overflow-y: auto;
  font-size: 12px;
}

.main-content::-webkit-scrollbar {
  width: 8px;
  height: 0px;
}

.main-content::-webkit-scrollbar-track {
  background: #f0f0f0; /* fondo del track del scroll */
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron); /* color del scroll "thumb" */
  border-radius: 4px;
  border: 1px solid #573b27;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e; /* color al pasar el mouse */
}

.uf-list {
  width: 90%;
  margin-right: 10px;
}

.edit-section {
  width: 45%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fafafa;
}

.edit-section form div {
  margin-bottom: 10px;
}

button {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  display: block;
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: none;
  color: black;
  font-size: 14px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}

input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

button:hover {
  background-color: #885b21e0;
}

.mensaje-error {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-weight: bold;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  min-width: 200px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  margin-bottom: 5px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  text-align: left;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.3s;
}

.clickable-row:hover {
  background-color: var(--sumerio-rojo-claro);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px; /* espacio entre filas y columnas */
}

.form-actions {
  grid-column: span 2; /* Hace que ocupe las dos columnas */
  display: flex;
  gap: 10px;
  justify-content: flex-start; /* o center, según tu diseño */
  margin-top: 10px;
}
</style>
