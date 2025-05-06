<template>
  <div class="container-view">
    <div class="container">
      <div class="container-datos">
        <div v-if="loading">
          <p>Cargando datos de la administración...</p>
        </div>
        <div v-else>
          <h3 v-if="administracion.nombre">
            Nombre:
            <p>{{ administracion.nombre }}</p>
          </h3>
          <h3 v-if="administracion.direccion">
            Direccion:
            <p>{{ administracion.direccion }}</p>
          </h3>
          <h3 v-if="administracion.telefono">
            Telefono:
            <p>{{ administracion.telefono }}</p>
          </h3>
          <h3 v-if="administracion.cuit">
            Cuit:
            <p>{{ administracion.cuit }}</p>
          </h3>
          <h3 v-if="administracion.mail">
            Mail:
            <p>{{ administracion.mail }}</p>
          </h3>
          <button class="btn btn-primary" @click="activarEdicion(administracion)">Editar</button>
        </div>
      </div>

      <div class="container-edicion">
        <div v-if="!edicion" class="center-content">
          <img src="@renderer/assets/sumerios-min.png" alt="logo-sumerios" class="logo" />
        </div>

        <div v-else>
          <h2>Editar Administracion {{ administracionEdit.nombre }}</h2>
          <form @submit.prevent="updateAdm">
            <div>
              <label for="nombre">Nombre</label>
              <input
                v-model="administracionEdit.nombre"
                @input="onInputChange"
                :placeholder="`${administracionEdit.nombre}`"
                id="nombre"
                class="form-control"
                required
              />
            </div>
            <div>
              <label for="direccion">Direccion</label>
              <input
                v-model="administracionEdit.direccion"
                @input="onInputChange"
                :placeholder="`${administracionEdit.direccion}`"
                id="direccion"
                class="form-control"
                required
              />
            </div>
            <div>
              <label for="telefono">Telefono</label>
              <input
                v-model="administracionEdit.telefono"
                @input="onInputChange"
                :placeholder="`${administracionEdit.telefono}`"
                id="telefono"
                class="form-control"
                required
              />
            </div>
            <div>
              <label for="cuit">Cuit</label>
              <input
                v-model="administracionEdit.cuit"
                @input="onInputChange"
                :placeholder="`${administracionEdit.cuit}`"
                id="cuit"
                class="form-control"
                required
              />
            </div>
            <div>
              <label for="mail">Mail</label>
              <input
                v-model="administracionEdit.mail"
                @input="onInputChange"
                :placeholder="`${administracionEdit.mail}`"
                id="mail"
                class="form-control"
                required
              />
            </div>
            <button type="submit" class="btn btn-success">Guardar Cambios</button>
            <button type="submit" class="btn btn-cancel" @click="cancelarEdicion()">
              Cancelar cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { API_ADM } from '@renderer/config/config'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { onBeforeRouteLeave } from 'vue-router'
import { useAdminStore } from '@renderer/stores/adminStore'
import { showConfirmDialog, showErrorDialog } from '../utils/dialogs'

// VARIABLES Y CONSTANTES
const loading = ref(true)
const adminStore = useAdminStore()

const edicion = ref(false)
const unsavedChanges = ref(false)
const administracion = ref({
  idAdm: 0,
  nombre: '',
  direccion: '',
  telefono: '',
  cuit: '',
  mail: ''
})
const administracionEdit = ref({})

// FUNCIONES

// Método para obtener la administración
const cargarAdm = async (id) => {
  try {
    const response = await axios.get(`${API_ADM}/${id}`)
    administracion.value = response.data
  } catch (error) {
    console.log(`${API_ADM}/${id}`)

    console.error('Error cargando la administración:', error)
    showErrorDialog(error)
  } finally {
    loading.value = false
  }
}

// Modo edicion
const activarEdicion = (administracion) => {
  administracionEdit.value = {
    idAppUser: adminStore.administradorData.idAppUser || 0,
    idAdm: administracion.idAdm || null,
    nombre: administracion.nombre || '',
    cuit: administracion.cuit || '',
    mail: administracion.mail || '',
    telefono: administracion.telefono || '',
    direccion: administracion.direccion || ''
  }
  edicion.value = true // Cambia 'edicion' a true
}

const cancelarEdicion = () => {
  edicion.value = false
  unsavedChanges.value = false
}

// Método para editar la administración
const updateAdm = async () => {
  try {
    console.log(`${API_ADM}/${administracionEdit.value.idAdm}`)
    console.log('Datos a enviar:', JSON.stringify(administracionEdit.value))
    const response = await axios.put(
      `${API_ADM}/${adminStore.administracionData.idAdm}`,
      administracionEdit.value
    )
    console.log('Administración actualizada:', response.data)
    window.api.alert(
      'Administración ' + administracionEdit.value.nombre + ' actualizada con éxito.'
    )
    edicion.value = false
    unsavedChanges.value = false
    cargarAdm(adminStore.administracionData.idAdm)
  } catch (error) {
    console.error('Error actualizando la administración:', error)
    window.api.alert('Hubo un error al actualizar la administración.')
    showErrorDialog(error)
  }
}

// Marcar cambios no guardados
const onInputChange = () => {
  unsavedChanges.value = true
}

// CICLO DE VIDA
onMounted(() => {
  cargarAdm(adminStore.administracionData.idAdm)
})

// HOOK para evitar la navegación sin guardar cambios
onBeforeRouteLeave((to, from, next) => {
  if (unsavedChanges.value) {
    showConfirmDialog('Tienes cambios sin guardar. ¿Estás seguro que quieres salir?').then(
      (confirmLeave) => {
        if (confirmLeave) {
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
button {
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  display: block;
  margin: auto;
  margin-bottom: 1rem;
}

input::placeholder {
  opacity: 0.6; /* Transparencia del placeholder */
  color: #000; /* Color del placeholder */
}

button.btn-success {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
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

.container-datos {
  flex: 1;
  overflow-y: auto;
  background-color: #f3d08e; /* Fondo claro */
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid black;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  height: 100%;
}

.container-datos h3 {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333; /* Color de texto principal */
  text-align: center;
}

.container-datos button {
  padding: 2px 10px;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s;
}

.container-edicion {
  flex: 1;
  overflow-y: auto; /* Desplazamiento vertical si hay contenido extenso */
  box-sizing: border-box; /* Asegura que el padding y el borde se incluyan en el ancho total */
  padding: 10px; /* Espacio interno */
  background-color: #f3d08e; /* Fondo claro */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra para profundidad */
  border: 1px solid black;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  height: 100%;
}

.container-edicion h2 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333; /* Color de texto principal */
  text-align: center;
}

.container-edicion form {
  display: flex;
  flex-direction: column; /* Apila los elementos verticalmente */
  gap: 10px; /* Espaciado entre elementos */
}

.container-edicion form div {
  display: flex;
  flex-direction: column;
}

.container-edicion label {
  font-weight: bold;
  color: #555; /* Color del texto de las etiquetas */
}

.container-edicion .form-control {
  padding: 3px;
  font-size: 1rem;
  border: 1px solid #ddd; /* Borde suave */
  border-radius: 4px;
  transition: border-color 0.2s ease-in-out;
}

.container-edicion .form-control:focus {
  border-color: #007bff; /* Azul al enfocar */
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.container-edicion .btn {
  padding: 2px 10px;
  font-size: 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.2s;
}

.container-edicion .btn-success {
  background-color: #28a745; /* Verde */
  font-weight: bold;
  color: white;
}

.container-edicion .btn-success:hover {
  background-color: #218838;
}

.container-edicion .btn-cancel {
  background-color: #d8d6d6;
  font-weight: bold;
  color: black;
}

.container-edicion .btn-cancel:hover {
  background-color: #8d8b8b;
}

.center-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Asegura que el contenedor ocupe toda la altura disponible */
}

.logo {
  max-width: 100%;
  max-height: 100%;
}
</style>
