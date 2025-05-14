<template>
  <div class="container-view">
    <!-- <h1>Crear Unidades Funcionales - {{ consorcio.nombre }} : {{ consorcio.direccion }}</h1> -->

    <!-- Contenedor para el listado y el formulario -->
    <div class="container">
      <!-- Listado de Unidades Funcionales -->
      <div class="listado-unidades">
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
              @click="seleccionarUnidad(unidad)"
            >
              <td>{{ unidad.unidadFuncional }}</td>
              <td>{{ unidad.titulo }}</td>
              <td>{{ unidad.porcentajeUnidad }}</td>
              <td>{{ unidad.apellidoPropietario }}</td>
            </tr>
          </tbody>
        </table>
        <h3>Porcentaje total = {{ porcentajeTotalUF }}</h3>
      </div>

      <!-- Formulario para crear Unidades Funcionales -->
      <div class="formulario-crear">
        <div v-if="!banderaSeleccion">
          <form @submit.prevent="agregarUnidadFuncional">
            <!-- Campos del formulario para unidad funcional -->
            <div class="form-row">
              <div class="form-group">
                <label for="numero">N° UF</label>
                <input type="text" v-model="unidad.unidadFuncional" placeholder="1" required />
              </div>
              <div class="form-group">
                <label for="titulo">Titulo</label>
                <input type="text" v-model="unidad.titulo" placeholder="1°A" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="porcentajeUnidad">PORC. A</label>
                <input
                  type="number"
                  v-model="unidad.porcentajeUnidad"
                  @input="onInputChange"
                  :placeholder="`${unidad.porcentajeUnidad}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.0001"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORC. B</label>
                <input
                  type="number"
                  v-model="unidad.porcentajeUnidadB"
                  @input="onInputChange"
                  :placeholder="`${unidad.porcentajeUnidadB}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.0001"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="porcentajeUnidad">PORC. C</label>
                <input
                  type="number"
                  v-model="unidad.porcentajeUnidadC"
                  @input="onInputChange"
                  :placeholder="`${unidad.porcentajeUnidadC}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.0001"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORC. D</label>
                <input
                  type="number"
                  v-model="unidad.porcentajeUnidadD"
                  @input="onInputChange"
                  :placeholder="`${unidad.porcentajeUnidadD}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.0001"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORC. E</label>
                <input
                  type="number"
                  v-model="unidad.porcentajeUnidadE"
                  @input="onInputChange"
                  :placeholder="`${unidad.porcentajeUnidadE}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.0001"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <!-- Propietario -->
            <div class="form-row">
              <div class="form-group">
                <label for="nombrePropietario">Nombre del Propietario</label>
                <input type="text" v-model="unidad.nombrePropietario" placeholder="Juan" />
              </div>
              <div class="form-group">
                <label for="apellidoPropietario">Apellido del Propietario</label>
                <input
                  type="text"
                  v-model="unidad.apellidoPropietario"
                  required
                  placeholder="Perez"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="mailPropietario">Mail del Propietario</label>
                <input
                  type="email"
                  v-model="unidad.mailPropietario"
                  placeholder="juanperez@gmail.com"
                />
              </div>
              <div class="form-group">
                <label for="telefonoPropietario">Telefono del Propietario</label>
                <input
                  type="text"
                  v-model="unidad.telefonoPropietario"
                  placeholder="112233445566"
                />
              </div>
            </div>

            <!-- Inquilino -->
            <div class="form-row">
              <div class="form-group">
                <label for="nombreInquilino">Nombre del Inquilino</label>
                <input type="text" v-model="unidad.nombreInquilino" placeholder="Carlos" />
              </div>
              <div class="form-group">
                <label for="apellidoInquilino">Apellido del Inquilino</label>
                <input type="text" v-model="unidad.apellidoInquilino" placeholder="Lopez" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="mailInquilino">Mail del Inquilino</label>
                <input
                  type="email"
                  v-model="unidad.mailInquilino"
                  placeholder="carloslopez@gmail.com"
                />
              </div>
              <div class="form-group">
                <label for="telefonoInquilino">Telefono del Inquilino</label>
                <input type="text" v-model="unidad.telefonoInquilino" placeholder="112233445566" />
              </div>
            </div>

            <button type="submit">Agregar Unidad</button>
          </form>
          <button @click="abrirOpcionesTerminar">Terminar Creación</button>

          <!-- Modal para las opciones -->
          <div v-if="mostrarOpcionesTerminar" class="modal-overlay">
            <div class="modal-content">
              <h2>¿Qué deseas hacer?</h2>
              <button @click="editarEstadosCuenta">Editar Manualmente los Estados de Cuenta</button>
              <button @click="cargarGastos">Cargar Gastos Manualmente</button>
              <button @click="cerrarOpcionesTerminar">Cancelar</button>
            </div>
          </div>

          <div v-if="seleccionarPeriodo" class="modal-overlay">
            <div class="modal-content">
              <label for="periodo">Seleccionar Período a cargar:</label>
              <input id="periodo" type="month" v-model="periodoSeleccionado" required />

              <button @click="crearPeriodo">Enviar Período</button>
            </div>
          </div>
        </div>

        <div v-else>
          <h2>
            Edicion UF {{ unidadSeleccionada.unidadFuncional }} - {{ unidadSeleccionada.titulo }} -
            {{ unidadSeleccionada.apellidoPropietario }}
          </h2>
          <form @submit.prevent="updateUnidad">
            <div>
              <label for="numero">N° UF:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.unidadFuncional"
                @input="onInputChange"
                required
              />
            </div>
            <div>
              <label for="numero">Titulo:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.titulo"
                @input="onInputChange"
                required
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="porcentajeUnidad">PORCENTAJE A</label>
                <input
                  type="number"
                  v-model="unidadSeleccionada.porcentajeUnidad"
                  @input="onInputChange"
                  :placeholder="`${unidadSeleccionada.porcentajeUnidad}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORCENTAJE B</label>
                <input
                  type="number"
                  v-model="unidadSeleccionada.porcentajeUnidadB"
                  @input="onInputChange"
                  :placeholder="`${unidadSeleccionada.porcentajeUnidadB}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORCENTAJE C</label>
                <input
                  type="number"
                  v-model="unidadSeleccionada.porcentajeUnidadC"
                  @input="onInputChange"
                  :placeholder="`${unidadSeleccionada.porcentajeUnidadC}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORCENTAJE D</label>
                <input
                  type="number"
                  v-model="unidadSeleccionada.porcentajeUnidadD"
                  @input="onInputChange"
                  :placeholder="`${unidadSeleccionada.porcentajeUnidadD}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="porcentajeUnidad">PORCENTAJE E</label>
                <input
                  type="number"
                  v-model="unidadSeleccionada.porcentajeUnidadE"
                  @input="onInputChange"
                  :placeholder="`${unidadSeleccionada.porcentajeUnidadE}`"
                  id="porcentajeUnidad"
                  class="form-control"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <!-- Propietario -->
              <label for="apellidoPropietario">Apellido del Propietario:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.apellidoPropietario"
                @input="onInputChange"
                required
              />
            </div>
            <div>
              <label for="nombrePropietario">Nombre del Propietario:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.nombrePropietario"
                @input="onInputChange"
              />
            </div>
            <div>
              <label for="telefonoPropietario">Telefono del Propietario:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.telefonoPropietario"
                @input="onInputChange"
              />
            </div>
            <div>
              <label for="mailPropietario">Mail del Propietario:</label>
              <input
                type="email"
                v-model="unidadSeleccionada.mailPropietario"
                @input="onInputChange"
              />
            </div>
            <!-- Inquilino -->
            <div>
              <label for="apellidoInquilino">Apellido del Inquilino:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.apellidoInquilino"
                @input="onInputChange"
              />
            </div>
            <div>
              <label for="nombreInquilino">Nombre del Inquilino:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.nombreInquilino"
                @input="onInputChange"
              />
            </div>
            <div>
              <label for="telefonoInquilino">Telefono del Inquilino:</label>
              <input
                type="text"
                v-model="unidadSeleccionada.telefonoInquilino"
                @input="onInputChange"
              />
            </div>
            <div>
              <label for="mailInquilino">Mail del Inquilino:</label>
              <input
                type="email"
                v-model="unidadSeleccionada.mailInquilino"
                @input="onInputChange"
              />
            </div>

            <button type="submit">Guardar cambios</button>
          </form>
          <button type="submit" @click="cancelarEdicion()">Cancelar edicion</button>
          <button type="submit" @click="eliminarUnidad(unidadSeleccionada.idUf)">
            Eliminar Unidad Funcional
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//IMPORTS
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import axios from 'axios'
import { API_UF, API_CONSORCIOS } from '@renderer/config/config'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useNavigationGuardStore } from '@renderer/stores/navigationGuardStore'
import { Decimal } from 'decimal.js'
import { showErrorDialog } from '../utils/dialogs'

// ROUTER
const route = useRoute()
const router = useRouter()

// PARAMETROS RECIBIDOS
const adminStore = useAdminStore()
const idAdm = adminStore.administracionData.idAdm
const idConsorcio = route.params.idConsorcioCreado
const consorciosUrl = API_CONSORCIOS(idAdm)
const intermediaStore = useIntermediaStore()
const navigationGuardStore = useNavigationGuardStore()

const consorcio = ref({})
// DIRECCIONES DE API
const apiUF = `${API_UF(idAdm, idConsorcio)}`

// UNIDAD EN CREACION
const unidad = ref({
  idUf: '',
  idConsorcio,
  unidadFuncional: '',
  titulo: '',
  porcentajeUnidad: 0.0,
  porcentajeUnidadB: 0.0,
  porcentajeUnidadC: 0.0,
  porcentajeUnidadD: 0.0,
  porcentajeUnidadE: 0.0,
  apellidoPropietario: '',
  nombrePropietario: '',
  mailPropietario: '',
  telefonoPropietario: '',
  apellidoInquilino: '',
  nombreInquilino: '',
  mailInquilino: '',
  telefonoInquilino: ''
})

// LISTA DE UF
const unidades = ref([])
const unidadesOrdenadas = computed(() => {
  return unidades.value.slice().sort((a, b) => a.unidadFuncional - b.unidadFuncional)
})
const porcentajeTotalUF = ref(0)

const estadoCuentaUfUpdatePeriodo = ref({
  unidadFuncionalList: [],
  periodo: null
})

// MODIFICACION DE UF
const unidadSeleccionada = ref({
  idUf: '',
  idConsorcio,
  unidadFuncional: '',
  titulo: '',
  porcentajeUnidad: 0.0,
  porcentajeUnidadB: 0.0,
  porcentajeUnidadC: 0.0,
  porcentajeUnidadD: 0.0,
  porcentajeUnidadE: 0.0,
  apellidoPropietario: '',
  nombrePropietario: '',
  mailPropietario: '',
  telefonoPropietario: '',
  apellidoInquilino: '',
  nombreInquilino: '',
  mailInquilino: '',
  telefonoInquilino: ''
})

const banderaSeleccion = ref(false)
const unsavedChanges = ref(false)

// FUNCION PARA OBTENER LAS UNIDADES FUNCIONALES DEL CONSORCIO ENVIADO
const obtenerUnidadesFuncionales = async () => {
  try {
    const response = await axios.get(apiUF)
    unidades.value = Array.isArray(response.data) ? response.data : []
    calcularSumaUF()
    const responseConsorcio = await axios.get(`${consorciosUrl}/${idConsorcio}`)
    consorcio.value = responseConsorcio.data
  } catch (error) {
    console.error('Error al obtener las unidades funcionales:', error)
    showErrorDialog(error)
    unidades.value = [] // Reinicializa en caso de error
  }
}

// CALCULA EL TOTAL DEL PORCENTAJE
const calcularSumaUF = () => {
  let suma = new Decimal(0)

  unidades.value.forEach((uf) => {
    suma = suma.plus(new Decimal(uf.porcentajeUnidad || 0))
  })

  porcentajeTotalUF.value = parseFloat(suma.toFixed(5)) // Redondea a 5 decimales y convierte a número
}

// SELECCION DE UF
const seleccionarUnidad = (unidadFuncional) => {
  unidadSeleccionada.value = {
    idUf: unidadFuncional.idUf || null,
    idConsorcio: unidadFuncional.idConsorcio || 0,
    unidadFuncional: unidadFuncional.unidadFuncional || 0,
    titulo: unidadFuncional.titulo || '',
    porcentajeUnidad: unidadFuncional.porcentajeUnidad || 0.0,
    porcentajeUnidadB: unidadFuncional.porcentajeUnidadB || 0.0,
    porcentajeUnidadC: unidadFuncional.porcentajeUnidadC || 0.0,
    porcentajeUnidadD: unidadFuncional.porcentajeUnidadD || 0.0,
    porcentajeUnidadE: unidadFuncional.porcentajeUnidadE || 0.0,

    // Datos del propietario
    apellidoPropietario: unidadFuncional.apellidoPropietario || '',
    nombrePropietario: unidadFuncional.nombrePropietario || '',
    mailPropietario: unidadFuncional.mailPropietario || '',
    telefonoPropietario: unidadFuncional.telefonoPropietario || '',

    // Datos del inquilino (si aplica)
    apellidoInquilino: unidadFuncional.apellidoInquilino || '',
    nombreInquilino: unidadFuncional.nombreInquilino || '',
    mailInquilino: unidadFuncional.mailInquilino || '',
    telefonoInquilino: unidadFuncional.telefonoInquilino || ''
  }
  banderaSeleccion.value = true
  console.log(JSON.stringify(unidadSeleccionada.value))
}

// MARCAR CAMBIOS REALIZADOS
const onInputChange = () => {
  unsavedChanges.value = true
}

// GUARDAR EDICION
const updateUnidad = async () => {
  try {
    const response = await axios.put(
      `${apiUF}/${unidadSeleccionada.value.idUf}`,
      unidadSeleccionada.value
    )
    console.log('UF actualizado:', response.data)
    window.api.alert(
      'UF ' +
        unidadSeleccionada.value.unidadFuncional +
        ' - ' +
        unidadSeleccionada.value.titulo +
        ' editada con exito'
    )

    banderaSeleccion.value = false
    unsavedChanges.value = false
    limpiarUnidades()
    obtenerUnidadesFuncionales()
  } catch (error) {
    console.error('Error actualizando la UF:', error)
    window.api.alert('Hubo un error al actualizar la UF.')
    showErrorDialog(error)
  }
}

// CANCELAR EDICION
const cancelarEdicion = () => {
  banderaSeleccion.value = false
  unsavedChanges.value = false
  limpiarUnidades()
}

// ELIMINAR UF SELECCIONADA
const eliminarUnidad = async (idUf) => {
  const confirmar = await window.api.confirm(
    `¿Estás seguro de que quieres eliminar la UF ${unidadSeleccionada.value.unidadFuncional} - ${unidadSeleccionada.value.titulo}?`
  )

  if (confirmar) {
    try {
      const response = await axios.delete(`${apiUF}/${idUf}`)
      window.api.alert(
        'UF ' +
          unidadSeleccionada.value.unidadFuncional +
          ' - ' +
          unidadSeleccionada.value.titulo +
          ' eliminada con exito'
      )

      banderaSeleccion.value = false
      unsavedChanges.value = false
      limpiarUnidades()
      obtenerUnidadesFuncionales()
    } catch (error) {
      console.error('Error eliminando la UF:', error)
      window.api.alert('Hubo un error al eliminar la UF.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada')
  }
}

// FUNCION BOTON AGREGAR UNIDAD
const agregarUnidadFuncional = async () => {
  try {
    console.log(('Datos a enviar:', JSON.stringify(unidad.value)))
    const response = await axios.post(apiUF, unidad.value)
    unidades.value.push({ ...unidad.value })
    console.log('Unidad Funcional creada:', response.data)
    // Limpiar UF
    banderaSeleccion.value = false
    unsavedChanges.value = false
    limpiarUnidades()
    obtenerUnidadesFuncionales()
  } catch (error) {
    console.error('Error al crear la unidad funcional:', error)
    window.api.alert('Error al crear la unidad funcional:')
    showErrorDialog(error)
  }
}

const limpiarUnidades = () => {
  unidadSeleccionada.value = {
    idUf: '',
    idConsorcio,
    unidadFuncional: '',
    titulo: '',
    porcentajeUnidad: 0.0,
    porcentajeUnidadB: 0.0,
    porcentajeUnidadC: 0.0,
    porcentajeUnidadD: 0.0,
    porcentajeUnidadE: 0.0,
    apellidoPropietario: '',
    nombrePropietario: '',
    mailPropietario: '',
    telefonoPropietario: '',
    apellidoInquilino: '',
    nombreInquilino: '',
    mailInquilino: '',
    telefonoInquilino: ''
  }

  unidad.value = {
    idUf: '',
    idConsorcio,
    unidadFuncional: '',
    titulo: '',
    porcentajeUnidad: 0.0,
    porcentajeUnidadB: 0.0,
    porcentajeUnidadC: 0.0,
    porcentajeUnidadD: 0.0,
    porcentajeUnidadE: 0.0,
    apellidoPropietario: '',
    nombrePropietario: '',
    mailPropietario: '',
    telefonoPropietario: '',
    apellidoInquilino: '',
    nombreInquilino: '',
    mailInquilino: '',
    telefonoInquilino: ''
  }
}
// Estado para mostrar/ocultar el modal
const mostrarOpcionesTerminar = ref(false)
const seleccionarPeriodo = ref(false)
const periodoSeleccionado = ref('')
const periodoPrevio = ref('')
const expensa = ref({
  idConsorcio,
  periodo: '',
  porcentajeIntereses: 0,
  segundoVencimiento: 0
})

watch(periodoSeleccionado, (nuevoPeriodo) => {
  if (seleccionarPeriodo.value) {
    expensa.value.periodo = nuevoPeriodo

    mostrarPeriodoPrevio()
    estadoCuentaUfUpdatePeriodo.value.periodo = periodoPrevio.value

    console.log('PERIODO SELECCIONADO DESPUÉS DE restar mes')
    console.log(JSON.stringify(periodoSeleccionado.value))
    console.log(JSON.stringify(estadoCuentaUfUpdatePeriodo.value))
  }
})

// Abrir el modal
const abrirOpcionesTerminar = () => {
  if (porcentajeTotalUF.value !== 100) {
    window.api.alert('La suma de los porcentajes debe ser 100')
    console.log(porcentajeTotalUF.value)
    return
  }

  mostrarOpcionesTerminar.value = true
}

// Cerrar el modal
const cerrarOpcionesTerminar = () => {
  mostrarOpcionesTerminar.value = false
}

// Opciones al terminar
const editarEstadosCuenta = () => {
  cerrarOpcionesTerminar()
  window.api.alert('Redirigiendo a la edición manual de los estados de cuenta...')
  navigationGuardStore.allowNavigation()
  router.push({ name: 'edicionEstadoCuentaUf', params: { idConsorcio: idConsorcio } })
}

const cargarGastos = () => {
  cerrarOpcionesTerminar()
  seleccionarPeriodo.value = true
}

const crearPeriodo = async () => {
  console.log(JSON.stringify(expensa.value))
  try {
    const response = await axios.post('http://192.168.0.1:8080/api/expensas', expensa.value)
    seleccionarPeriodo.value = false
    window.api.alert('Redirigiendo para cargar gastos...')

    intermediaStore.loadIntermedias()
    navigationGuardStore.allowNavigation()
    actualizarPeriodoEstadoCuenta()
    router.push({ name: 'egreso' })
  } catch (error) {
    console.error('Error al crear la expensa:', error)
    window.api.alert('Error al crear la expensa.')
    showErrorDialog(error)
  }
}

const actualizarPeriodoEstadoCuenta = async () => {
  try {
    estadoCuentaUfUpdatePeriodo.value.unidadFuncionalList = unidadesOrdenadas.value

    console.log(JSON.stringify(estadoCuentaUfUpdatePeriodo.value))

    const response = await axios.put(
      'http://192.168.0.1:8080/api/estado_cuenta_uf/update_periodo',
      estadoCuentaUfUpdatePeriodo.value
    )

    console.log('Respuesta del servidor:', response.data)
    window.api.alert('Período actualizado con éxito!')
  } catch (error) {
    console.error('Error al modificar el periodo de los estados de cuenta', error)
    window.api.alert('Error al modificar el periodo de los estados de cuenta')
    showErrorDialog(error)
  }
}

const mostrarPeriodoPrevio = () => {
  if (periodoSeleccionado.value) {
    const [year, month] = periodoSeleccionado.value.split('-').map(Number)

    const fecha = new Date(year, month - 1)

    fecha.setMonth(fecha.getMonth() - 1)

    const periodoAnterior = fecha.toISOString().slice(0, 7)

    periodoPrevio.value = periodoAnterior
  }
}

// CICLO DE VIDA
onMounted(() => {
  console.log('Estoy en CREAR UF')
  obtenerUnidadesFuncionales()
  navigationGuardStore.blockNavigation()
})

onBeforeRouteLeave((to, from, next) => {
  if (porcentajeTotalUF.value === 100) {
    if (unsavedChanges.value) {
      const confirmLeave = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro que quieres salir?'
      )
      if (confirmLeave) {
        next() // Permitir la navegación
      } else {
        next(false) // Cancelar la navegación
      }
    } else {
      next() // Permitir la navegación sin restricciones
    }
  } else {
    window.api.alert(
      `El porcentaje total del consorcio debe ser 100%, actualmente es ${porcentajeTotalUF.value}`
    )

    next(false) // Permitir la navegación sin restricciones
  }
})
</script>

<style scoped>
h1,
h3 {
  font-weight: bold;
}
.container-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
}

.container {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.listado-unidades,
.formulario-crear {
  flex: 1;
  min-width: 300px;
  background: #f3d08e;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  height: 100%;
  padding: 15px;
  border: 1px solid black;
  overflow-y: auto;
}

.listado-unidades::-webkit-scrollbar {
  width: 8px;
  height: 0px;
}

.listado-unidades::-webkit-scrollbar-track {
  background: #f0f0f0; /* fondo del track del scroll */
  border-radius: 4px;
}

.listado-unidades::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron); /* color del scroll "thumb" */
  border-radius: 4px;
  border: 1px solid #573b27;
}

.listado-unidades::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e; /* color al pasar el mouse */
}

.formulario-crear label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario-crear input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.formulario-crear input:focus::placeholder {
  color: transparent;
}

form div {
  margin-bottom: 1px;
}

button {
  margin-top: 10px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
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
</style>
