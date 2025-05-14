<template>
  <div class="container-view">
    <div class="pagos-container">
      <!-- Componente del botón para seleccionar consorcio, centrado arriba -->
      <div class="selector-consorcio">
        <BotonConsorcio />
      </div>

      <div class="contenido-pagos">
        <div class="unidades-funcionales">
          <div class="tabla-scroll">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>UF</th>
                  <th>Título</th>
                  <th>Prop.</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="uf in unidadesFuncionales"
                  :key="uf.idUf"
                  @click="selectUnidadFuncional(uf)"
                  :class="{ selected: selectedUnidadFuncional?.idUf === uf.idUf }"
                >
                  <td>{{ uf.unidadFuncional }}</td>
                  <td>{{ uf.titulo }}</td>
                  <td>{{ uf.apellidoPropietario }}</td>
                  <td>{{
                        uf.estadoCuentaUfDTO.segundoVencimientoActivo ?
                        currency(uf.estadoCuentaUfDTO.segundoVencimiento) :
                        currency(uf.estadoCuentaUfDTO.totalExpensa) }}</td>
                  <td>{{ totalPagoUfLista(uf.idUf) }}</td>
                  <td>{{ currency(uf.estadoCuentaUfDTO.saldoFinal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="selectedConsorcio">
            <h4 style="margin-top: 5px; margin-bottom: 5px; font-weight: bold">Total pago:</h4>
            <p>{{ totalPagoConsorcio }}</p>
          </div>
        </div>

        <!-- Formulario de pago, centrado -->

        <div class="formulario-pagos">
          <h4>Unidad seleccionada:</h4>
          <h5>
            {{
              selectedUnidadFuncional
                ? `UF ${selectedUnidadFuncional.unidadFuncional} - ${selectedUnidadFuncional.titulo}`
                : '\u00A0'
            }}
          </h5>

          <h4>Propietario:</h4>
          <h5>
            {{
              selectedUnidadFuncional
                ? `${selectedUnidadFuncional.apellidoPropietario}, ${selectedUnidadFuncional.nombrePropietario}`
                : '\u00A0'
            }}
          </h5>
          <h5 v-if="selectedConsorcio?.segundoVencimiento && selectedUnidadFuncional" style="font-weight: bold;">
            *Esta unidad funcional
            {{ selectedUnidadFuncional?.estadoCuentaUfDTO.segundoVencimientoActivo ? 'tiene' : 'NO tiene' }}
            el segundo vencimiento activo*
          </h5>

          <form @submit.prevent="mostrarModal">
            <div>
              <label>Fecha:</label>
              <input
                type="date"
                v-model="pago.fecha"
                required
                :disabled="!selectedUnidadFuncional"
              />
            </div>
            <div>
              <label>Pago:</label>
              <input
                type="number"
                v-model="pago.valor"
                required
                min="0"
                step="0.01"
                :disabled="!selectedUnidadFuncional"
              />
            </div>
            <div>
              <label>Forma de Pago:</label>
              <select v-model="pago.formaPago" required :disabled="!selectedUnidadFuncional">
                <option value="EFECTIVO">Efectivo</option>
                <option value="BANCO">Banco</option>
              </select>
            </div>
            <div>
              <label>Descripción:</label>
              <textarea v-model="pago.descripcion" :disabled="!selectedUnidadFuncional"></textarea>
            </div>
            <button type="submit" class="btn btn-success" :disabled="!selectedUnidadFuncional">
              Registrar
            </button>
          </form>

          <!-- Modal -->
          <div v-if="mostrarModalConfirmacion" class="modal-overlay">
            <div class="modal">
              <h2>Seleccione una acción</h2>
              <div>
                <label> Imprimir Recibo </label>
                <input
                  type="radio"
                  id="imprimir"
                  value="imprimir"
                  v-model="accionSeleccionada"
                  @change="cambiarAccion('imprimir')"
                />
                <label> Enviar Mail </label>
                <input
                  type="radio"
                  id="enviar"
                  value="enviar"
                  v-model="accionSeleccionada"
                  @change="cambiarAccion('enviar')"
                />
              </div>

              <!-- Selección de Mails -->
              <div v-if="pagoRequest.enviarMail">
                <label for="mails">Seleccione un mail o agregue uno:</label>
                <select v-model="mailSeleccionado">
                  <option disabled value="">Selecciona un mail</option>
                  <option :value="selectedUnidadFuncional.mailPropietario">
                    {{ selectedUnidadFuncional.mailPropietario }}
                  </option>
                  <option :value="selectedUnidadFuncional.mailInquilino">
                    {{ selectedUnidadFuncional.mailInquilino }}
                  </option>
                </select>
                <input type="email" v-model="mailPersonalizado" placeholder="Ingresar otro mail" />
                <button type="button" @click="agregarMail">Agregar Mail</button>

                <div>
                  <h5>Mails seleccionados:</h5>
                  <ul>
                    <li v-for="(mail, index) in pagoRequest.mails" :key="index">
                      {{ mail }}
                      <button @click="eliminarMail(index)" class="boton-x">✕</button>
                    </li>
                  </ul>
                </div>
              </div>
              <button @click="confirmarAccion">Terminar</button>
              <button @click="cerrarModal">Cancelar</button>
            </div>
          </div>
        </div>

        <div v-if="mostrarAdvertenciaMail" class="mensaje-procesando">
          <div><h4>Enviando mail, aguarde un momento.</h4></div>
          <div class="spinner"></div>
        </div>
        <div v-else-if="mostrarAdvertenciaImpresion" class="mensaje-procesando">
          <div><h4>Imprimiendo, aguarde un momento.</h4></div>
          <div class="spinner"></div>
        </div>
        <div v-else-if="mostrarAdv" class="mensaje-procesando">
          <div>
            <h4>Registrando pago.</h4>
          </div>
          <div class="spinner"></div>
        </div>
        <!-- Tabla de pagos de la unidad funcional, con scroll si es necesario -->

        <div class="tabla-pagos">
          <div class="tabla-scroll">
            <h4 style="font-weight: bold; padding-bottom: 5px">PAGOS REALIZADOS</h4>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pago in pagosUf" :key="pago.id">
                  <td>{{ pago.fecha }}</td>
                  <td>{{ currency(pago.valor) }}</td>
                  <td>{{ pago.descripcion }}</td>
                </tr>
              </tbody>
            </table>
            <button
              style="margin-top: 5px"
              @click="limpiarPagos()"
              :disabled="!selectedUnidadFuncional"
            >
              Limpiar pagos
            </button>
          </div>
        </div>
      </div>
      <div v-if="selectedUnidadFuncional?.estadoCuentaUfDTO" class="estado-cuenta">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>DEUDA</th>
              <th>INTERES</th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
              <th>G.P.</th>
              <th>Total</th>
              <th v-if="selectedConsorcio?.segundoVencimiento">2° VTO</th>
              <th>Total pago</th>
              <th>Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.deuda) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.intereses) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalA) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalB) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalC) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalD) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalE) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.gastoParticular) }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.totalExpensa) }}</td>
              <td v-if="selectedConsorcio?.segundoVencimiento">
                {{
                  selectedUnidadFuncional.estadoCuentaUfDTO.segundoVencimiento !== 0 &&
                  selectedUnidadFuncional.estadoCuentaUfDTO.segundoVencimiento !== null
                    ? currency(selectedUnidadFuncional.estadoCuentaUfDTO.segundoVencimiento)
                    : currency(0)
                }}
              </td>
              <td>{{ totalPagoUf }}</td>
              <td>{{ currency(selectedUnidadFuncional.estadoCuentaUfDTO.saldoFinal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted, onMounted } from 'vue'
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
import { useConsorcioStore } from '@renderer/stores/consorcioStore.js'
import axios from 'axios'
import { API_UF } from '@renderer/config/config'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { showConfirmDialog, showErrorDialog } from '../utils/dialogs'

const adminStore = useAdminStore()
const consorcioStore = useConsorcioStore()
const intermediaStore = useIntermediaStore()

const selectedConsorcio = computed(() => consorcioStore.selectedConsorcio)
const unidadesFuncionales = ref([])
const selectedUnidadFuncional = ref(null)
const estadoCuentaConsorcio = ref(null)
const pagos = ref([])
const pagosUf = ref([])
const totalPagoConsorcio = ref('')
const totalPagoUf = ref('')
const mostrarAdvertenciaMail = ref(false)
const mostrarAdvertenciaImpresion = ref(false)
const mostrarAdv = ref(false)

const pagoRequest = ref({
  imprimir: false,
  enviarMail: false,
  mails: [],
  pago: {
    idUf: null,
    idConsorcio: null,
    fecha: '',
    valor: 0,
    formaPago: '',
    descripcion: '',
    idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
    periodo: intermediaStore.selectedIntermedia?.periodo
  }
})

const pago = ref({
  idUf: null,
  idConsorcio: null,
  fecha: '',
  valor: 0,
  formaPago: '',
  descripcion: '',
  idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
  periodo: intermediaStore.selectedIntermedia?.periodo
})

const mostrarModalConfirmacion = ref(false)
const accionSeleccionada = ref('')
const mailSeleccionado = ref('')
const mailPersonalizado = ref('')

function mostrarModal() {
  mostrarModalConfirmacion.value = true
}

function cerrarModal() {
  mostrarModalConfirmacion.value = false
  accionSeleccionada.value = null
}

function cambiarAccion(accion) {
  pagoRequest.value.imprimir = accion === 'imprimir'
  pagoRequest.value.enviarMail = accion === 'enviar'
}

function agregarMail() {
  if (mailSeleccionado.value) {
    pagoRequest.value.mails.push(mailSeleccionado.value)
    mailSeleccionado.value = ''
  }
  if (mailPersonalizado.value) {
    pagoRequest.value.mails.push(mailPersonalizado.value)
    mailPersonalizado.value = ''
  }
}

function eliminarMail(index) {
  pagoRequest.value.mails.splice(index, 1)
}

function confirmarAccion() {
  crearPago()
  cerrarModal()
}

// Observar cambios en el consorcio seleccionado
watch(selectedConsorcio, async (newConsorcio) => {
  totalPagoConsorcio.value = currency(0)
  if (newConsorcio) {
    try {
      await Promise.all([
        cargarUnidadesFuncionales(),
        cargarEstadoCuentaConsorcio(),
        cargarPagosConsorcio()
      ])
      selectedUnidadFuncional.value = null
      pagosUf.value = null
      console.log(JSON.stringify(selectUnidadFuncional.value))
    } catch (error) {
      console.error('Error al cargar las unidades funcionales:', error)
    }
  }
})

// Observar cambios eleccion de impresion o envio mail
watch(accionSeleccionada, (nuevaAccion) => {
  pagoRequest.value.imprimir = nuevaAccion === 'imprimir'
  pagoRequest.value.enviarMail = nuevaAccion === 'enviarMail'
})

// seleccionar unidad funcional
const selectUnidadFuncional = async (unidadFuncional) => {
  if (selectedConsorcio.value.segundoVencimiento) {
    const today = new Date()
    const dia = String(today.getDate()).padStart(2, '0')
    const mes = String(today.getMonth() + 1).padStart(2, '0')
    if (!unidadFuncional.estadoCuentaUfDTO.segundoVencimientoActivo && dia > 10) {
      const activate = await showConfirmDialog(
        `La fecha actual es ${dia}/${mes} y la unidad funcional NO tiene activado el segundo vencimiento.\n\nTotal actual: ${currency(unidadFuncional.estadoCuentaUfDTO.totalExpensa)}\nSegundo Vencimiento: ${currency(unidadFuncional.estadoCuentaUfDTO.segundoVencimiento)}\n\nDesea activarlo?`
      )

      if (activate) {
        try {
          await axios.post(
            `http://192.168.0.1:8080/api/estado_cuenta_uf/imputarSegundoVencimiento/${unidadFuncional.estadoCuentaUfDTO.idEstadoCuentaUf}`
          )
          window.api.alert("Segundo vencimiento activado.")

          await Promise.all([
            actualizarUnidadFuncional(unidadFuncional.idUf),
            cargarUnidadesFuncionales(),
            cargarEstadoCuentaConsorcio(),
            cargarPagosUf(unidadFuncional.idUf)
          ])
        } catch (error) {
          console.error('Error al activar segundo vencimiento:', error)
          showErrorDialog(error)
        }
      }

    } else {
      window.api.alert("La unidad funcional ya tiene el segundo vencimiento activo.")
    }
  }

  // Esta parte siempre se ejecuta
  selectedUnidadFuncional.value = unidadFuncional
  pago.value.idUf = unidadFuncional.idUf
  pago.value.idConsorcio = selectedConsorcio.value.idConsorcio
  pago.value.idExpensa = intermediaStore.selectedIntermedia?.idExpensa
  pago.value.periodo = intermediaStore.selectedIntermedia?.periodo

  cargarPagosUf(unidadFuncional.idUf)
}


// cargar su estado de cuenta
const cargarEstadoCuentaConsorcio = async () => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/estado_cuenta_consorcio/consorcio/${consorcioStore.selectedConsorcio.idConsorcio}`
    )
    estadoCuentaConsorcio.value = response.data
  } catch (error) {
    console.error('Error al cargar estado de cuenta del consorcio:', error)
    showErrorDialog(error)
  }
}

// CARGAR PAGOS CONSORCIO
const cargarPagosConsorcio = async () => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/pagoUF/consorcio/${consorcioStore.selectedConsorcio.idConsorcio}`
    )
    if (Array.isArray(response.data)) {
      pagos.value = response.data
      totalPagoConsorcio.value = sumarPagos(pagos.value)
    }
  } catch (error) {
    console.error('Error al cargar los pagos del consorcio:', error)
    showErrorDialog(error)
  }
}

// cargar sus pagos
const cargarPagosUf = (idUf) => {
  pagosUf.value = pagos.value.filter((p) => p.idUf === idUf)
  totalPagoUf.value = sumarPagos(pagosUf.value)
}

// PAGOS UFS POR FILA
const totalPagoUfLista = (idUf) => {
  if (!Array.isArray(pagos.value)) return '$0,00'

  const total = pagos.value
    .filter((p) => p.idUf === idUf)
    .reduce((sum, pago) => sum + pago.valor, 0)

  return total.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS'
  })
}

const sumarPagos = (pagosUf) => {
  let total = 0
  for (const pago of pagosUf) {
    total += pago.valor
  }
  return total.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS'
  })
}

// Función para registrar el pago
const crearPago = async () => {

  try {
    if (pagoRequest.value.imprimir) {
      mostrarAdvertenciaImpresion.value = true
    } else if (pagoRequest.value.enviarMail) {
      mostrarAdvertenciaMail.value = true
    } else {
      mostrarAdv.value = true
    }

    pagoRequest.value.pago = pago.value

    await axios.post('http://192.168.0.1:8080/api/pagoUF', pagoRequest.value)
    window.api.alert('Pago realizado con éxito!')

    await Promise.all([
      actualizarUnidadFuncional(selectedUnidadFuncional.value.idUf),
      cargarUnidadesFuncionales(),
      cargarEstadoCuentaConsorcio(),
      cargarPagosUf(selectedUnidadFuncional.value.idUf)
    ])

    limpiarPagoRequest()
    limpiarAdv()

    pago.value = {
      idUf: selectedUnidadFuncional.value.idUf,
      idConsorcio: selectedConsorcio.value.idConsorcio,
      fecha: '',
      valor: 0,
      formaPago: '',
      descripcion: '',
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
      periodo: intermediaStore.selectedIntermedia?.periodo
    }
  } catch (error) {
    console.error('Error al registrar el pago:', error)
    window.api.alert('Error al registrar el pago.')
    showErrorDialog(error)
  }
}

// borrar pagos
const limpiarPagos = async () => {
  try {
    const confirmLeave = await window.api.confirm(
      '¿Estás seguro que quieres eliminar los pagos? Se eliminaran todos los pagos de la unidad este período.'
    )
    if (confirmLeave) {
      for (const pago of pagosUf.value) {
        try {
          await axios.delete(`http://192.168.0.1:8080/api/pagoUF/${pago.idPagoUF}`)
        } catch (error) {
          console.error(`Error al eliminar el pago ${pago.idPagoUF}:`, error)
          showErrorDialog(error)
        }
      }
      await Promise.all([
        actualizarUnidadFuncional(selectedUnidadFuncional.value.idUf),
        cargarUnidadesFuncionales(),
        cargarEstadoCuentaConsorcio(),
        cargarPagosUf(selectedUnidadFuncional.value.idUf)
      ])
    } else {
      await window.api.alert('La eliminacion se a ha cancelado.')
    }
  } catch (error) {
    console.error('Error al eliminar pagos:', error)
    window.api.alert('Error al eliminar pagos.')
    showErrorDialog(error)
  }
}

// Actualizar la unidad funcional con los nuevos datos
const cargarUnidadesFuncionales = async () => {
  try {
    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, consorcioStore.selectedConsorcio.idConsorcio)}`
    )

    if (Array.isArray(response.data)) {
      unidadesFuncionales.value = response.data.sort(
        (a, b) => a.unidadFuncional - b.unidadFuncional
      )
    } else {
      console.error('No hay unidades cargadas:', response.data)
      unidadesFuncionales.value = []
    }
  } catch (error) {
    console.error('Error al cargar las unidades funcionales:', error)
    showErrorDialog(error)
    unidadesFuncionales.value = []
  }
}

const actualizarUnidadFuncional = async (idUf) => {
  try {
    const response = await axios.get(
      `${API_UF(adminStore.administracionData.idAdm, consorcioStore.selectedConsorcio.idConsorcio)}`
    )
    const unidadFuncionalActualizada = response.data.find((uf) => uf.idUf === idUf)
    selectedUnidadFuncional.value = unidadFuncionalActualizada
  } catch (error) {
    console.error('Error al actualizar la unidad funcional:', error)
    showErrorDialog(error)
  }
}

// Filtro para formatear como moneda
const currency = (value) => {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value)
}

const limpiarPagoRequest = () => {
  pagoRequest.value = {
    imprimir: false,
    enviarMail: false,
    mails: [],
    pago: {
      idUf: null,
      idConsorcio: null,
      fecha: '',
      valor: 0,
      formaPago: '',
      descripcion: '',
      idExpensa: intermediaStore.selectedIntermedia?.idExpensa,
      periodo: intermediaStore.selectedIntermedia?.periodo
    }
  }
}

const limpiarAdv = () => {
  mostrarAdvertenciaImpresion.value = false
  mostrarAdvertenciaMail.value = false
  mostrarAdv.value = false
}

onMounted(() => {
  mostrarAdvertenciaImpresion.value = false
  mostrarAdvertenciaMail.value = false
})

// Desmontar la vista y reiniciar el consorcio seleccionado
onUnmounted(() => {
  consorcioStore.setConsorcio(null)
  limpiarPagoRequest()
  limpiarAdv()
})
</script>

<style scoped>
/* === CONTENEDOR GENERAL === */
.pagos-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* === SELECTOR DE CONSORCIO === */
.selector-consorcio {
  text-align: center;
  margin-top: 5px;
}

/* === CONTENIDO PRINCIPAL (3 columnas) === */
.contenido-pagos {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 60vh;
  justify-content: space-between;
  align-items: stretch;
  padding: 10px;
  box-sizing: border-box;
  margin: 0 auto;
}

/* === COLUMNAS === */
.unidades-funcionales,
.formulario-pagos,
.tabla-pagos {
  width: 40%;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  height: 100%;
}

/* Bordes laterales para visual separation */
.unidades-funcionales {
  border-right: 1px solid black;
}

.tabla-pagos {
  border-left: 1px solid black;
  overflow-y: auto;
}

/* === FORMULARIO === */
.formulario-pagos {
  align-items: center;
  font-size: 15px;
}

.formulario-pagos h4 {
  font-weight: bold;
}

.formulario-pagos h5 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.formulario-pagos form {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
}

.formulario-pagos label {
  font-weight: bold;
  margin-bottom: 5px;
}

.formulario-pagos input,
.formulario-pagos select,
.formulario-pagos textarea {
  padding: 4px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid black;
  border-radius: 4px;
  text-align: center;
}

.formulario-pagos button {
  font-weight: bold;
  margin-top: 10px;
  padding: 10px 15px;
  background-color: var(--sumerio-marron);
  color: black;
  border: 1px solid black;
  border-radius: 4px;
  cursor: pointer;
}

.formulario-pagos button:hover {
  background-color: #885b21e0;
}

.formulario-pagos input:disabled,
.formulario-pagos select:disabled,
.formulario-pagos textarea:disabled,
.formulario-pagos button:disabled {
  color: #666; /* texto más tenue */
  cursor: not-allowed; /* icono de "prohibido" al pasar el mouse */
  opacity: 0.6; /* más opaco */
  border: 1px solid #999; /* borde más tenue */
}

/* === TABLAS === */
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffffe0;
}

.table th,
.table td {
  border: 1px solid black;
  padding: 8px;
  text-align: left;
}

.table th {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  text-align: center;
}

.table tr:hover {
  background-color: #f1f1f1;
}

.table tr.selected {
  background-color: var(--sumerio-crema);
  border: 2px solid var(--sumerio-rojo-claro);
  font-weight: bold;
}

/* === TABLA SCROLL === */
.tabla-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tabla-scroll::-webkit-scrollbar-track {
  background: #f0f0f0; /* fondo del track del scroll */
  border-radius: 4px;
}

.tabla-scroll::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron); /* color del scroll "thumb" */
  border-radius: 4px;
  border: 1px solid #573b27; /* borde opcional */
}

.tabla-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e; /* color al pasar el mouse */
}

/* === TABLA SCROLL - UNIDADES-FUNCIONALES === */
.unidades-funcionales .tabla-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.unidades-funcionales .tabla-scroll .table {
  flex: 1;
  width: 100%;
  height: 100%;
  border-collapse: collapse;
}

.unidades-funcionales table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.unidades-funcionales thead th {
  position: sticky;
  top: 0;
  z-index: 2; /* asegura que quede por encima */
  border-bottom: 2px solid #ccc;
}

.unidades-funcionales th,
.unidades-funcionales td {
  overflow: hidden;
  border: 1px solid black;
  margin: 0;
  padding: 8px;
  max-width: 70px;
  font-size: clamp(10px, 1.5vw, 12px);
}

.tabla-pagos .table tr,
.unidades-funcionales .table tr {
  height: 40px;
  max-height: 40px;
}

/* === ESTADO DE CUENTA === */
.estado-cuenta {
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.estado-cuenta table {
  width: 100%;
  table-layout: fixed;
  margin: 0 auto;
}

.estado-cuenta th,
.estado-cuenta td {
  width: 9.09%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 20px;
}

/* === MODAL === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px #000000;
  width: 300px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal h5,
label,
input,
select,
textarea {
  margin-top: 5px;
  margin-bottom: 10px;
}

.modal button:not(:first-of-type) {
  margin-top: 0px;
}

.boton-x {
  margin-left: 10px;
  background-color: transparent;
  border: none;
  color: black;
  font-weight: bold;
  cursor: pointer;
}

/* === RESPONSIVE === */
@media screen and (max-width: 768px) {
  .contenido-pagos {
    flex-direction: column;
    height: auto;
  }

  .unidades-funcionales,
  .formulario-pagos,
  .tabla-pagos {
    width: 100%;
    border: none;
  }

  .tabla-pagos {
    border-top: 1px solid black;
  }

  .unidades-funcionales {
    border-bottom: 1px solid black;
  }
}

.mensaje-procesando {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--sumerio-rojo-claro); /* Fondo semitransparente */
  color: black; /* Texto blanco */
  padding: 20px;
  border-radius: 8px;
  font-weight: bold;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: auto;
  text-align: center;
  border: 1px solid black;
  min-width: 250px; /* antes tenías 200px */
  min-height: 120px; /* nuevo: para que tenga más altura mínima */
  padding: 30px; /* más espacio interno */
}

.mensaje-procesando h4 {
  font-weight: bold;
  font-size: 1.2rem; /* o probá con 1.5rem si lo querés más grande */
  margin: 0;
}

.spinner {
  margin-top: 10px;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.2); /* Borde gris claro */
  border-top: 4px solid black; /* Borde superior oscuro para la animación */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* Animación de giro */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.unidades-funcionales th:nth-child(1),
.unidades-funcionales td:nth-child(1) {
  width: 8%;
  max-width: 60px;
}

.unidades-funcionales th:nth-child(2) {
  width: 12%;
  max-width: 60px;
}

.unidades-funcionales th:nth-child(3) {
  width: 20%;
}

.unidades-funcionales th:nth-child(4),
.unidades-funcionales th:nth-child(5),
.unidades-funcionales th:nth-child(6) {
  width: 20%;
}
</style>
