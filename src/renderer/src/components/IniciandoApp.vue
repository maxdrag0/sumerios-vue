<template>
  <div class="container">
    <div class="log-container">
      <h1 class="titulo">Entrando a Sumerios</h1>
      <div class="spinner"></div>
      <div class="barra-progreso">
        <div class="progreso" :style="{ width: props.progress + '%' }"></div>
      </div>
      <p class="texto-progreso">Cargando... {{ props.progress }}%</p>
      <h6 class="creditos">Powered by < /MAD ></h6>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  progress: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.log-container {
  background: var(--sumerio-rojo-claro);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  outline: 2px solid black;
  text-align: center;
  width: 100%;
  max-width: 500px;
  flex-grow: 1;
}

.titulo {
  font-size: xx-large;
  margin-bottom: 2rem;
  font-weight: bolder;
}

.creditos {
  font-size: larger;
  color: var(--sumerio-crema);
  font-weight: bolder;
}

.spinner {
  margin: 1.5rem auto 0.5rem auto;
  width: 70px;
  height: 70px;
  border: 4px solid var(--sumerio-crema); /* Borde gris claro */
  border-top: 4px solid black; /* Borde superior oscuro para la animación */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* Animación de giro */
}

/* Keyframes para la animación */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.barra-progreso {
  width: 100%;
  height: 10px;
  background-color: var(--sumerio-negro);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;
}

.progreso {
  height: 100%;
  background-color: var(--sumerio-crema); /* o var(--sumerio-negro) */
  transition: width 0.2s ease-in-out;
}

.texto-progreso {
  text-align: center;
  font-size: 1rem;
  margin-bottom: 2rem;
  margin-top: 1.5rem;
  font-weight: bold;
  color: white;
}
</style>
