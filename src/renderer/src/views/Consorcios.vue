<template>
  <div class="container-view">
    <div class="container">
      <div class="container-consorcios">
        <div v-if="loading"></div>

        <div v-else>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Direccion</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(consorcio, index) in consorcios"
                :key="index"
                @click="selectConsorcio(consorcio)"
                class="clickable-row"
              >
                <td>{{ consorcio.nombre }}</td>
                <td>{{ consorcio.direccion }}</td>
              </tr>
            </tbody>
          </table>

          <router-link to="/crear-consorcio">
            <button class="btn btn-primary" style="cursor: pointer">+</button>
          </router-link>
        </div>
      </div>

      <div class="container-datos-consorcios">
        <div v-if="!banderaSeleccion" class="center-content">
          <img src="@renderer/assets/sumerios-min.png" alt="logo-sumerios" class="logo" />
        </div>

        <div v-else>
          <form @submit.prevent="updateConsorcio">
            <label for="nombre">Nombre</label>
            <input
              v-model="consorcioSeleccionado.nombre"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.nombre}`"
              id="nombre"
              class="form-control"
              required
            />

            <label for="direccion">Direccion</label>
            <input
              v-model="consorcioSeleccionado.direccion"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.direccion}`"
              id="direccion"
              class="form-control"
              required
            />

            <label for="ciudad">Ciudad</label>
            <input
              v-model="consorcioSeleccionado.ciudad"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.ciudad}`"
              id="ciudad"
              class="form-control"
              required
            />

            <label for="cuit">Cuit</label>
            <input
              v-model="consorcioSeleccionado.cuit"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.cuit}`"
              id="cuit"
              class="form-control"
            />
            <label for="titulo">Titulo de Cuenta</label>
            <input
              v-model="consorcioSeleccionado.titulo"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.titulo}`"
              id="titulo"
              class="form-control"
            />

            <label for="banco">Banco</label>
            <input
              v-model="consorcioSeleccionado.banco"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.banco}`"
              id="banco"
              class="form-control"
            />
            <label for="numCuenta">N° de Cuenta</label>
            <input
              v-model="consorcioSeleccionado.numCuenta"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.numCuenta}`"
              id="numCuenta"
              class="form-control"
            />

            <label for="cbu">CBU</label>
            <input
              v-model="consorcioSeleccionado.cbu"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.cbu}`"
              id="cbu"
              class="form-control"
            />
            <label for="alias">Alias</label>
            <input
              v-model="consorcioSeleccionado.alias"
              @input="onInputChange"
              :placeholder="`${consorcioSeleccionado.alias}`"
              id="alias"
              class="form-control"
            />

            <div class="form-row">
              <div class="form-group">
                <label for="porcentajeIntereses">% Intereses</label>
                <input
                  id="porcentajeIntereses"
                  type="number"
                  @input="onInputChange"
                  :placeholder="`${consorcioSeleccionado.porcentajeIntereses}`"
                  v-model="consorcioSeleccionado.porcentajeIntereses"
                  required
                  step="0.01"
                  min="0"
                  style="text-align: center;"
                />
              </div>

              <div class="form-group">
                <label for="formaPago">Segundo Vencimiento</label>
                <input
                  id="formaPago"
                  type="checkbox"
                  @input="onInputChange"
                  :placeholder="`${consorcioSeleccionado.segundoVencimiento}`"
                  v-model="consorcioSeleccionado.segundoVencimiento"
                />
              </div>

              <div class="form-group">
                <label for="porcentajeSegundoVencimiento">% Segundo Vencimiento</label>
                <input
                  id="porcentajeSegundoVencimiento"
                  type="number"
                  @input="onInputChange"
                  :placeholder="`${consorcioSeleccionado.porcentajeSegundoVencimiento}`"
                  v-model="consorcioSeleccionado.porcentajeSegundoVencimiento"
                  required
                  step="0.01"
                  min="0"
                  style="text-align: center;"
                />
              </div>
            </div>

            <div class="grupo-botones">
              <button type="submit" class="btn btn-success">Guardar Cambios</button>
              <button
                type="button"
                class="btn btn-alert"
                @click="deleteConsorcio(consorcioSeleccionado.idConsorcio)"
              >
                Eliminar consorcio
              </button>
              <button type="button" class="btn btn-cancel" @click="cancelarEdicion()">
                Cancelar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//IMPORTS
import { API_CONSORCIOS } from '@renderer/config/config'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { onBeforeRouteLeave } from 'vue-router'
import { useAdminStore } from '@renderer/stores/adminStore'
import { showConfirmDialog, showErrorDialog } from '../utils/dialogs'

//VARIABLES Y CONSTANTES
const adminStore = useAdminStore()
const idAdm = adminStore.administracionData.idAdm
const consorciosUrl = API_CONSORCIOS(idAdm)

const loading = ref(true)
const consorcios = ref([])

const banderaSeleccion = ref(false)
const unsavedChanges = ref(false)
const consorcioSeleccionado = ref({})

//FUNCIONES

// Método para obtener todos los consorcios
const obtenerConsorcios = async () => {
  try {
    const response = await axios.get(consorciosUrl)

    if (Array.isArray(response.data)) {
      consorcios.value = response.data.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else {
      console.warn('Error: La respuesta de la API no es un array', response.data)
      consorcios.value = []
    }
  } catch (error) {
    console.error('Error al obtener consorcios:', error)
    showErrorDialog(error)
  } finally {
    loading.value = false
  }
}

// Función para seleccionar un consorcio y redirigir a la vista de edición
const selectConsorcio = (consorcio) => {
  consorcioSeleccionado.value = consorcio;
  console.log(JSON.stringify(consorcioSeleccionado.value))
  banderaSeleccion.value = true
}

const cancelarEdicion = () => {
  banderaSeleccion.value = false
}
// Método para actualizar un consorcio (por implementar)
const updateConsorcio = async () => {
  try {
    const response = await axios.put(
      `${consorciosUrl}/${consorcioSeleccionado.value.idConsorcio}`,
      consorcioSeleccionado.value
    )
    console.log(JSON.stringify(consorcioSeleccionado.value))
    window.api.alert('Consorcio ' + consorcioSeleccionado.value.nombre + ' actualizado con éxito.')
    banderaSeleccion.value = false
    unsavedChanges.value = false
    obtenerConsorcios()
  } catch (error) {
    console.error('Error actualizando el Consorcio:', error)
    window.api.alert('Hubo un error al actualizar el Consorcio.')
    showErrorDialog(error)
  }
}

// Marcar cambios no guardados
const onInputChange = () => {
  unsavedChanges.value = true
}

// Método para eliminar un consorcio (por implementar)
const deleteConsorcio = async (idConsorcio) => {
  const confirmar = await window.api.confirm(
    `¿Estás seguro de que quieres eliminar el consorcio ${consorcioSeleccionado.value.nombre}?`
  )

  if (confirmar) {
    try {
      const response = await axios.delete(`${consorciosUrl}/${idConsorcio}`)
      window.api.alert('Consorcio ' + consorcioSeleccionado.value.nombre + ' eliminado con éxito.')

      banderaSeleccion.value = false
      unsavedChanges.value = false
      obtenerConsorcios()
    } catch (error) {
      console.error('Error eliminando el Consorcio:', error)
      window.api.alert('Hubo un error al eliminar el Consorcio.')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada')
  }
}

onMounted(() => {
  obtenerConsorcios()
})

onBeforeRouteLeave((to, from, next) => {
  if (unsavedChanges.value) {
    showConfirmDialog('Tienes cambios sin guardar. ¿Estás seguro que quieres salir?').then(
      (confirmLeave) => {
        if (confirmLeave) {
          cancelarEdicion()
          next() // Permitir la navegación
        } else {
          next(false) // Cancelar la navegación
        }
      }
    )
  } else {
    next() // Permitir la navegación sin restricciones
  }
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

/* Estilos para el scrollbar */
.container-datos-consorcios::-webkit-scrollbar,
.container-consorcios::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.container-datos-consorcios::-webkit-scrollbar-track,
.container-consorcios::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.container-datos-consorcios::-webkit-scrollbar-thumb,
.container-consorcios::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron);
  border-radius: 4px;
  border: 1px solid #573b27;
}

.container-datos-consorcios::-webkit-scrollbar-thumb:hover,
.container-consorcios::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e;
}

/* Estilos para la tabla */
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffffe0;
  margin-bottom: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  color: white;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #e0e0e0;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.container-consorcios,
.container-datos-consorcios {
  flex-basis: 50%;
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;
  padding: 15px;
  background-color: #f3d08e;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
}

.container-datos-consorcios form {
  display: flex;
  flex-direction: column;
}

.container-datos-consorcios form > div {
  display: flex;
  flex-direction: column;
}

.container-datos-consorcios label {
  font-weight: bold;
  color: black;
  margin-top: 2px;
  margin-bottom: 2px;
  font-size: 12px;
}

.container-datos-consorcios .form-control {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 1px;
  transition: border-color 0.2s ease-in-out;
  font-size: 12px;
}

.container-datos-consorcios .form-control:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.container-datos-consorcios .btn {
  padding: 8px 12px;
  font-size: 0.9rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s;
}

.container-datos-consorcios .btn-success:hover {
  background-color: #218838;
}

.container-datos-consorcios .btn-alert:hover {
  background-color: #c82333;
}

.container-datos-consorcios .btn-cancel:hover {
  background-color: #8d8b8b;
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
  object-fit: contain;
}

.container-datos-consorcios .btn {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  margin-top: 3px;
  padding: 8px;
  border: none;
  color: black;
  font-size: 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.container-datos-consorcios form .form-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  text-align: center;
}

.container-datos-consorcios form .form-row .form-group {
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.grupo-botones {
  display: flex;
  gap: 1px;
  margin-top: 5px;
  min-width: 100px;
}

.grupo-botones .btn {
  flex: 1;
}
</style>
