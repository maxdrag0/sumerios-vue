<script setup>
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()

// Método para cerrar la aplicación en api
const cerrarApp = () => {
  if (window) {
    window.close()
  } else {
    console.error('La funcionalidad de cierre no está disponible.')
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="logo-container">
      <router-link to="/" class="btn btn-primary">
        <img src="@renderer/assets/sumerios-min.png" alt="Menu" class="logo-button" />
      </router-link>
    </div>
    <ul class="bottom-menu">
      <!-- Administración -->
      <li class="menu-item">
        <router-link to="/administracion" class="btn btn-primary">
          <li>ADMINISTRACIÓN</li>
        </router-link>
        <ul class="submenu">
          <router-link to="/administracion" class="btn btn-primary">
            <li>Datos administración</li>
          </router-link>
          <router-link
            to="/"
            class="btn btn-primary"
            v-if="authStore.isAuthenticated"
            @click="authStore.logOut()"
          >
            <li>Cerrar sesión</li>
          </router-link>
        </ul>
      </li>

      <!-- Consorcio -->
      <li class="menu-item">
        <router-link to="/consorcios" class="btn btn-primary">
          <li>CONSORCIO</li>
        </router-link>
        <ul class="submenu">
          <router-link to="/consorcios" class="btn btn-primary">
            <li>Consorcios</li>
          </router-link>
          <router-link to="/uf" class="btn btn-primary">
            <li>Unidades Funcionales</li>
          </router-link>
          <router-link to="/historia-estado-cuenta" class="btn btn-primary">
            <li>Historial estado de cuenta</li>
          </router-link>
        </ul>
      </li>

      <!-- Pago de Expensas -->
      <li class="menu-item">
        <router-link to="/pagouf" class="btn btn-primary">
          <li>PAGO DE EXPENSAS</li>
        </router-link>
      </li>

      <!-- Proveedores -->
      <li class="menu-item">
        <router-link to="/proveedores" class="btn btn-primary">
          <li>PROVEEDORES</li>
        </router-link>
        <ul class="submenu">
          <router-link to="/proveedores" class="btn btn-primary">
            <li>Proveedores</li>
          </router-link>
          <router-link to="/proveedores" class="btn btn-primary">
            <li class="pendiente" @click.prevent>Trabajos</li>
          </router-link>
        </ul>
      </li>

      <!-- Expensas -->
      <li class="menu-item">
        <router-link to="/expensas" class="btn btn-primary">
          <li>EXPENSAS</li>
        </router-link>
        <ul class="submenu">
          <router-link to="/egreso" class="btn btn-primary">
            <li>Egresos</li>
          </router-link>
          <router-link to="/ingreso" class="btn btn-primary">
            <li>Ingresos</li>
          </router-link>
          <router-link to="/gastoParticular" class="btn btn-primary">
            <li>Gastos Particulares</li>
          </router-link>
          <router-link to="/expensas" class="btn btn-primary">
            <li>Liquidar Expensa</li>
          </router-link>
        </ul>
      </li>
    </ul>
    <div class="quit-container">
      <button @click="cerrarApp" class="quit-button">
        <img src="@renderer/assets/quit.png" alt="Cerrar" class="quit-icon" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  font-weight: bold;
  font-size: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--sumerio-rojo-claro);
  outline: 2px solid black;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 80px;
}

.logo-container {
  position: relative;
  padding-top: 5px;
  z-index: 1100;
  margin-left: 5px;
  margin-right: 5px;
}

.logo-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
  transition: transform 1.5s ease;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
}

.logo-button:hover {
  transform: scale(1.05);
}

.bottom-menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  position: relative;
  flex: 1;
  text-align: center;
  padding: 8px;
  color: var(--sumerio-negro);
  cursor: pointer;
  border: 1px solid black;
  border-radius: 12px;
  margin-left: 5px;
  margin-right: 5px;
  background-color: var(--sumerio-marron);
  box-shadow:
    3px 3px 3px rgba(0, 0, 0, 0.3),
    -3px -3px 3px rgba(0, 0, 0, 0.3);
}

.menu-item li {
  font-weight: 700;
}

.menu-item:hover {
  background-color: var(--sumerio-rojo-oscuro);
}

.menu-item .submenu {
  display: none;
  position: absolute;
  top: 104%;
  left: 0;
  width: 100%;
  background-color: var(--sumerio-rojo-claro);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 1000;
  outline: 1px solid black;
}

.menu-item:hover .submenu {
  display: block;
}

.submenu li {
  text-align: center;
  padding: 10px;
  color: var(--sumerio-negro);
  background-color: var(--sumerio-marron);
  transition: background-color 0.3s ease;
}

.submenu li:hover {
  background-color: var(--sumerio-rojo-oscuro);
  outline: 2px solid black;
  font-weight: bold;
}

.btn {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.quit-container {
  display: flex;
  align-items: center;
  margin-right: 5px;
  margin-left: 5px;
}

.quit-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.quit-icon {
  width: 60px;
  height: 60px;
  transition: transform 0.5s ease;
}

.quit-button:hover .quit-icon {
  transform: scale(1.1);
}

.pendiente {
  opacity: 0.5;
  cursor: default;
}

.submenu li.pendiente:hover {
  background-color: var(--sumerio-marron);
}
</style>
