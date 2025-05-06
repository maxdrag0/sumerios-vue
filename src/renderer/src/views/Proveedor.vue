<template>
  <div class="container-view">
    <div class="container">
      <div class="tabla-proveedores">
        <table class="table table-striped">
          <thead>
            <tr>
              <th @click="ordenarPor('nombre')">
                Nombre {{ ordenActual.columna === 'nombre' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('descripcion')">
                Descripción
                {{ ordenActual.columna === 'descripcion' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('cuit')">
                CUIT {{ ordenActual.columna === 'cuit' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
              <th @click="ordenarPor('telefono')">
                Telefono
                {{ ordenActual.columna === 'telefono' ? (ordenActual.asc ? '↑' : '↓') : '' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="proveedor in proveedores"
              :key="proveedor.idProveedor"
              @click="seleccionarProveedor(proveedor)"
            >
              <td>{{ proveedor.nombre }}</td>
              <td>{{ proveedor.descripcion }}</td>
              <td>{{ proveedor.cuit }}</td>
              <td>{{ proveedor.telefono }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="formulario-proveedor">
        <h3>Crear Proveedor</h3>
        <form @submit.prevent="crearOEditarProveedor">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              v-model="proveedor.nombre"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="cuit">CUIT</label>
            <input id="cuit" type="text" v-model="proveedor.cuit" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <input
              id="descripcion"
              type="text"
              v-model="proveedor.descripcion"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input
              id="telefono"
              type="text"
              v-model="proveedor.telefono"
              class="form-control"
              required
            />
          </div>
          <div class="form-group">
            <label for="cbu">CBU</label>
            <input id="cbu" type="text" v-model="proveedor.cbu" class="form-control" />
          </div>
          <button type="submit" class="btn btn-primary">
            {{ proveedor.idProveedor ? 'Actualizar' : 'Crear' }}
          </button>
          <button
            v-if="proveedor.idProveedor !== null"
            @click="cancelarEdicion()"
            class="btn btn-primary"
          >
            Cancelar edicion
          </button>
        </form>
        <button
          v-if="proveedor.idProveedor !== null"
          @click="eliminarProveedor(proveedor.idProveedor)"
          class="btn btn-primary"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAdminStore } from '@renderer/stores/adminStore'
import { showErrorDialog } from '../utils/dialogs'

const adminStore = useAdminStore()
const proveedores = ref([])
const ordenActual = ref({ columna: '', asc: true })

const ordenarPor = (columna) => {
  if (ordenActual.value.columna === columna) {
    ordenActual.value.asc = !ordenActual.value.asc
  } else {
    ordenActual.value = { columna, asc: true }
  }

  proveedores.value.sort((a, b) => {
    const valorA = a[columna]
    const valorB = b[columna]

    // Detectar si es número
    const esNumero = !isNaN(parseFloat(valorA)) && !isNaN(parseFloat(valorB))

    if (esNumero) {
      return ordenActual.value.asc ? valorA - valorB : valorB - valorA
    } else {
      return ordenActual.value.asc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA)
    }
  })
}

const proveedor = ref({
  idProveedor: null,
  idAdm: adminStore.administracionData.idAdm,
  nombre: '',
  telefono: '',
  descripcion: '',
  cuit: '',
  cbu: ''
})

const seleccionarProveedor = (proveedorSeleccionado) => {
  proveedor.value = {
    idProveedor: proveedorSeleccionado.idProveedor,
    idAdm: adminStore.administracionData.idAdm,
    nombre: proveedorSeleccionado.nombre,
    descripcion: proveedorSeleccionado.descripcion,
    telefono: proveedorSeleccionado.telefono,
    cuit: proveedorSeleccionado.cuit,
    cbu: proveedorSeleccionado.cbu
  }
}

const cancelarEdicion = () => {
  proveedor.value = {
    idProveedor: null,
    idAdm: adminStore.administracionData.idAdm,
    nombre: '',
    descripcion: '',
    telefono: '',
    cuit: '',
    cbu: ''
  }
}

const crearOEditarProveedor = async () => {
  console.log(JSON.stringify(proveedor.value))
  try {
    if (proveedor.value.idProveedor !== null) {
      // Si idIngreso no es null, actualiza el ingreso
      await axios.put(
        `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores/${proveedor.value.idProveedor}`,
        proveedor.value
      )
      window.api.alert('Proveedor actualizado con éxito.')
    } else {
      // Si idIngreso es null, crea un nuevo ingreso
      await axios.post(
        `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores`,
        proveedor.value
      )
      window.api.alert('Proveedor creado con éxito.')
    }

    await cargarProveedoresAdm()

    proveedor.value = {
      idProveedor: null,
      idAdm: adminStore.administracionData.idAdm,
      nombre: '',
      descripcion: '',
      telefono: '',
      cuit: '',
      cbu: ''
    }
  } catch (error) {
    console.error('Error al crear o editar el proveedor:', error)
    window.api.alert('Error al crear o editar el proveedor.')
    showErrorDialog(error)
  }
}

const eliminarProveedor = async (idProveedor) => {
  const confirmar = await window.api.confirm('¿Estás seguro de que quieres eliminar el proveedor?')

  if (confirmar) {
    try {
      await axios.delete(
        `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores/${idProveedor}`
      )
      window.api.alert('Proveedor eliminado con éxito.')
      await cargarProveedoresAdm()
    } catch (error) {
      console.error('Error al proveedor eliminar el proveedor:', error)
      window.api.alert('Error al proveedor eliminar el proveedor:')
      showErrorDialog(error)
    }
  } else {
    window.api.alert('Eliminacion cancelada')
  }
}

const cargarProveedoresAdm = async () => {
  try {
    const response = await axios.get(
      `http://192.168.0.1:8080/api/administraciones/${adminStore.administracionData.idAdm}/proveedores`
    )
    proveedores.value = response.data.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    showErrorDialog(error)
  }
}

onMounted(() => {
  cargarProveedoresAdm()
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

.tabla-proveedores {
  flex: 2; /* La tabla ocupa más espacio proporcionalmente que el formulario */
  background: #f3d08e;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  padding: 15px;
  overflow: auto; /* Permite scroll si el contenido es mayor que el contenedor */
}

.tabla-proveedores .table {
  margin: 0;
  width: 100%; /* La tabla ocupa todo el ancho disponible dentro del contenedor */
  table-layout: auto; /* Permite que las columnas se ajusten al contenido */
  background-color: #ffffffe0;
}

.tabla-proveedores th,
.tabla-proveedores td {
  text-align: left;
  vertical-align: middle;
  padding: 10px; /* Espaciado interno para mejor visualización */
}

.tabla-proveedores th {
  background-color: var(--sumerio-marron);
  font-weight: bold;
  color: black;
}

.tabla-proveedores tr:hover {
  background-color: #f2f2f2;
  cursor: pointer;
}

.tabla-proveedores::-webkit-scrollbar {
  width: 0px;
}

.tabla-proveedores::-webkit-scrollbar {
  width: 8px;
}

.tabla-proveedores::-webkit-scrollbar-track {
  background: #f0f0f0; /* fondo del track del scroll */
  border-radius: 4px;
}

.tabla-proveedores::-webkit-scrollbar-thumb {
  background-color: var(--sumerio-marron); /* color del scroll "thumb" */
  border-radius: 4px;
  border: 1px solid #573b27; /* borde opcional */
}

.tabla-proveedores::-webkit-scrollbar-thumb:hover {
  background-color: #a96f3e; /* color al pasar el mouse */
}

.formulario-proveedor {
  flex: 1; /* El formulario ocupa menos espacio proporcionalmente */
  background: #f3d08e;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
  padding: 20px;
}

.formulario-proveedor h3 {
  text-align: center;
  font-weight: bold;
  color: black;
  margin-bottom: 20px;
}

.formulario-proveedor .form-group {
  margin-bottom: 10px;
}

.formulario-proveedor label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.formulario-proveedor input {
  border: 1px solid #bbb;
  border-radius: 4px;
  padding: 6px 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-size: 14px;
}

.formulario-proveedor .btn {
  font-weight: bold;
  background-color: var(--sumerio-marron);
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: none;
  color: black;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.formulario-proveedor .btn:hover {
  background-color: #885b21e0;
}
</style>
