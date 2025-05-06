<template>
  <div class="container-view">
    <div class="selector-consorcio">
      <BotonConsorcio />
      <BotonTipoEgreso />
    </div>

    <div class="contenido">
      <div class="tabla-egresos">
        <h4 v-if="selectedTipoEgreso !== null" style="font-weight: bold; margin-bottom: 5px">
          {{ selectedTipoEgreso.descripcion }}
        </h4>
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
              <th v-if="!selectedTipoEgreso" @click="ordenarPor('tipoEgreso')">
                Tipo de Egreso
                {{ ordenActual.columna === 'tipoEgreso' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="egreso in egresosFiltrados"
              :key="egreso.id"
              @click="seleccionarEgreso(egreso)"
            >
              <td>{{ egreso.fecha }}</td>
              <td>{{ obtenerNombreProveedor(egreso.idProveedor) }}</td>
              <td>${{ egreso.totalFinal }}</td>
              <td>{{ egreso.descripcion }}</td>
              <td v-if="!selectedTipoEgreso">{{ obtenerDescripcion(egreso.tipoEgreso) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="formulario-egreso">
        <form @submit.prevent="crearOEditarEgreso">
          <div>
            <input type="date" v-model="egreso.fecha" required />
          </div>
          <div class="form-group">
            <label for="titulo">Título</label>
            <input id="titulo" type="text" v-model="egreso.titulo" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="proveedor">Proveedor</label>
            <select id="proveedor" v-model="egreso.idProveedor" class="form-control" required>
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
          <div class="form-row">
            <div class="form-group">
              <label for="tipoEgreso">Tipo de Egreso</label>
              <select
                id="tipoEgreso"
                v-model="egreso.tipoEgreso"
                class="form-control"
                required
                @change="handleSelectChange"
              >
                <option disabled value="">Seleccionar...</option>
                <option v-for="tipo in tiposEgreso" :key="tipo.name" :value="tipo.name">
                  {{ tipo.descripcion }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="formaPago">Forma de Pago</label>
              <select id="formaPago" v-model="egreso.formaPago" class="form-control" required>
                <option value="EFECTIVO">Efectivo</option>
                <option value="BANCO">Transferencia</option>
                <option value="BANCO">Deposito</option>
                <option value="BANCO">Débito</option>
              </select>
            </div>

            <div class="form-group">
              <label for="categoriaEgreso">Categoría de Egreso</label>
              <select
                id="categoriaEgreso"
                v-model="egreso.categoriaEgreso"
                class="form-control"
                required
              >
                <option v-for="categoria in categoriasEgreso" :key="categoria" :value="categoria">
                  {{ categoria }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="comprobante">Comprobante</label>
            <input id="comprobante" type="text" v-model="egreso.comprobante" class="form-control" />
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" v-model="egreso.descripcion" class="form-control"></textarea>
          </div>
          <div class="form-group">
            <label for="totalFinal">Total</label>
            <input
              id="totalFinal"
              type="number"
              v-model="egreso.totalFinal"
              class="form-control"
              required
              step="0.01"
              min="0"
            />
          </div>
          <div v-if="egreso.idEgreso !== null" class="grupo-botones">
            <button type="submit" class="btn btn-primary">Actualizar</button>
            <button @click="cancelarEdicion()" type="button" class="btn btn-primary">
              Cancelar edición
            </button>
            <button @click="eliminarEgreso(egreso.idEgreso)" type="button" class="btn btn-primary">
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
import BotonTipoEgreso from '@renderer/components/BotonTipoEgreso.vue'
import { computed, ref, watch, onUnmounted, onMounted } from 'vue'
import axios from 'axios'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useTipoEgresoStore } from '@renderer/stores/tipoEgresoStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useRouter, useRoute } from 'vue-router'
import { showErrorDialog } from '../utils/dialogs'

// Instancias del router y la ruta actual
const router = useRouter()
const route = useRoute()

const tiposEgreso = ref([
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

const adminStore = useAdminStore()
const consorcioStore = useConsorcioStore()
const tipoEgresoStore = useTipoEgresoStore()
const intermediaStore = useIntermediaStore()

const selectedConsorcio = computed(() => consorcioStore.selectedConsorcio)
const selectedTipoEgreso = computed(() => tipoEgresoStore.selectedTipoEgreso)

const egreso = ref({
  idConsorcio: null,
  idProveedor: null,
  fecha: '',
  titulo: '',
  tipoEgreso: '',
  formaPago: '',
  comprobante: '',
  descripcion: '',
  categoriaEgreso: '',
  totalFinal: 0.0,
  idExpensa: null,
  periodo: ''
})

const egresos = ref([])
const proveedores = ref([])
const categoriasEgreso = ['A', 'B', 'C', 'D', 'E']
const estadoCuentaConsorcio = ref(null)

const egresosFiltrados = computed(() => {
  if (selectedTipoEgreso.value && Array.isArray(egresos.value)) {
    return egresos.value.filter((egreso) => {
      return egreso.tipoEgreso === selectedTipoEgreso.value.name
    })
  }

  if (selectedConsorcio.value) {
    limpiarEgreso()
  } else {
    egreso.value = {
      idEgreso: null,
      idConsorcio: null,
      idProveedor: null,
      fecha: '',
      titulo: '',
      tipoEgreso: '',
      formaPago: '',
      comprobante: '',
      descripcion: '',
      categoriaEgreso: '',
      totalFinal: 0.0,
      idExpensa: null,
      periodo: ''
    }
  }

  return egresos.value
})
const ordenActual = ref({ columna: '', asc: true })
const ordenarPor = (columna) => {
  if (ordenActual.value.columna === columna) {
    ordenActual.value.asc = !ordenActual.value.asc
  } else {
    ordenActual.value = { columna, asc: true }
  }

  egresosFiltrados.value.sort((a, b) => {
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
    case 'total':
      return item.totalFinal ?? 0 // Valor numérico por defecto
    default:
      return item[columna] ?? '' // Valor por defecto para otras columnas
  }
}

const cargarEgresos = async () => {
  try {
    if (selectedConsorcio.value) {
      const response = await axios.get(
        `http://192.168.0.1:8080/api/egresos/consorcio/${selectedConsorcio.value.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
      )
      egresos.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar egresos:', error)
    showErrorDialog(error)
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
    showErrorDialog(error)
  }
}

const cargarProveedoresAdm = async () => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores`
    )
    proveedores.value = response.data
  } catch (error) {
    console.error('Error al cargar proveedores.', error)
    showErrorDialog(error)
  }
}

const crearProveedor = () => {
  router.push({ name: 'proveedores' })
}

const obtenerNombreProveedor = (idProveedor) => {
  const proveedor = proveedores.value.find((prov) => prov.idProveedor === idProveedor)
  return proveedor ? proveedor.nombre : 'Proveedor no encontrado'
}

const seleccionarEgreso = (egresoSeleccionado) => {
  egreso.value.idEgreso = egresoSeleccionado.idEgreso
  egreso.value.idConsorcio = egresoSeleccionado.idConsorcio
  egreso.value.idProveedor = egresoSeleccionado.idProveedor
  egreso.value.fecha = egresoSeleccionado.fecha
  egreso.value.titulo = egresoSeleccionado.titulo
  egreso.value.tipoEgreso = egresoSeleccionado.tipoEgreso
  egreso.value.formaPago = egresoSeleccionado.formaPago
  egreso.value.comprobante = egresoSeleccionado.comprobante
  egreso.value.descripcion = egresoSeleccionado.descripcion
  egreso.value.categoriaEgreso = egresoSeleccionado.categoriaEgreso
  egreso.value.totalFinal = egresoSeleccionado.totalFinal
  egreso.value.idExpensa = egresoSeleccionado.idExpensa
  egreso.value.periodo = egresoSeleccionado.periodo
}

const cancelarEdicion = () => {
  limpiarEgreso()
}

const crearOEditarEgreso = async () => {
  try {
    if (egreso.value.idEgreso !== null) {
      await axios.put(`http://192.168.0.1:8080/api/egresos/${egreso.value.idEgreso}`, egreso.value)
      window.api.alert('Egreso actualizado con éxito.')
    } else {
      // Si idEgreso es null, crea un nuevo egreso
      await axios.post('http://192.168.0.1:8080/api/egresos', egreso.value)
      window.api.alert('Egreso creado con éxito.')
    }
    await cargarEgresos()
    await cargarEstadoCuenta()

    limpiarEgreso()
  } catch (error) {
    console.error('Error al crear o editar egreso:', error)
    window.api.alert('Error al crear o editar egreso.')
    showErrorDialog(error)
    limpiarEgreso()
  }
}

const eliminarEgreso = async (idEgreso) => {
  const confirmar = await window.api.confirm('¿Estás seguro de que quieres eliminar el egreso?')

  if (confirmar) {
    try {
      await axios.delete(`http://192.168.0.1:8080/api/egresos/${idEgreso}`)
      window.api.alert('Egreso eliminado con éxito.')

      await cargarEgresos()
      await cargarEstadoCuenta()
      limpiarEgreso()
    } catch (error) {
      console.error('Error al eliminar  el egreso:', error)
      window.api.alert('Error al eliminar  el egreso.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada.')
  }
}

const handleSelectChange = () => {
  if (egreso.value.tipoEgreso === '-') {
    deselectTipoEgreso()
  }
}
const deselectTipoEgreso = () => {
  tipoEgresoStore.setTipoEgreso(null)
}

const obtenerDescripcion = (tipo) => {
  const tipoEncontrado = tiposEgreso.value.find((t) => t.name === tipo)
  return tipoEncontrado ? tipoEncontrado.descripcion : tipo // Si no encuentra, muestra el nombre original
}

const limpiarEgreso = () => {
  egreso.value = {
    idEgreso: null,
    idConsorcio: selectedConsorcio.value.idConsorcio,
    idProveedor: null,
    fecha: '',
    titulo: '',
    tipoEgreso: '',
    formaPago: '',
    comprobante: '',
    descripcion: '',
    categoriaEgreso: '',
    totalFinal: 0.0,
    idExpensa: intermediaStore.selectedIntermedia?.idExpensa || null,
    periodo: intermediaStore.selectedIntermedia.periodo
  }
}
// Cargar datos automáticamente cuando cambie el consorcio
watch(selectedConsorcio, () => {
  if (selectedConsorcio.value) {
    cargarEgresos()
    cargarEstadoCuenta()
    cargarProveedoresAdm()
  }

  tipoEgresoStore.setTipoEgreso(null)

  if (selectedConsorcio.value) {
    limpiarEgreso()
  } else {
    egreso.value = {
      idEgreso: null,
      idConsorcio: null,
      idProveedor: null,
      fecha: '',
      titulo: '',
      tipoEgreso: '',
      formaPago: '',
      comprobante: '',
      descripcion: '',
      categoriaEgreso: '',
      totalFinal: 0.0,
      idExpensa: null,
      periodo: ''
    }
  }
})

onMounted(() => {
  cargarProveedoresAdm()
})

onUnmounted(() => {
  consorcioStore.setConsorcio(null)
  tipoEgresoStore.setTipoEgreso(null)
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

.tabla-egresos,
.formulario-egreso {
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

.tabla-egresos {
  flex: 6;
}

.formulario-egreso {
  flex: 4;
  font-size: 12px;
}

/* Scroll personalizado */
.tabla-egresos::-webkit-scrollbar,
.formulario-egreso::-webkit-scrollbar {
  width: 8px;
}

.tabla-egresos::-webkit-scrollbar-track,
.formulario-egreso::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.tabla-egresos::-webkit-scrollbar-thumb,
.formulario-egreso::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron);
  border-radius: 4px;
  border: 1px solid #573b27;
}

.tabla-egresos::-webkit-scrollbar-thumb:hover,
.formulario-egreso::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e;
}

/* Tabla */
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

/* Formulario */
.formulario-egreso label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario-egreso input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.formulario-egreso select,
textarea {
  width: 100%;
  border: 1px solid #ced4da;
}
.formulario-egreso button,
textarea,
select {
  margin-bottom: 5px;
}

.formulario-egreso .form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.formulario-egreso .form-row .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Botones */
.formulario-egreso .btn {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  display: block;
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: none;
  color: black;
  font-size: 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.formulario-egreso .btn:hover {
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
