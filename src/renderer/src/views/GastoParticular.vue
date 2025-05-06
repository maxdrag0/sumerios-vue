<template>
  <div class="container-view">
    <div class="selector-consorcio">
      <BotonConsorcio />
    </div>

    <div class="contenido">
      <div class="tabla-gp">
        <table class="table table-striped">
          <thead>
            <tr>
              <th @click="ordenarPor('fecha')">
                Fecha {{ ordenActual.columna === 'fecha' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('proveedor')">
                Proveedor
                {{ ordenActual.columna === 'proveedor' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('total')">
                Total {{ ordenActual.columna === 'total' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('descripcion')">
                Descripción
                {{ ordenActual.columna === 'descripcion' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('unidadFuncional')">
                Unidad Funcional
                {{ ordenActual.columna === 'unidadFuncional' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gastoParticular in gastosParticulares"
              :key="gastoParticular.idGastoParticular"
              @click="seleccionarGastoParticular(gastoParticular)"
            >
              <td>{{ gastoParticular.fecha }}</td>
              <td>{{ obtenerNombreProveedor(gastoParticular.idProveedor) }}</td>
              <td>${{ gastoParticular.totalFinal }}</td>
              <td>{{ gastoParticular.descripcion }}</td>
              <td>
                {{ obtenerUnidadFuncional(gastoParticular.idUf) || 'N/A' }} -
                {{ obtenerApellidoPropietario(gastoParticular.idUf) || 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="formulario-gp">
        <form @submit.prevent="crearOEditarGastoParticular">
          <div class="form-group">
            <input
              id="fecha"
              type="date"
              v-model="gastoParticular.fecha"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              v-model="gastoParticular.titulo"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="proveedor">Proveedor</label>
            <div class="d-flex gap-2 align-items-center">
              <select
                id="proveedor"
                v-model="gastoParticular.idProveedor"
                class="form-control"
                required
              >
                <option
                  v-for="proveedor in proveedores"
                  :key="proveedor.idProveedor"
                  :value="proveedor.idProveedor"
                >
                  {{ proveedor.nombre }}
                </option>
              </select>
              <button @click="crearProveedor" type="button" class="btn btn-primary btn-sm">
                + Nuevo
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="idUf">Unidad Funcional</label>
              <select id="idUf" v-model="gastoParticular.idUf" class="form-control" required>
                <option v-for="unidad in unidadesOrdenadas" :key="unidad.idUf" :value="unidad.idUf">
                  {{ unidad.unidadFuncional }} - {{ unidad.apellidoPropietario }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="formaPago">Forma de Pago</label>
              <select
                id="formaPago"
                v-model="gastoParticular.formaPago"
                class="form-control"
                required
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="BANCO">Transferencia</option>
                <option value="BANCO">Depósito</option>
              </select>
            </div>

            <div class="form-group">
              <label for="pagoConsorcio"> ¿Pago efectuado por el consorcio? </label>
              <input
                id="pagoConsorcio"
                type="checkbox"
                v-model="gastoParticular.pagoConsorcio"
                class="form-check-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="comprobante">Comprobante</label>
            <input
              id="comprobante"
              type="text"
              v-model="gastoParticular.comprobante"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              v-model="gastoParticular.descripcion"
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="totalFinal">Total</label>
            <input
              id="totalFinal"
              type="number"
              v-model="gastoParticular.totalFinal"
              class="form-control"
              required
              step="0.01"
              min="0"
            />
          </div>

          <div v-if="gastoParticular.idGastoParticular !== null" class="grupo-botones">
            <button type="submit" class="btn btn-primary">Actualizar</button>
            <button @click="cancelarEdicion()" type="button" class="btn btn-primary">
              Cancelar edición
            </button>
            <button
              @click="eliminarGastoParticular(gastoParticular.idGastoParticular)"
              type="button"
              class="btn btn-primary"
            >
              Eliminar
            </button>
          </div>

          <!-- Si no se está editando -->
          <button v-else type="submit" class="btn btn-primary">Crear</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
import { API_UF } from '@renderer/config/config'
import { computed, ref, watch, onUnmounted, onMounted } from 'vue'
import axios from 'axios'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useRouter } from 'vue-router'
import { showErrorDialog } from '../utils/dialogs'

const router = useRouter()
const adminStore = useAdminStore()
const consorcioStore = useConsorcioStore()
const intermediaStore = useIntermediaStore()

const selectedConsorcio = computed(() => consorcioStore.selectedConsorcio)
const ordenActual = ref({ columna: '', asc: true })
const unidades = ref([])
const unidadesOrdenadas = computed(() => {
  return unidades.value.slice().sort((a, b) => a.unidadFuncional - b.unidadFuncional)
})
const gastoParticular = ref({
  idGastoParticular: null,
  idConsorcio: null,
  idProveedor: null,
  idUf: null,
  fecha: '',
  titulo: '',
  formaPago: '',
  comprobante: '',
  descripcion: '',
  totalFinal: 0.0,
  idExpensa: null,
  periodo: '',
  pagoConsorcio: false
})

const gastosParticulares = ref([])
const proveedores = ref([])
const estadoCuentaConsorcio = ref(null)

const cargarGastosParticulares = async () => {
  try {
    if (selectedConsorcio.value) {
      const response = await axios.get(
        `http://192.168.0.1:8080/api/gastos_particulares/consorcio/${selectedConsorcio.value.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
      )
      gastosParticulares.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar los gastos particulares:', error)
  }
}

const cargarEstadoCuenta = async () => {
  try {
    if (selectedConsorcio.value) {
      const response = await axios.get(
        `http://192.168.0.1:8080/api/estado_cuenta_consorcio/consorcio/${selectedConsorcio.value.idConsorcio}`
      )
      estadoCuentaConsorcio.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar el estado de cuenta:', error)
  }
}

const cargarProveedoresAdm = async () => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores`
    )
    proveedores.value = response.data
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
  }
}

const crearProveedor = () => {
  router.push({ name: 'proveedores' })
}

const cargarUf = async () => {
  try {
    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, selectedConsorcio.value.idConsorcio)}`
    )
    unidades.value = response.data
  } catch (error) {
    console.error('Error las unidades funcionales:', error)
  }
}

const obtenerNombreProveedor = (idProveedor) => {
  const proveedor = proveedores.value.find((prov) => prov.idProveedor === idProveedor)
  return proveedor ? proveedor.nombre : 'Proveedor no encontrado'
}

const obtenerApellidoPropietario = (idUf) => {
  const uf = unidades.value.find((uf) => uf.idUf === idUf)
  return uf ? uf.apellidoPropietario : 'Propietario no encontrado'
}

const obtenerUnidadFuncional = (idUf) => {
  const uf = unidades.value.find((uf) => uf.idUf === idUf)
  return uf ? uf.unidadFuncional : 'UF no encontrada'
}

const gastosProcesados = computed(() => {
  return gastosParticulares.value.map((gasto) => ({
    ...gasto,
    proveedor: obtenerNombreProveedor(gasto.idProveedor),
    unidadFuncional:
      obtenerUnidadFuncional(gasto.idUf) + ' - ' + obtenerApellidoPropietario(gasto.idUf)
  }))
})

const ordenarPor = (columna) => {
  if (ordenActual.value.columna === columna) {
    ordenActual.value.asc = !ordenActual.value.asc
  } else {
    ordenActual.value = { columna, asc: true }
  }

  gastosParticulares.value.sort((a, b) => {
    const valorA = obtenerValorOrden(a, columna)
    const valorB = obtenerValorOrden(b, columna)

    if (typeof valorA === 'number' && typeof valorB === 'number') {
      return ordenActual.value.asc ? valorA - valorB : valorB - valorA
    } else {
      return ordenActual.value.asc
        ? valorA.toString().localeCompare(valorB.toString())
        : valorB.toString().localeCompare(valorA.toString())
    }
  })
}

const obtenerValorOrden = (item, columna) => {
  switch (columna) {
    case 'proveedor':
      return obtenerNombreProveedor(item.idProveedor) || 'ZZZ' // Valor por defecto
    case 'unidadFuncional':
      return (
        obtenerUnidadFuncional(item.idUf) + ' - ' + obtenerApellidoPropietario(item.idUf) || 'ZZZ'
      )
    case 'total':
      return item.totalFinal ?? 0 // Valor numérico por defecto
    default:
      return item[columna] ?? '' // Valor por defecto para otras columnas
  }
}

const seleccionarGastoParticular = (gastoParticularSeleccionado) => {
  gastoParticular.value = {
    idGastoParticular: gastoParticularSeleccionado.idGastoParticular,
    idConsorcio: gastoParticularSeleccionado.idConsorcio,
    idProveedor: gastoParticularSeleccionado.idProveedor,
    fecha: gastoParticularSeleccionado.fecha,
    titulo: gastoParticularSeleccionado.titulo,
    idUf: gastoParticularSeleccionado.idUf,
    formaPago: gastoParticularSeleccionado.formaPago,
    comprobante: gastoParticularSeleccionado.comprobante,
    descripcion: gastoParticularSeleccionado.descripcion,
    totalFinal: gastoParticularSeleccionado.totalFinal,
    idExpensa: gastoParticularSeleccionado.idExpensa,
    periodo: gastoParticularSeleccionado.periodo,
    pagoConsorcio: gastoParticularSeleccionado.pagoConsorcio
  }
}

const cancelarEdicion = () => {
  gastoParticular.value = {
    idGastoParticular: null,
    idConsorcio: selectedConsorcio.value.idConsorcio,
    idProveedor: null,
    idUf: null,
    fecha: '',
    titulo: '',
    formaPago: '',
    comprobante: '',
    descripcion: '',
    totalFinal: 0.0,
    idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
    periodo: intermediaStore.selectedIntermedia?.periodo,
    pagoConsorcio: false
  }
}

const crearOEditarGastoParticular = async () => {
  try {
    if (gastoParticular.value.idGastoParticular !== null) {
      await axios.put(
        `http://192.168.0.1:8080/api/gastos_particulares/${gastoParticular.value.idGastoParticular}`,
        gastoParticular.value
      )
      window.api.alert('Gasto Particular actualizado con éxito.')
    } else {
      await axios.post('http://192.168.0.1:8080/api/gastos_particulares', gastoParticular.value)
      window.api.alert('Gasto Particular creado con éxito.')
    }
    await cargarGastosParticulares()
    await cargarEstadoCuenta()

    gastoParticular.value = {
      idGastoParticular: null,
      idConsorcio: selectedConsorcio.value.idConsorcio,
      idProveedor: null,
      idUf: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      comprobante: '',
      descripcion: '',
      totalFinal: 0.0,
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
      periodo: intermediaStore.selectedIntermedia?.periodo,
      pagoConsorcio: false
    }
  } catch (error) {
    console.error('Error al crear o editar gastos particulares:', error)
    window.api.alert('Error al crear o editar gastos particulares.')
    showErrorDialog(error)
  }
}

const eliminarGastoParticular = async () => {
  const confirmar = await window.api.confirm(
    '¿Estás seguro de que quieres eliminar el gasto particular?'
  )
  if (confirmar) {
    try {
      await axios.delete(
        `http://192.168.0.1:8080/api/gastos_particulares/${gastoParticular.value.idGastoParticular}`
      )
      window.api.alert('Gasto Particular eliminado con éxito.')

      await cargarGastosParticulares()
      await cargarEstadoCuenta()
      gastoParticular.value = {
        idGastoParticular: null,
        idConsorcio: selectedConsorcio.value.idConsorcio,
        idProveedor: null,
        idUf: null,
        fecha: '',
        titulo: '',
        formaPago: '',
        comprobante: '',
        descripcion: '',
        totalFinal: 0.0,
        idExpensa: intermediaStore.selectedIntermedia?.idExpensa || null,
        periodo: intermediaStore.selectedIntermedia?.periodo,
        pagoConsorcio: false
      }
    } catch (error) {
      console.error('Error al eliminar  el gasto particular:', error)
      window.api.alert('Error al eliminar  el gasto particular.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada')
  }
}

// Cargar datos automáticamente cuando cambie el consorcio
watch(selectedConsorcio, () => {
  if (selectedConsorcio.value) {
    cargarGastosParticulares()
    cargarEstadoCuenta()
    cargarProveedoresAdm()
    cargarUf()
  }

  if (selectedConsorcio.value) {
    gastoParticular.value = {
      idGastoParticular: null,
      idConsorcio: selectedConsorcio.value.idConsorcio,
      idProveedor: null,
      idUf: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      comprobante: '',
      descripcion: '',
      totalFinal: 0.0,
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa || null,
      periodo: intermediaStore.selectedIntermedia.periodo,
      pagoConsorcio: false
    }
  } else {
    gastoParticular.value = {
      idGastoParticular: null,
      idConsorcio: null,
      idProveedor: null,
      idUf: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      comprobante: '',
      descripcion: '',
      totalFinal: 0.0,
      idExpensa: null,
      periodo: '',
      pagoConsorcio: false
    }
  }
})

onMounted(() => {
  cargarProveedoresAdm()
})

onUnmounted(() => {
  consorcioStore.setConsorcio(null)
})
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL */
.contenido {
  display: flex;
  gap: 20px;
  padding: 10px;
  height: 70vh;
  margin-bottom: 20px;
}

/* SELECTOR DE CONSORCIO */
.selector-consorcio {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
}

/* FORMULARIO Y TABLA */
.tabla-gp,
.formulario-gp {
  flex: 1;
  min-width: 0; /* para que no se rompa el diseño en pantallas chicas */
  background: #f3d08e;
  border: 1px solid black;
  border-radius: 8px;
  padding: 15px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  height: 100%;
  overflow-y: auto;
}

.tabla-gp {
  flex: 6;
}

.formulario-gp {
  flex: 4;
  font-size: 12px;
}

/* SCROLL PERSONALIZADO */
.tabla-gp::-webkit-scrollbar,
.formulario-gp::-webkit-scrollbar {
  width: 8px;
}

.tabla-gp::-webkit-scrollbar-track,
.formulario-gp::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.tabla-gp::-webkit-scrollbar-thumb,
.formulario-gp::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron);
  border-radius: 4px;
  border: 1px solid #573b27;
}

.tabla-gp::-webkit-scrollbar-thumb:hover,
.formulario-gp::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e;
}

/* TABLA */
.table {
  margin: 0;
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.table th {
  background-color: var(--sumerio-marron);
  color: black;
  font-weight: bold;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}

.table tr:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}

.table tr.selected {
  background-color: #e0f7fa;
  border-color: #00796b;
}

/* FORMULARIO */
.formulario-gp label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario-gp input {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.formulario-gp select,
textarea {
  width: 100%;
  border: 1px solid #ced4da;
}

.formulario-gp .form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.formulario-gp .form-row .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* BOTONES */
.formulario-gp .btn {
  font-weight: 600;
  background-color: var(--sumerio-marron);
  display: block;
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: none;
  color: black;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.formulario-gp .btn:hover {
  background-color: #885b21e0;
}

.grupo-botones {
  display: flex;
  gap: 10px;
}

.grupo-botones .btn {
  flex: 1;
}
</style>
