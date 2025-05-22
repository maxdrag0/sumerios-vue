<template>
  <div class="container-view">
    <div class="selector-consorcio">
      <BotonConsorcio />
    </div>
    <div v-if="consorcioStore.selectedConsorcio">
      <h2
        style="
          text-align: center;
          margin-top: 1rem;
          color: black;
          font-weight: bold;
          font-size: 15px;
        "
      >
        Liquidando período -> {{ intermediaStore.selectedIntermedia?.periodo }}
      </h2>
    </div>

    <div @click="mostrarMovimientos = !mostrarMovimientos" class="toggle-movimientos">
      MOVIMIENTOS
      <span v-if="mostrarMovimientos">▼</span>
      <span v-else>▶</span>
    </div>
    <transition name="fade">
      <div v-show="mostrarMovimientos" class="tablas-container">
        <!-- Tabla de Egresos -->
        <div class="tabla">
          <h2>EGRESOS</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Titulo</th>
                <th>Proveedor</th>
                <th>Total Final</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="egresos.length === 0">
                <td colspan="4" class="text-center" style="font-size: larger">
                  No hay egresos cargados en el período.
                </td>
              </tr>
              <tr v-for="egreso in egresos" :key="egreso.idEgreso">
                <td>{{ egreso.fecha }}</td>
                <td>{{ egreso.titulo }}</td>
                <td>{{ obtenerNombreProveedor(egreso.idProveedor) }}</td>
                <td style="text-align: right">{{ currency(egreso.totalFinal) }}</td>
                <td>
                  <button class="boton-eliminar" @click="eliminarEgreso(egreso.idEgreso)">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabla de Gastos Particulares -->
        <div class="tabla">
          <h2>GASTOS PARTICULARES</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Titulo</th>
                <th>Proveedor</th>
                <th>Unidad Funcional</th>
                <th>Total Final</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="gastosParticulares.length === 0">
                <td colspan="5" class="text-center" style="font-size: larger">
                  No hay gastos particulares cargados en el período.
                </td>
              </tr>
              <tr v-else v-for="gasto in gastosParticulares" :key="gasto.idGastoParticular">
                <td>{{ gasto.fecha }}</td>
                <td>{{ gasto.titulo }}</td>
                <td>{{ obtenerNombreProveedor(gasto.idProveedor) }}</td>
                <td>
                  {{ obtenerUnidadFuncional(gasto.idUf) }} -
                  {{ obtenerApellidoPropietario(gasto.idUf) }}
                </td>
                <td>{{ currency(gasto.totalFinal) }}</td>
                <td>
                  <button
                    class="boton-eliminar"
                    @click="eliminarGastoParticular(gasto.idGastoParticular)"
                  >
                    X
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabla de Pagos UF -->
        <div class="tabla">
          <h2>PAGOS DE EXPENSA</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Unidad Funcional</th>
                <th>Forma de pago</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pagosUf.length === 0">
                <td colspan="4" class="text-center" style="font-size: larger">
                  No hay pagos registrados en el período.
                </td>
              </tr>
              <tr v-else v-for="pago in pagosUf" :key="pago.idPagoUf">
                <td>{{ pago.fecha }}</td>
                <td>
                  {{ obtenerUnidadFuncional(pago.idUf) }} -
                  {{ obtenerApellidoPropietario(pago.idUf) }}
                </td>
                <td>{{ pago.formaPago }}</td>
                <td>{{ currency(pago.valor) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabla de Ingresos -->
        <div class="tabla">
          <h2>INGRESOS</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Proveedor</th>
                <th>Valor</th>
                <th>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ingresos.length === 0">
                <td colspan="4" class="text-center" style="font-size: larger">
                  No hay ingresos cargados en el período.
                </td>
              </tr>
              <tr v-else v-for="ingreso in ingresos" :key="ingreso.idIngreso">
                <td>{{ ingreso.fecha }}</td>
                <td>{{ ingreso.titulo }}</td>
                <td>{{ obtenerNombreProveedor(ingreso.idProveedor) }}</td>
                <td>{{ currency(ingreso.valor) }}</td>
                <td>
                  <button class="boton-eliminar" @click="eliminarIngreso(ingreso.idIngreso)">
                    X
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </transition>

    <div @click="mostrarNota = !mostrarNota" class="toggle-movimientos">
      NOTA
      <span v-if="mostrarNota">▼</span>
      <span v-else>▶</span>
    </div>
    <transition name="fade">
      <div v-show="mostrarNota" class="nota">
        <textarea v-model="expensa.expensaCreateDTO.nota"></textarea>
      </div>
    </transition>

    <div @click="mostrarJuicios = !mostrarJuicios" class="toggle-movimientos">
      JUICIOS
      <span v-if="mostrarJuicios">▼</span>
      <span v-else>▶</span>
    </div>
    <transition name="fade">
      <div v-show="mostrarJuicios" class="juicios">
        <textarea v-model="expensa.expensaCreateDTO.juicios"></textarea>
      </div>
    </transition>

    <div class="detalle-expensas">
      <div class="repetir">
        <h3>Desea crear los mismos egresos para el próximo período? Luego podrá editarlos.</h3>
        <input type="checkbox" v-model="expensa.repetirEgresos" />
      </div>
      <div class="intereses">
        <h3>Intereses por mora:</h3>
        %
        <input
          type="number"
          v-model="expensa.expensaCreateDTO.porcentajeIntereses"
          placeholder="Porcentaje de intereses"
          min="0"
          step="0.01"
          style="text-align: right"
        />
      </div>
    </div>
    <div class="detalle-expensas">
      <div class="repetir">
        <h3>Segundo Vencimiento.</h3>
        <input type="checkbox" v-model="expensa.segundoVencimiento" />
      </div>
      <div v-show="expensa.segundoVencimiento" class="intereses">
        <h3>Intereses segundoVencimiento:</h3>
        %
        <input
          type="number"
          v-model="expensa.expensaCreateDTO.porcentajeSegundoVencimiento"
          placeholder="Porcentaje de intereses segundo vencimiento"
          min="0"
          step="0.01"
          style="text-align: right"
        />
      </div>
    </div>

    <div class="botones">
      <button @click="previsualizarExpensa">PREVISUALIZAR EXPENSA</button>
      <button @click="liquidarExpensa">LIQUIDAR EXPENSA</button>
      <button @click="restablecerPeriodo">RESTABLECER PERÍODO PREVIO</button>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
import { API_UF } from '@renderer/config/config'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth'
import { showErrorDialog } from '../utils/dialogs'

// Obtener stores
const adminStore = useAdminStore()
const consorcioStore = useConsorcioStore()
const intermediaStore = useIntermediaStore()
const authStore = useAuthStore()
const mostrarMovimientos = ref(false)
const mostrarNota = ref(false)
const mostrarJuicios = ref(false)

// Referencias reactivas
const selectedConsorcio = computed(() => consorcioStore.selectedConsorcio)

// Instancias del router y la ruta actual
const router = useRouter()
const route = useRoute()

// MOVIMIENTOS
const egresos = ref([])
const gastosParticulares = ref([])
const pagosUf = ref([])
const ingresos = ref([])

const expensa = ref({
  idExpensa: null,
  repetirEgresos: false,
  segundoVencimiento: false,
  expensaCreateDTO: {
    idConsorcio: null,
    periodo: null,
    porcentajeIntereses: 0,
    porcentajeSegundoVencimiento: 0,
    nota: '',
    juicios: ''
  }
})

watch(
  () => expensa.value.repetirEgresos,
  (nuevoValor) => {
    console.log('Valor de Expensa:', JSON.stringify(expensa.value))
    console.log('Valor de Repetir Egresos:', JSON.stringify(expensa.value.repetirEgresos))
  }
)

// Watch para actualizar idConsorcio al cambiar el selectedConsorcio en el store
watch(
  () => consorcioStore.selectedConsorcio,
  (newConsorcio) => {
    if (newConsorcio) {
      mostrarNota.value = false
      expensa.value.expensaCreateDTO.nota = ''
      mostrarJuicios.value = false
      expensa.value.expensaCreateDTO.juicios = ''

      cargarDatos()
      cargarProveedoresAdm()
      cargarUf()

      expensa.value.expensaCreateDTO.porcentajeIntereses = newConsorcio.porcentajeIntereses
      expensa.value.segundoVencimiento = newConsorcio.segundoVencimiento
      expensa.value.expensaCreateDTO.porcentajeSegundoVencimiento = newConsorcio.porcentajeSegundoVencimiento
    }
  }
)

const mostrarDatosExpensa = () => console.log(JSON.stringify(expensa.value))

const cargarDatos = async () => {
  if (!intermediaStore.selectedIntermedia || !intermediaStore.selectedIntermedia.periodo) {
    console.warn('El periodo no está definido.')
    return
  }

  try {
    const [egresosResponse, gastosParticularesResponse, ingresosResponse, pagosUfResponse] =
      await Promise.all([
        axios.get(
          `http://192.168.0.1:8080/api/egresos/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
        ),
        axios.get(
          `http://192.168.0.1:8080/api/gastos_particulares/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
        ),
        axios.get(
          `http://192.168.0.1:8080/api/ingresos/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
        ),
        axios.get(
          `http://192.168.0.1:8080/api/pagoUF/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}/periodo/${intermediaStore.selectedIntermedia.periodo}`
        )
      ])

    egresos.value = (egresosResponse.data || []).sort((a, b) =>
      obtenerNombreProveedor(a.idProveedor).localeCompare(obtenerNombreProveedor(b.idProveedor))
    )

    gastosParticulares.value = (gastosParticularesResponse.data || []).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )

    ingresos.value = (ingresosResponse.data || []).sort((a, b) =>
      obtenerNombreProveedor(a.idProveedor).localeCompare(obtenerNombreProveedor(b.idProveedor))
    )

    pagosUf.value = (pagosUfResponse.data || []).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )

    expensa.value.idExpensa = intermediaStore.selectedIntermedia.idExpensa
    expensa.value.expensaCreateDTO.idConsorcio = intermediaStore.selectedIntermedia.idConsorcio
    expensa.value.expensaCreateDTO.periodo = intermediaStore.selectedIntermedia.periodo
  } catch (error) {
    console.error('Error al cargar los datos:', error)
    window.api.alert('Hubo un problema al cargar los datos. Inténtalo nuevamente más tarde.')
    showErrorDialog(error)
  }
}

// PROVEEDORES
const proveedores = ref([])

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
const obtenerNombreProveedor = (idProveedor) => {
  const proveedor = proveedores.value.find((prov) => prov.idProveedor === idProveedor)
  return proveedor ? proveedor.nombre : 'Proveedor no encontrado'
}

// UFs
const unidades = ref([])

const cargarUf = async () => {
  try {
    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, selectedConsorcio.value.idConsorcio)}`
    )
    unidades.value = response.data
  } catch (error) {
    console.error('Error al cargar las unidades funcionales:', error)
  }
}

const obtenerApellidoPropietario = (idUf) => {
  const uf = unidades.value.find((uf) => uf.idUf === idUf)
  return uf ? uf.apellidoPropietario : 'Propietario no encontrado'
}

const obtenerUnidadFuncional = (idUf) => {
  const uf = unidades.value.find((uf) => uf.idUf === idUf)
  return uf ? uf.unidadFuncional : 'Propietario no encontrado'
}

const previsualizarExpensa = async () => {
  try {

    console.log(JSON.stringify(expensa.value))
    const response = await axios.post(
      `http://192.168.0.1:8080/api/expensas/preview/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}`,
      expensa.value,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf'
        },
        responseType: 'blob'
      }
    )

    authStore.activateIsPreviewExp()
    const contentType = response.headers['content-type']?.split(';')[0].trim()

    if (contentType === 'application/pdf') {
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.style.position = 'absolute'
      iframe.style.top = '0'
      iframe.style.left = '0'
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const removeButton = document.createElement('button')
      removeButton.innerText = 'CERRAR PREVISUALIZACIÓN'
      removeButton.style.position = 'absolute'
      removeButton.style.top = '15px'
      removeButton.style.right = '5px'
      removeButton.style.height = '30px'
      removeButton.style.zIndex = '1000'

      document.body.appendChild(removeButton)

      removeButton.addEventListener('click', () => {
        document.body.removeChild(iframe)
        document.body.removeChild(removeButton)
        URL.revokeObjectURL(url)
        authStore.desactivateIsPreviewExp()
      })
    } else {
      console.error(
        'No se recibió un PDF. Tipo recibido:',
        contentType,
        'Respuesta completa:',
        response
      )
      throw new Error('El servidor no devolvió un archivo PDF.')
    }
  } catch (error) {
    if (selectedConsorcio.value === null) {
      window.api.alert('Error al previsualizar la expensa, debe seleccionar un consorcio.')
    } else {
      window.api.alert('Error al previsualizar la expensa.')
    }
  }
}

const liquidarExpensa = async () => {
  try {
    // Enviar solicitud con headers y responseType 'blob'
    const response = await axios.post(
      `http://192.168.0.1:8080/api/expensas/consorcio/${consorcioStore.selectedConsorcio?.idConsorcio}`,
      expensa.value,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf'
        },
        responseType: 'blob'
      }
    )

    const contentType = response.headers['content-type']
    if (contentType !== 'application/pdf') {
      console.error('No se recibió un PDF. Tipo recibido:', contentType)
      throw new Error('El servidor no devolvió un archivo PDF.')
    }

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Expensa_${consorcioStore.selectedConsorcio?.nombre}.pdf`)
    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)

    window.api.alert('Expensa liquidada con éxito!')

    limpiarValores()
    recargarVista()
  } catch (error) {
    // Manejo de errores detallado
    if (error.response) {
      console.error('Error en la respuesta del servidor:', error.response.status)
      const reader = new FileReader()
      reader.onload = () => {
        console.error('Mensaje del servidor:', reader.result)
      }
      reader.readAsText(error.response.data)
    } else if (error.request) {
      console.error('No hubo respuesta del servidor:', error.request)
    } else {
      console.error('Error al configurar la solicitud:', error.message)
    }

    if (selectedConsorcio.value === null) {
      window.api.alert('Error al liquidar la expensa, debe seleccionar un consorcio.')
    } else {
      window.api.alert('Error al liquidar la expensa.')
    }
  }
}

const restablecerPeriodo = async () => {
  if (selectedConsorcio.value !== null) {
    const confirmar = await window.api.confirm(
      'Está seguro que quiere restablecer el período previo? Se perderá todos los cambios hechos en el período actual.'
    )
    if (confirmar) {
      try {
        const response = axios.delete(
          `http://192.168.0.1:8080/api/expensas/${expensa.value.idExpensa}`
        )
        window.api.alert('Periodo restablecido con éxito!')

        intermediaStore.loadIntermedias()
        consorcioStore.setConsorcio(null)

        egresos.value = []
        gastosParticulares.value = []
        ingresos.value = []
        pagosUf.value = []
        expensa.value = {
          idExpensa: null,
          expensaCreateDTO: {
            idConsorcio: null,
            periodo: null,
            porcentajeIntereses: 0,
            porcentajeSegundoVencimiento: 0
          }
        }
        consorcioStore.setConsorcio(null)

        recargarVista()
      } catch (error) {
        console.error('Error al liquidar la expensa:', error)
        window.api.alert('Error al liquidar la expensa!')
        showErrorDialog(error)
      }
    } else {
      window.api.alert('Accion cancelada.')
    }
  } else {
    window.api.alert('Debe seleccionar un consorcio.')
  }
}

function recargarVista() {
  router.push({ name: 'home' })
}

const limpiarValores = () => {
  intermediaStore.loadIntermedias()
  consorcioStore.setConsorcio(null)
  egresos.value = []
  gastosParticulares.value = []
  ingresos.value = []
  pagosUf.value = []
  expensa.value = {
    idExpensa: null,
    repetirEgresos: false,
    segundoVencimiento: false,
    expensaCreateDTO: {
      idConsorcio: null,
      periodo: null,
      porcentajeIntereses: 0,
      porcentajeSegundoVencimiento: 0,
      nota: '',
      juicios: ''
    }
  }
}

const currency = (value) => {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value)
}

onMounted(() => {
  intermediaStore.loadIntermedias()
})

onUnmounted(() => {
  consorcioStore.setConsorcio(null)
})
</script>

<style scoped>
.container-view {
  padding: 20px;
  overflow: scroll;
  scroll-behavior: smooth;
  background-image: '';
}

.selector-consorcio {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tablas-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  margin-top: 20px;
}

.tabla {
  border: 1px solid black;
  border-radius: 8px;
  padding: 10px;
  background: #f3d08e;
  box-shadow:
    2px 2px 2px rgba(0, 0, 0, 0.3),
    -2px -2px 2px rgba(0, 0, 0, 0.3);
  height: 300px;
  max-height: 300px;
  overflow: scroll;
}

.tabla::-webkit-scrollbar,
.container-view::-webkit-scrollbar {
  width: 8px;
  height: 0px;
}

.tabla::-webkit-scrollbar-track,
.container-view::-webkit-scrollbar-track {
  background: #f0f0f0; /* fondo del track del scroll */
  border-radius: 4px;
}

.tabla::-webkit-scrollbar-thumb,
.container-view::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron); /* color del scroll "thumb" */
  border-radius: 4px;
  border: 1px solid #573b27; /* borde opcional */
}

.tabla::-webkit-scrollbar-thumb:hover,
.container-view::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e; /* color al pasar el mouse */
}

.tabla h2 {
  text-align: center;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffffe0;
}

thead {
  background-color: var(--sumerio-marron);
  color: black;
  font-weight: bold;
}

th {
  font-weight: bold;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

tbody tr:nth-child(even) {
  background-color: #f2f2f2;
}

.detalle-expensas {
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  min-height: 60px;
}

.detalle-expensas div {
  align-content: center;
  width: 50%;
}

h3,
h2 {
  font-weight: bold;
  margin-bottom: 5px;
}

button {
  font-weight: bold;
  padding: 5px 10px;
  background-color: var(--sumerio-marron);
  color: black;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

button:hover {
  background-color: #885b21e0;
}

.repetir {
  text-align: left;
}

.intereses {
  text-align: right;
}

.botones {
  text-align: center;
}

.boton-eliminar {
  border-radius: 20%;
  background-color: rgb(220, 34, 34);
  font-size: 10px;
}

.boton-eliminar:hover {
  background-color: rgb(186, 31, 31);
}

.toggle-movimientos {
  cursor: pointer;
  background-color: var(--sumerio-marron);
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
}

.toggle-movimientos:hover {
  background-color: #885b21e0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

input[type='number'] {
  text-align: right;
  width: 100%;
  max-width: 50px;
  margin-top: 0.5rem;
}

.nota textarea,
.juicios textarea {
  width: 100%;
  min-height: 200px;
}
</style>
