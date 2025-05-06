<script setup>
import axios from 'axios'
import MenuNavegacion from './components/MenuNavegacion.vue'
import { ref, onMounted, watch, computed } from 'vue'
import Login from './components/Login.vue'
import { useAuthStore } from './stores/auth'
import IniciandoApp from './components/IniciandoApp.vue'
import ErrorConexion from './components/ErrorConexion.vue'
import { showErrorDialog } from './utils/dialogs'

const authStore = useAuthStore()
const status = ref('connecting') // Estado inicial
const progress = ref(0)

const componenteActual = computed(() => {
  if (status.value === 'connecting') return IniciandoApp
  if (status.value === 'connected') return Login
  return ErrorConexion
})

onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 95) {
      progress.value += 1
    }
  }, 150)

  const checkBackend = async () => {
    try {
      const response = await axios.get('http://192.168.0.1:8080/api/auth/status')
      if (response.data === 'ready') {
        progress.value = 100
        setTimeout(() => {
          status.value = 'connected'
          clearInterval(interval)
          clearInterval(checkInterval)
        }, 200)
      }
    } catch (error) {
      console.error('Error al intentar conectar al backend:', error)
      console.log('Esperando backend...')
      showErrorDialog(error)
    }
  }

  const checkInterval = setInterval(checkBackend, 1000)
})
</script>

<template>
  <MenuNavegacion v-if="authStore.isAuthenticated && !authStore.previewExp" />
  <main>
    <div v-if="!authStore.isAuthenticated" class="login-container">
      <Transition name="fade" mode="out-in">
        <component :is="componenteActual" :progress="progress" />
      </Transition>
    </div>
    <div v-else>
      <RouterView />
    </div>
  </main>
</template>

<style>
:root {
  /* COLORES SUMERIOS */
  --sumerio-rojo-claro: #bf3641;
  --sumerio-rojo-oscuro: #8c3030;
  --sumerio-marron: #bf9341;
  --sumerio-crema: #f2e399;
  --sumerio-negro: #181818;

  --color-text-1: #ffffff;
  --color-text-2: rgba(235, 235, 235, 0.64);

  --vt-c-white-soft: #f8f8f8;
  --vt-c-white-mute: #f2f2f2;

  --vt-c-black: #181818;
  --vt-c-black-soft: #222222;
  --vt-c-black-mute: #282828;

  --vt-c-divider-dark-1: rgba(84, 84, 84, 0.65);
  --vt-c-divider-dark-2: rgba(84, 84, 84, 0.48);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-weight: normal;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  min-height: 100vh;
  color: var(--sumerio-negro);
  background-image: url('@renderer/assets/Ciudad.png');
  background-size: cover;
  transition:
    color 0.5s,
    background-color 0.5s;
  line-height: 1;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 14px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* body.connected {
  background-image: url('@renderer/assets/FondoPostLogin.png');
} */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

body h1 {
  text-align: center;
}

a {
  text-decoration: none;
  color: var(--sumerio-negro);
  transition: 0.4s;
  padding: 3px;
}

@media (hover: hover) {
  a:hover {
    outline: 3px black;
    color: white;
  }
}

.container-view {
  position: absolute;
  top: 80px; /* Espacio para el navbar (80px + margen) */
  left: 10px;
  right: 10px;
  bottom: 10px;
  background-color: var(--sumerio-crema);
  border: 100px black;
  border-radius: 10px;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  outline: 1px solid black;
  margin-top: 10px;
  box-shadow:
    5px 5px 5px rgba(0, 0, 0, 0.3),
    -5px -5px 5px rgba(0, 0, 0, 0.3);
}

.container-view::-webkit-scrollbar {
  visibility: hidden;
  width: 0px;
}

main {
  width: 100%;
  height: calc(100vh - 80px);
  padding: 25px 10px 5px 10px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  margin-bottom: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 1000px;
  padding: 5px;
}

.connecting-container {
  margin-bottom: 20px;
  text-align: center;
}

h1 {
  color: var(--sumerio-crema);
  font-size: 2rem;
  margin-bottom: 10px;
}

input:focus::placeholder {
  color: transparent;
}
</style>
