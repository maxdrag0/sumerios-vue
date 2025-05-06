<template>
  <div class="container-view">
    <div class="container">
      <div class="container_listado_uf">
        <div class="boton-consorcio">
          <BotonConsorcio />
        </div>
        <p v-if="consorcioSeleccionado && buscandoUfs && unidades.length === 0">
          Buscando las ufs.
        </p>
        <p v-if="consorcioSeleccionado && !buscandoUfs && unidades.length === 0">
          No hay unidades funcionales para este consorcio.
        </p>
        <table v-else>
          <thead>
            <tr>
              <th>N° UF</th>
              <th>Propietario</th>
              <th>TÍtulo</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(unidad, index) in unidadesOrdenadas"
              :key="index"
              @click="selectUF(unidad)"
              :class="[
                'clickable-row',
                { 'selected-row': unidadSeleccionada.value?.idUf === unidad.idUf }
              ]"
            >
              <td>{{ unidad.unidadFuncional }}</td>
              <td>{{ unidad.apellidoPropietario }}</td>
              <td>{{ unidad.titulo }}</td>
              <td>{{ unidad.porcentajeUnidad }}</td>
            </tr>
          </tbody>
        </table>

        <button
          v-if="mostrarBoton()"
          type="submit"
          class="btn btn-alert"
          @click="agregarUF()"
          style="cursor: pointer"
        >
          +
        </button>
        <h3 v-if="consorcioSeleccionado && unidades.length !== 0">
          Porcentaje total = {{ porcentajeTotalUF }}
        </h3>
      </div>

      <div class="container_edicion">
        <div v-if="!banderaSeleccion" class="center-content">
          <img src="@renderer/assets/sumerios-min.png" alt="logo-sumerios" class="logo" />
        </div>

        <div v-else>
          <div v-if="banderaSeleccion && !agregarUf">
            <h1 style="font-weight: bold; font-size: x-large"></h1>
            <form @submit.prevent="updateUF">
              <div class="form-row">
                <div class="form-group">
                  <label for="numero">N° UF</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.unidadFuncional"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.unidadFuncional}`"
                    id="unidadFuncional"
                    class="form-control"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="titulo">Titulo</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.titulo"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.titulo}`"
                    id="titulo"
                    class="form-control"
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. A</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidad"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidad}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. B</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadB"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadB}`"
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
                  <label for="porcentajeUnidad">Porc. C</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadC"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadC}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. D</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadD"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadD}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. E</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadE"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadE}`"
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
                  <input
                    type="text"
                    v-model="unidadSeleccionada.nombrePropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.nombrePropietario}`"
                    id="nombrePropietario"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="apellidoPropietario">Apellido del Propietario</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.apellidoPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.apellidoPropietario}`"
                    id="apellidoPropietario"
                    class="form-control"
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="mailPropietario">Mail del Propietario</label>
                  <input
                    type="email"
                    v-model="unidadSeleccionada.mailPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.mailPropietario}`"
                    id="mailPropietario"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="telefonoPropietario">Telefono del Propietario</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.telefonoPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.telefonoPropietario}`"
                    id="telefonoPropietario"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Inquilino -->
              <div class="form-row">
                <div class="form-group">
                  <label for="nombreInquilino">Nombre del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.nombreInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.nombreInquilino}`"
                    id="nombreInquilino"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="apellidoInquilino">Apellido del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.apellidoInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.apellidoInquilino}`"
                    id="apellidoInquilino"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="mailInquilino">Mail del Inquilino</label>
                  <input
                    type="email"
                    v-model="unidadSeleccionada.mailInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.mailInquilino}`"
                    id="mailInquilino"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="telefonoInquilino">Telefono del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.telefonoInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.telefonoInquilino}`"
                    id="telefonoInquilino"
                    class="form-control"
                  />
                </div>
              </div>

              <button type="submit" class="btn btn-success">Guardar Cambios</button>
            </form>
            <button type="submit" class="btn btn-alert" @click="cancelarEdicion()">
              Cancelar Edicion
            </button>
            <button
              v-if="unidadSeleccionada.idUf !== null"
              type="submit"
              class="btn btn-alert"
              @click="deleteUF(unidadSeleccionada.idUf)"
            >
              Eliminar Unidad
            </button>
          </div>
          <div v-else-if="banderaSeleccion && agregarUF">
            <form @submit.prevent="crearUf()">
              <div class="form-row">
                <div class="form-group">
                  <label for="numero">N° UF</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.unidadFuncional"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.unidadFuncional}`"
                    id="unidadFuncional"
                    class="form-control"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="titulo">Titulo</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.titulo"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.titulo}`"
                    id="titulo"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. A</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidad"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidad}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. B</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadB"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadB}`"
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
                  <label for="porcentajeUnidad">Porc. C</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadC"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadC}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. D</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadD"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadD}`"
                    id="porcentajeUnidad"
                    class="form-control"
                    required
                    step="0.0001"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label for="porcentajeUnidad">Porc. E</label>
                  <input
                    type="number"
                    v-model="unidadSeleccionada.porcentajeUnidadE"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.porcentajeUnidadE}`"
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
                  <input
                    type="text"
                    v-model="unidadSeleccionada.nombrePropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.nombrePropietario}`"
                    id="nombrePropietario"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="apellidoPropietario">Apellido del Propietario</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.apellidoPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.apellidoPropietario}`"
                    id="apellidoPropietario"
                    class="form-control"
                    required
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="mailPropietario">Mail del Propietario</label>
                  <input
                    type="email"
                    v-model="unidadSeleccionada.mailPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.mailPropietario}`"
                    id="mailPropietario"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="telefonoPropietario">Telefono del Propietario</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.telefonoPropietario"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.telefonoPropietario}`"
                    id="telefonoPropietario"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Inquilino -->
              <div class="form-row">
                <div class="form-group">
                  <label for="nombreInquilino">Nombre del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.nombreInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.nombreInquilino}`"
                    id="nombreInquilino"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="apellidoInquilino">Apellido del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.apellidoInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.apellidoInquilino}`"
                    id="apellidoInquilino"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="mailInquilino">Mail del Inquilino</label>
                  <input
                    type="email"
                    v-model="unidadSeleccionada.mailInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.mailInquilino}`"
                    id="mailInquilino"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="telefonoInquilino">Telefono del Inquilino</label>
                  <input
                    type="text"
                    v-model="unidadSeleccionada.telefonoInquilino"
                    @input="onInputChange"
                    :placeholder="`${unidadSeleccionada.telefonoInquilino}`"
                    id="telefonoInquilino"
                    class="form-control"
                  />
                </div>
              </div>

              <button type="submit" class="btn btn-success">Crear Unidad Funcional</button>
              <button type="submit" class="btn btn-alert" @click="cancelarCreacion()">
                Cancelar Creacion
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//IMPORTS
import { API_CONSORCIOS, API_UF } from '@renderer/config/config'
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
import { showConfirmDialog, showErrorDialog } from '../utils/dialogs'
import { Decimal } from 'decimal.js'
import { useIntermediaStore } from '../stores/intermediaStore'

//VARIABLES Y CONSTANTES
// CONSTANTES DE NAVEGACION Y API
const adminStore = useAdminStore()
const router = useRouter()
const intermediaStore = useIntermediaStore()
// CONSTANTES DE CONSORCIOS Y CONSORCIO SELECCIONADO
const consorcioStore = useConsorcioStore()
// const consorcios = ref([])
const consorcioSeleccionado = computed(() => consorcioStore.selectedConsorcio)

// CONSTANTES DE CARGA DE UNIDADES FUNCIONALES
const buscandoUfs = ref(false)
const unidades = ref([])
const unidadesOrdenadas = computed(() => {
  return unidades.value.slice().sort((a, b) => a.unidadFuncional - b.unidadFuncional)
})

// CONSTANTES PARA MODIFICACION DE UNIDAD FUNCIONAL
const banderaSeleccion = ref(false)
const unsavedChanges = ref(false)
const unidadSeleccionada = ref({
  idConsorcio: unidades.value?.idConsorcio || 0
})
const agregarUf = ref(false)

// Constantes por porcentaje
const porcentajeTotalUF = ref(0)

//FUNCIONES

const obtenerUnidadesFuncionales = async () => {
  try {
    buscandoUfs.value = true

    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, consorcioStore.selectedConsorcio.idConsorcio)}`
    )
    unidades.value = Array.isArray(response.data) ? response.data : []
    calcularSumaUF()
    porcentajeTotalUF.value = calcularSumaUF()

    buscandoUfs.value = false
  } catch (error) {
    console.error('Error al obtener las unidades funcionales:', error)
    showErrorDialog(error)
    unidades.value = [] // Reinicializa en caso de error
  }
}

// Usar la función cuando el consorcio es seleccionado
watch(consorcioSeleccionado, (nuevoConsorcio) => {
  if (nuevoConsorcio && nuevoConsorcio.idConsorcio) {
    obtenerUnidadesFuncionales()
    banderaSeleccion.value = false
  }
})

// Seleccionar UF
const selectUF = (unidadFuncional) => {
  agregarUf.value = false
  unidadSeleccionada.value = {
    idUf: unidadFuncional.idUf || null,
    idConsorcio: consorcioSeleccionado.value.idConsorcio || 0,
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
}

const cancelarEdicion = () => {
  unidadSeleccionada.value = {
    idConsorcio: unidades.value?.idConsorcio || 0
  }
  banderaSeleccion.value = false
}

// Marcar cambios no guardados
const onInputChange = () => {
  unsavedChanges.value = true
}

// CALCULA EL TOTAL DEL PORCENTAJE
const calcularSumaUF = () => {
  try {
    if (unidades.value.length === 0) {
      return new Decimal(0)
    } else {
      let suma = new Decimal(0)

      unidades.value.forEach((uf) => {
        suma = suma.plus(new Decimal(uf.porcentajeUnidad))
      })

      return suma.toNumber() // Devuelve el resultado como un número
    }
  } catch (error) {
    console.error('Error al sumar el porcentaje:', error)
  }
}

// Función para redirigir a la vista de agregar más UF
const agregarUF = () => {
  agregarUf.value = true
  banderaSeleccion.value = true
  unidadSeleccionada.value = {
    idUf: null,
    idConsorcio: consorcioSeleccionado.value.idConsorcio,
    unidadFuncional: '',
    titulo: '',
    porcentajeUnidad: 0.0,
    porcentajeUnidadB: 0.0,
    porcentajeUnidadC: 0.0,
    porcentajeUnidadD: 0.0,
    porcentajeUnidadE: 0.0,
    // Datos del propietario
    apellidoPropietario: '',
    nombrePropietario: '',
    mailPropietario: '',
    telefonoPropietario: '',

    // Datos del inquilino (si aplica)
    apellidoInquilino: '',
    nombreInquilino: '',
    mailInquilino: '',
    telefonoInquilino: '',
    periodo: restarMes(intermediaStore.selectedIntermedia.periodo)
  }
}

const mostrarBoton = () => {
  return consorcioSeleccionado.value !== null
}
// Actualizar UF
const updateUF = async () => {
  try {
    const response = await axios.put(
      `${API_UF(adminStore.administracionData.idAdm, consorcioSeleccionado.value.idConsorcio)}/${unidadSeleccionada.value.idUf}`,
      unidadSeleccionada.value
    )
    window.api.alert(
      'Unidad Funcional ' +
        unidadSeleccionada.value.unidadFuncional +
        ' - ' +
        unidadSeleccionada.value.titulo +
        ' - ' +
        unidadSeleccionada.value.apellidoPropietario +
        ' actualizado con éxito.'
    )

    banderaSeleccion.value = false
    unsavedChanges.value = false
    obtenerUnidadesFuncionales()
  } catch (error) {
    console.error('Error actualizando la UF:', error)
    window.api.alert('Error actualizando la unidad funcional.')
    showErrorDialog(error)
  }
}

// Eliminar Unidad Funcional
const deleteUF = async (idUF) => {
  const confirmar = await window.api.confirm(
    `¿Estás seguro de que quieres eliminar la UF ${unidadSeleccionada.value.titulo}?`
  )

  if (confirmar) {
    try {
      const response = await axios.delete(
        `${API_UF(adminStore.administracionData.idAdm, consorcioSeleccionado.value.idConsorcio)}/${idUF}`
      )
      window.api.alert(
        'UF ' +
          unidadSeleccionada.value.unidadFuncional +
          ' - ' +
          unidadSeleccionada.value.titulo +
          ' del consorcio ' +
          consorcioSeleccionado.value.nombre +
          ' eliminada con éxito.'
      )

      banderaSeleccion.value = false
      unsavedChanges.value = false
      obtenerUnidadesFuncionales()
    } catch (error) {
      console.error('Error eliminando el Consorcio:', error)
      window.api.alert('Hubo un error al eliminar la Unidad Funcional.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada.')
  }
}

const crearUf = async () => {
  try {
    const response = await axios.post(
      `${API_UF(adminStore.administracionData.idAdm, consorcioSeleccionado.value.idConsorcio)}`,
      unidadSeleccionada.value
    )
    unidadSeleccionada.value = {
      idConsorcio: unidades.value?.idConsorcio || 0
    }
    obtenerUnidadesFuncionales()
    banderaSeleccion.value = false
    unsavedChanges.value = false
    agregarUF.value = false
  } catch (error) {
    console.error('Error al crear la unidad funcional:', error)
    window.api.alert('Error al crear la unidad funcional:.')
    showErrorDialog(error)
  }
}

function restarMes(fecha) {
  const fechaObj = new Date(fecha)
  fechaObj.setMonth(fechaObj.getMonth() - 1)
  const anio = fechaObj.getFullYear()
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0') // Añadimos un 0 al principio si el mes es menor a 10
  return `${anio}-${mes}`
}

// CANCELAR CREACION UF
const cancelarCreacion = () => {
  banderaSeleccion.value = false
  unsavedChanges.value = false
  obtenerUnidadesFuncionales()
  unidadSeleccionada.value = {
    idConsorcio: unidades.value?.idConsorcio || 0
  }
}

//CICLO DE VIDA
onMounted(() => {})

onUnmounted(() => {
  consorcioStore.setConsorcio(null)
})

onBeforeRouteLeave((to, from, next) => {
  const porcentaje = calcularSumaUF()

  if (consorcioSeleccionado.value === null) {
    next()
    return
  }

  if (porcentaje !== 100) {
    if (agregarUf.value) {
      next()
    } else {
      showConfirmDialog('El porcentaje no es 100%. ¿Estás seguro que quieres salir?').then(
        (confirmLeave) => {
          if (confirmLeave) {
            next()
          } else {
            next(false)
          }
        }
      )
    }
    return
  }

  if (unsavedChanges.value) {
    showConfirmDialog('Tienes cambios sin guardar. ¿Estás seguro que quieres salir?')
      .then((confirmLeave) => {
        if (confirmLeave) {
          next()
        } else {
          next(false)
        }
      })
      .catch((error) => {
        console.error('Error mostrando el diálogo de confirmación:', error)
        next(false)
      })
    return
  }

  next()
})
</script>

<style scoped>
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

.container_listado_uf {
  overflow-y: scroll;
}

.container_listado_uf::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.container_listado_uf::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.container_listado_uf::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron);
  border-radius: 4px;
  border: 1px solid #573b27;
}

.container_listado_uf::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e;
}

.boton-consorcio {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container_listado_uf,
.container_edicion {
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

/* Estilos del formulario similares al de "formulario-egreso" */
.container_edicion label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.container_edicion input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.container_edicion button,
textarea,
select {
  margin-bottom: 5px;
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

.container_edicion button {
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

.container_edicion button:hover {
  background-color: #885b21e0;
}

/* Tabla (si aplica) */
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

.selected-row {
  background-color: var(--sumerio-rojo-claro) !important; /* Mismo color que hover */
}

.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.logo {
  max-width: 100%;
  max-height: 100%;
}
</style>
