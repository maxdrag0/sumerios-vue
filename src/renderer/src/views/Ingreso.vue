<template>
  <div class="container-view">
    <div class="selector-consorcio">
      <BotonConsorcio />
    </div>

    <div class="contenido">
      <div class="tabla-ingresos">
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ingreso in ingresos"
              :key="ingreso.idIngreso"
              @click="seleccionaringreso(ingreso)"
            >
              <td>{{ ingreso.fecha }}</td>
              <td>{{ obtenerNombreProveedor(ingreso.idProveedor) }}</td>
              <td>${{ ingreso.valor }}</td>
              <td>{{ ingreso.descripcion }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="formulario-ingreso">
        <form @submit.prevent="crearOEditaringreso">
          <div class="form-group">
            <input id="fecha" type="date" v-model="ingreso.fecha" required />
          </div>

          <div class="form-group">
            <label for="titulo">Título</label>
            <input id="titulo" type="text" v-model="ingreso.titulo" required />
          </div>

          <div class="form-group">
            <label for="proveedor">Proveedor</label>
            <select id="proveedor" v-model="ingreso.idProveedor" required>
              <option
                v-for="proveedor in proveedores"
                :key="proveedor.idProveedor"
                :value="proveedor.idProveedor"
              >
                {{ proveedor.nombre }}
              </option>
            </select>
            <button @click="crearProveedor" type="button" class="btn">+ Nuevo</button>
          </div>

          <div class="form-group">
            <label for="formaPago">Forma de Pago</label>
            <select id="formaPago" v-model="ingreso.formaPago" required>
              <option value="EFECTIVO">Efectivo</option>
              <option value="BANCO">Transferencia</option>
              <option value="BANCO">Deposito</option>
            </select>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" v-model="ingreso.descripcion"></textarea>
          </div>

          <div class="form-group">
            <label for="valor">Total</label>
            <input id="valor" type="number" v-model="ingreso.valor" required step="0.01" min="0" />
          </div>

          <div v-if="ingreso.idIngreso !== null" class="grupo-botones">
            <button type="submit" class="btn btn-primary">Actualizar</button>
            <button @click="cancelarEdicion()" type="button" class="btn btn-primary">
              Cancelar edición
            </button>
            <button
              @click="eliminarIngreso(ingreso.idIngreso)"
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

    <!-- <div v-if="estadoCuentaConsorcio" class="estado-cuenta">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Total</th>
            <th>Efectivo</th>
            <th>Banco</th>
            <th>Fondo Adm</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ estadoCuentaConsorcio.total }}</td>
            <td>{{ estadoCuentaConsorcio.efectivo }}</td>
            <td>{{ estadoCuentaConsorcio.banco }}</td>
            <td>{{ estadoCuentaConsorcio.fondoAdm }}</td>
          </tr>
        </tbody>
      </table>
    </div> -->
  </div>
</template>

<script setup>
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
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

const ingreso = ref({
  idIngreso: null,
  idConsorcio: null,
  idProveedor: null,
  fecha: '',
  titulo: '',
  formaPago: '',
  descripcion: '',
  valor: 0.0,
  idExpensa: null,
  periodo: ''
})

const ingresos = ref([])
const proveedores = ref([])
const estadoCuentaConsorcio = ref(null)

const ordenActual = ref({ columna: '', asc: true })
const ordenarPor = (columna) => {
  if (ordenActual.value.columna === columna) {
    ordenActual.value.asc = !ordenActual.value.asc
  } else {
    ordenActual.value = { columna, asc: true }
  }

  ingresos.value.sort((a, b) => {
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
      return item.valor ?? 0 // Valor numérico por defecto
    default:
      return item[columna] ?? '' // Valor por defecto para otras columnas
  }
}

const cargaringresos = async () => {
  try {
    if (selectedConsorcio.value) {
      const response = await axios.get(
        `http://192.168.0.1:8080/api/ingresos/consorcio/${selectedConsorcio.value.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
      )
      ingresos.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar ingresos:', error)
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

const obtenerNombreProveedor = (idProveedor) => {
  const proveedor = proveedores.value.find((prov) => prov.idProveedor === idProveedor)
  return proveedor ? proveedor.nombre : 'Proveedor no encontrado'
}

const seleccionaringreso = (ingresoSeleccionado) => {
  ingreso.value = {
    idIngreso: ingresoSeleccionado.idIngreso,
    idConsorcio: ingresoSeleccionado.idConsorcio,
    idProveedor: ingresoSeleccionado.idProveedor,
    fecha: ingresoSeleccionado.fecha,
    titulo: ingresoSeleccionado.titulo,
    formaPago: ingresoSeleccionado.formaPago,
    descripcion: ingresoSeleccionado.descripcion,
    valor: ingresoSeleccionado.valor,
    idExpensa: ingresoSeleccionado.idExpensa,
    periodo: ingresoSeleccionado.periodo
  }
}

const cancelarEdicion = () => {
  ingreso.value = {
    idIngreso: null,
    idConsorcio: selectedConsorcio.value.idConsorcio,
    idProveedor: null,
    fecha: '',
    titulo: '',
    formaPago: '',
    descripcion: '',
    valor: 0.0,
    idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
    periodo: intermediaStore.selectedIntermedia?.periodo
  }
}

const crearOEditaringreso = async () => {
  console.log(JSON.stringify(ingreso.value))
  try {
    if (ingreso.value.idIngreso !== null) {
      // Si idIngreso no es null, actualiza el ingreso
      await axios.put(
        `http://192.168.0.1:8080/api/ingresos/${ingreso.value.idIngreso}`,
        ingreso.value
      )
      window.api.alert('Ingreso actualizado con éxito.')
    } else {
      // Si idIngreso es null, crea un nuevo ingreso
      await axios.post('http://192.168.0.1:8080/api/ingresos', ingreso.value)
      window.api.alert('Ingreso creado con éxito.')
    }
    await cargaringresos()
    await cargarEstadoCuenta()

    ingreso.value = {
      idIngreso: null,
      idConsorcio: selectedConsorcio.value.idConsorcio,
      idProveedor: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      descripcion: '',
      valor: 0.0,
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
      periodo: intermediaStore.selectedIntermedia?.periodo
    }
  } catch (error) {
    console.error('Error al crear o editar ingreso:', error)

    window.api.alert('Error al crear o editar ingreso.')
    showErrorDialog(error)
  }
}

const eliminarIngreso = async (idIngreso) => {
  const confirmar = await window.api.confirm('¿Estás seguro de que quieres eliminar el ingreso?')

  if (confirmar) {
    try {
      await axios.delete(`http://192.168.0.1:8080/api/ingresos/${idIngreso}`)
      window.api.alert('Ingreso eliminado con éxito.')
      await cargaringresos()
      await cargarEstadoCuenta()
      ingreso.value = {
        idIngreso: null,
        idConsorcio: selectedConsorcio.value.idConsorcio,
        idProveedor: null,
        fecha: '',
        titulo: '',
        formaPago: '',
        descripcion: '',
        valor: 0.0,
        idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
        periodo: intermediaStore.selectedIntermedia?.periodo
      }
    } catch (error) {
      console.error('Error al eliminar  el ingreso:', error)
      window.api.alert('Error al eliminar  el ingreso.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada.')
  }
}

// Cargar datos automáticamente cuando cambie el consorcio
watch(selectedConsorcio, () => {
  if (selectedConsorcio.value) {
    cargaringresos()
    cargarEstadoCuenta()
    cargarProveedoresAdm()
  }

  if (selectedConsorcio.value) {
    ingreso.value = {
      idIngreso: null,
      idConsorcio: selectedConsorcio.value.idConsorcio,
      idProveedor: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      descripcion: '',
      valor: 0.0,
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
      periodo: intermediaStore.selectedIntermedia?.periodo
    }
  } else {
    ingreso.value = {
      idIngreso: null,
      idConsorcio: null,
      idProveedor: null,
      fecha: '',
      titulo: '',
      formaPago: '',
      descripcion: '',
      valor: 0.0,
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

/* TARJETAS DE INGRESOS */
.tabla-ingresos,
.formulario-ingreso {
  flex: 1;
  min-width: 0;
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

.tabla-ingresos {
  flex: 6;
}

.formulario-ingreso {
  flex: 4;
  font-size: 12px;
}

/* SCROLL PERSONALIZADO */
.tabla-ingresos::-webkit-scrollbar,
.formulario-ingreso::-webkit-scrollbar {
  width: 8px;
}

.tabla-ingresos::-webkit-scrollbar-track,
.formulario-ingreso::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.tabla-ingresos::-webkit-scrollbar-thumb,
.formulario-ingreso::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron);
  border-radius: 4px;
  border: 1px solid #573b27;
}

.tabla-ingresos::-webkit-scrollbar-thumb:hover,
.formulario-ingreso::-webkit-scrollbar-thumb:hover {
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
.formulario-ingreso label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario-ingreso input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.formulario-ingreso select,
.formulario-ingreso textarea {
  width: 100%;
  margin-bottom: 5px;
  border: 1px solid #ced4da;
}

.formulario-ingreso .form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.formulario-ingreso .form-row .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* BOTONES */
.formulario-ingreso .btn {
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

.formulario-ingreso .btn:hover {
  background-color: #885b21e0;
}

.formulario-ingreso .btn:nth-child(2) {
  background-color: #6c757d;
}

.formulario-ingreso .btn:nth-child(2):hover {
  background-color: #5a6268;
}

/* ESTADO DE CUENTA (SI LO USÁS) */
.estado-cuenta {
  margin-top: 20px;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  margin: 10px;
}

/* TÍTULOS */
h3 {
  text-align: center;
  font-weight: bold;
  color: black;
  margin-bottom: 10px;
}

.grupo-botones {
  display: flex;
  gap: 10px;
}

.grupo-botones .btn {
  flex: 1;
}
</style>
