<template>
  <div class="container-view">
    <div v-if="!estadoCuentaConsorcio" class="container">
      <form @submit.prevent="crearConsorcio" class="formulario">
        <!-- Campos para el consorcio -->
        <h3>DATOS DEL CONSORCIO</h3>

        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" v-model="consorcio.nombre" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="direccion">Dirección:</label>
          <input type="text" v-model="consorcio.direccion" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="ciudad">Ciudad:</label>
          <input type="text" v-model="consorcio.ciudad" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="cuit">CUIT:</label>
          <input type="text" v-model="consorcio.cuit" class="form-control" />
        </div>

        <h3 style="padding-top: 10px">DATOS BANCARIOS DEL CONSORCIO</h3>

        <div class="form-group">
          <label for="titulo">Título de cuenta:</label>
          <input type="text" v-model="consorcio.titulo" class="form-control" />
        </div>

        <div class="form-group">
          <label for="banco">Banco:</label>
          <input type="text" v-model="consorcio.banco" class="form-control" />
        </div>

        <div class="form-group">
          <label for="numCuenta">Número de cuenta:</label>
          <input type="text" v-model="consorcio.numCuenta" class="form-control" />
        </div>

        <div class="form-group">
          <label for="cbu">CBU:</label>
          <input type="text" v-model="consorcio.cbu" class="form-control" />
        </div>

        <div class="form-group">
          <label for="alias">Alias:</label>
          <input type="text" v-model="consorcio.alias" class="form-control" />
        </div>

        <div class="form-group botones">
          <button type="submit" class="btn btn-primary">GUARDAR</button>
          <button type="button" class="btn btn-secondary" @click="cancelarCreacion">
            CANCELAR
          </button>
        </div>
      </form>
    </div>

    <div v-if="estadoCuentaConsorcio" class="estado-cuenta">
      <h2 style="font-weight: bold; margin-bottom: 10px">ESTADO DE CUENTA DEL CONSORCIO</h2>
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
            <td
              contenteditable="true"
              @input="actualizarEstado('total', $event)"
              class="editable-cell"
            >
              {{ estadoCuentaConsorcio.total }}
            </td>
            <td
              contenteditable="true"
              @input="actualizarEstado('efectivo', $event)"
              class="editable-cell"
            >
              {{ estadoCuentaConsorcio.efectivo }}
            </td>
            <td
              contenteditable="true"
              @input="actualizarEstado('banco', $event)"
              class="editable-cell"
            >
              {{ estadoCuentaConsorcio.banco }}
            </td>
            <td
              contenteditable="true"
              @input="actualizarEstado('fondoAdm', $event)"
              class="editable-cell"
            >
              {{ estadoCuentaConsorcio.fondoAdm }}
            </td>
          </tr>
        </tbody>
      </table>
      <button class="button" @click="guardarEstadoCuenta">GUARDAR</button>
    </div>
  </div>
</template>

<script setup>
import { API_CONSORCIOS } from '@renderer/config/config'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAdminStore } from '@renderer/stores/adminStore'
import { useIntermediaStore } from '@renderer/stores/intermediaStore'
import { useNavigationGuardStore } from '@renderer/stores/navigationGuardStore'
import { showErrorDialog } from '../utils/dialogs'

const adminStore = useAdminStore()
const navigationGuardStore = useNavigationGuardStore()
const idAdm = adminStore.administracionData.idAdm
const intermediaStore = useIntermediaStore()

const consorcio = ref({
  nombre: '',
  direccion: '',
  ciudad: '',
  idAdm,
  cuit: '',
  titulo: '',
  banco: '',
  numCuenta: '',
  cbu: '',
  alias: ''
})
const idConsorcioCreado = ref(null)
const estadoCuentaConsorcio = ref(null)

const router = useRouter()
const apiConsorcios = API_CONSORCIOS(adminStore.administracionData.idAdm)

const crearConsorcio = async () => {
  try {
    const response = await axios.post(apiConsorcios, consorcio.value)
    const { id } = response.data

    console.log('ID del consorcio creado:', id) // Verifica el ID recibido

    idConsorcioCreado.value = id // Asigna directamente
    await cargarEstadoCuentaConsorcio(id) // Asegúrate de esperar esta función
  } catch (error) {
    console.error('Error al crear consorcio:', error.response ? error.response.data : error.message)
    showErrorDialog(error)
  }
}

const cargarEstadoCuentaConsorcio = async (idConsorcio) => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/estado_cuenta_consorcio/consorcio/${idConsorcio}`
    )
    estadoCuentaConsorcio.value = response.data // Asigna datos correctamente
    console.log('Estado de cuenta cargado:', JSON.stringify(estadoCuentaConsorcio.value))
  } catch (error) {
    console.error('Error al obtener el estado de cuenta:', error)
    showErrorDialog(error)
  }
}

const actualizarEstado = (campo, event) => {
  estadoCuentaConsorcio.value[campo] = event.target.textContent.trim()
  console.log(`Actualizado ${campo}:`, estadoCuentaConsorcio.value[campo])
}

const guardarEstadoCuenta = async () => {
  console.log('Estado de cuenta a enviar:', JSON.stringify(estadoCuentaConsorcio.value))
  estadoCuentaConsorcio.value.totalAlCierre = estadoCuentaConsorcio.value.total
  console.log('Estado de cuenta a enviar:', JSON.stringify(estadoCuentaConsorcio.value))

  try {
    await axios.put(
      `http://192.168.0.1:8080/api/estado_cuenta_consorcio/${estadoCuentaConsorcio.value.idEstadoCuentaConsorcio}`,
      estadoCuentaConsorcio.value
    )
    window.api.alert('Estado de cuenta actualizado con éxito')
    intermediaStore.loadIntermedias()
    navigationGuardStore.allowNavigation()
    router.push({ name: 'CrearUF', params: { idConsorcioCreado: idConsorcioCreado.value } })
  } catch (error) {
    console.error('Error al editar el estado de cuenta:', error)
    showErrorDialog(error)
  }
}

const cancelarCreacion = async () => {
  const confirmar = await window.api.confirm(
    'Está seguro que quiere cancelar la creación del consorcio?'
  )
  if (confirmar) {
    window.api.alert('Creación cancelada')
    navigationGuardStore.allowNavigation()
    router.push({ name: 'consorcios' })
  }
}
onMounted(() => {
  navigationGuardStore.blockNavigation()
  console.log(JSON.stringify(navigationGuardStore.navigationBlocked))
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

h2 {
  text-align: center;
}

h3 {
  text-align: center;
  font-weight: bold;
  color: black;
  margin-bottom: 10px;
}

.formulario {
  flex: 1;
  min-width: 300px;
  background: #f3d08e;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  padding: 20px;
  width: 100%;
  text-align: center;
  justify-content: center;
}

.formulario label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 30%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: center;
}

.formulario .btn {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  display: inline-block;
  margin-top: 10px;
  padding: 10px;
  border: none;
  color: black;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  text-align: center;
}

.formulario .btn:hover {
  background-color: #885b21e0;
}

.formulario .btn:nth-child(2):hover {
  background-color: red;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  margin-top: 20px;
}

.estado-cuenta {
  padding: 20px;
  background: #f3d08e;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 100%;
  height: 100%;
  align-content: center;
}

.table {
  background-color: #f5f5f5;
  width: 80%;
  margin: 0 auto;
  font-size: 18px;
}

.table-lg td,
.table-lg th {
  padding: 15px;
}

.table th,
.table td {
  width: 25%; /* Distribuye el ancho equitativamente entre las 5 columnas */
  text-align: center; /* Centra el contenido */
  white-space: nowrap;
  vertical-align: middle;
  font-weight: bold;
}

.editable-cell {
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  background-color: #f5f5f5;
  border: 2px solid #ddd;
}

.editable-cell:hover {
  background-color: #e9ecef;
}

.btn-lg {
  padding: 12px 30px;
  font-size: 16px;
}

.table-responsive {
  overflow-x: auto;
}

.botones {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-direction: row; /* Asegura que estén en fila */
  align-items: center; /* Alinea los botones verticalmente */
}
</style>
