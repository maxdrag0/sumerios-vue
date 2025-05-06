<template>
  <div class="container">
    <div v-if="iniciarSesion" class="login-container">
      <h1>Iniciar Sesión</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="username" type="username" placeholder="Usuario" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <button @click="registro()">REGISTRO</button>
    </div>
    <div v-else class="register-container">
      <h1>Registro</h1>

      <form @submit.prevent="handleRegistration">
        <div class="input-row">
          <input v-model="administrador.nombre" type="text" placeholder="Nombre" required />
          <input v-model="administrador.apellido" type="text" placeholder="Apellido" required />
        </div>
        <div class="input-row">
          <input v-model="administrador.username" type="text" placeholder="Usuario" required />
          <input
            v-model="administrador.password"
            type="password"
            placeholder="Contraseña"
            required
          />
        </div>
        <div class="input-row">
          <input v-model="administrador.mail" type="mail" placeholder="mail@tumail.com" required />
          <input v-model="administrador.telefono" type="phone" placeholder="1122334455" required />
        </div>
        <div class="input-row">
          <input
            v-model="administrador.matriculaAdministrador"
            type="text"
            placeholder="Matricula"
            required
          />
          <input v-model="administrador.cuit" type="text" placeholder="CUIT" required />
        </div>
        <button type="submit">Registro</button>
      </form>
      <button @click="inicioSesion()">INICIAR SESION</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@renderer/stores/auth'
import { useAdminStore } from '@renderer/stores/adminStore'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { showErrorDialog } from '../utils/dialogs'

// Instancias del router y la ruta actual
const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const adminStore = useAdminStore()
const iniciarSesion = ref(true)
const username = ref('')
const password = ref('')

const administrador = ref({
  nombre: '',
  apellido: '',
  username: '',
  password: '',
  mail: '',
  telefono: '',
  rol: 'ADMINISTRADOR',
  matriculaAdministrador: '',
  cuit: ''
})

const handleLogin = async () => {
  try {
    await authStore.logIn({ username: username.value, password: password.value })

    // Verificamos que la administración se cargue correctamente antes de redirigir
    if (adminStore.administracionData !== null) {
      await router.push({ name: 'home' })
    } else {
      await router.push({ name: 'CrearAdministracion' })
    }
  } catch (error) {
    console.error('Error en el login:', error)
    window.api.alert('Error al iniciar sesión. Intenta nuevamente.')
    showErrorDialog(error)
  }
}

const handleRegistration = async () => {
  console.log(JSON.stringify(administrador.value))
  try {
    const response = await axios.post(
      'http://192.168.0.1:8080/api/auth/registerAdmin',
      administrador.value
    )
    toast.success('Administrador creado con éxito!', {
      theme: 'colored',
      type: 'success',
      position: 'top-center',
      transition: 'flip',
      dangerouslyHTMLString: true
    })
    username.value = administrador?.value.username
    password.value = administrador?.value.password

    administrador.value = {
      nombre: '',
      apellido: '',
      username: '',
      password: '',
      mail: '',
      telefono: '',
      rol: 'ADMINISTRADOR',
      matriculaAdministrador: '',
      cuit: ''
    }

    console.log(JSON.stringify(username.value))
    console.log(JSON.stringify(password.value))

    await handleLogin()

    if (adminStore.administracionData !== null) {
      await router.push({ name: 'home' })
    } else {
      await router.push({ name: 'CrearAdministracion' })
    }
  } catch (error) {
    console.error('Error al crear el administrador:', error)
    showErrorDialog(error)
  }
}

const registro = () => {
  iniciarSesion.value = false
  ;(username.value = ''), (password.value = '')
}

const inicioSesion = () => {
  iniciarSesion.value = true
}
</script>

<style scoped>
.login-container {
  margin-top: 100px;
  background: var(--sumerio-rojo-claro);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  outline: 2px solid black;
  text-align: center;
  width: 100%;
  max-width: 400px;
  height: 70%;
  flex-grow: 1;
}

.register-container {
  margin-top: 100px;
  background: var(--sumerio-rojo-claro);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  outline: 2px solid black;
  text-align: center;
  width: 100%;
  max-width: 600px;
  align-content: center;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.input-row input {
  flex: 1;
}

.input-row:focus::placeholder {
  color: transparent;
}

h1 {
  color: var(--sumerio-crema);
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 6px;
  background: var(--vt-c-black-mute);
  color: var(--color-text-1);
  font-size: 1rem;
  text-align: center;
}

input::placeholder {
  color: var(--sumerio-crema);
  text-align: center;
}

input:focus {
  outline: 2px solid var(--sumerio-rojo-claro);
  text-align: center;
}

button {
  padding: 0.75rem;
  background: var(--sumerio-marron);
  color: var(--color-text-1);
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
  outline: 1px solid black;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
}

button:hover {
  background: #ac843b;
}
</style>
