<template>
  <div class="container-view">
    <div class="selector-consorcio">
      <BotonConsorcio />
      <BotonUf />
    </div>
    <div class="tabla-estados-cuenta">
      <table>
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Deuda</th>
            <th>Intereses</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>E</th>
            <th>Gasto Particular</th>
            <th>Total Expensas</th>
            <th>2° VTO</th>
            <th>Total Pago</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody v-if="selectedUf">
          <tr>
            <td>{{ estadoCuentaActual?.periodo }}</td>
            <td>{{ currency(estadoCuentaActual?.deuda) }}</td>
            <td>{{ currency(estadoCuentaActual?.intereses) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalA) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalB) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalC) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalD) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalE) }}</td>
            <td>{{ currency(estadoCuentaActual?.gastoParticular) }}</td>
            <td>{{ currency(estadoCuentaActual?.totalExpensa) }}</td>
            <td>
              {{
                estadoCuentaActual?.segundoVencimiento !== 0 &&
                estadoCuentaActual?.segundoVencimiento !== null
                  ? currency(estadoCuentaActual?.segundoVencimiento)
                  : currency(0)
              }}
            </td>
            <td>
              {{
                estadoCuentaActual?.periodo
                  ? currency(totalPagoPorPeriodo(mostrarSiguientePeriodo(estadoCuentaActual.periodo)))
                  : 'N/A'
              }}
            </td>
            <td>{{ currency(estadoCuentaActual?.saldoFinal) }}</td>
          </tr>
          <tr v-for="(copia, index) in copiasEstadoCuenta" :key="index">
            <td>{{ copia.periodo }}</td>
            <td>{{ currency(copia.deuda) }}</td>
            <td>{{ currency(copia.intereses) }}</td>
            <td>{{ currency(copia.totalA) }}</td>
            <td>{{ currency(copia.totalB) }}</td>
            <td>{{ currency(copia.totalC) }}</td>
            <td>{{ currency(copia.totalD) }}</td>
            <td>{{ currency(copia.totalE) }}</td>
            <td>{{ currency(copia.gastoParticular) }}</td>
            <td>{{ currency(copia.totalExpensa) }}</td>
            <td>
              {{
                copia.segundoVencimiento !== 0 && copia.segundoVencimiento !== null
                  ? currency(copia.segundoVencimiento)
                  : currency(0)
              }}
            </td>
            <td>{{ currency(totalPagoPorPeriodo(mostrarSiguientePeriodo(copia.periodo))) }}</td>
            <td>{{ currency(copia.saldoFinal) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import BotonConsorcio from '@renderer/components/BotonConsorcio.vue'
import BotonUf from '../../components/BotonUf.vue'
import { computed, ref, watch, onUnmounted, onMounted } from 'vue'
import { useConsorcioStore } from '@renderer/stores/consorcioStore'
import { useUfStore } from '@renderer/stores/ufStore'
import axios from 'axios'

const consorcioStore = useConsorcioStore()
const ufStore = useUfStore()
const selectedConsorcio = computed(() => consorcioStore.selectedConsorcio)
const selectedUf = computed(() => ufStore.selectedUf)
const copiasEstadoCuenta = ref([])
const estadoCuentaActual = ref({})
const pagosUf = ref([])

watch(selectedConsorcio, () => {
  // Vaciar los datos cuando cambia el consorcio
  copiasEstadoCuenta.value = []
  estadoCuentaActual.value = {}
  pagosUf.value = []

  // También podrías resetear la unidad funcional seleccionada
  ufStore.setUf(null)
})

watch(selectedUf, (newValue) => {
  if (newValue && newValue.idUf) {
    obtenerCopiasPeriodos()
  }
})

const obtenerCopiasPeriodos = async () => {
  if (!ufStore.selectedUf || !ufStore.selectedUf.idUf) {
    console.warn('No hay unidad funcional seleccionada.')
    return
  }

  try {
    const [copiasEstadoCuentaResponse, estadoCuentaActualResponse, pagosUfResponse] =
      await Promise.all([
        axios.get(
          `http://192.168.0.1:8080/api/copia_estado_cuenta_uf/uf/${ufStore.selectedUf?.idUf}`
        ),
        axios.get(`http://192.168.0.1:8080/api/estado_cuenta_uf/uf/${ufStore.selectedUf?.idUf}`),
        axios.get(`http://192.168.0.1:8080/api/pagoUF/unidadFuncional/${ufStore.selectedUf?.idUf}`)
      ])
    copiasEstadoCuenta.value = copiasEstadoCuentaResponse.data || []
    estadoCuentaActual.value = estadoCuentaActualResponse.data || []
    pagosUf.value = pagosUfResponse.data || []

    copiasEstadoCuenta.value.sort((a, b) => {
      return b.periodo.localeCompare(a.periodo) // Ordena en orden descendente
    })
  } catch (error) {
    console.error('Error al cargar los periodos:', error)
    await window.api.alert('Error al cargar los periodos.')
  }
}

const totalPagoPorPeriodo = computed(() => {
  return (periodo) => {
    return pagosUf.value
      .filter((pago) => pago.periodo === periodo)
      .reduce((sum, pago) => sum + pago.valor, 0)
  }
})

onUnmounted(() => {
  consorcioStore.setConsorcio(null)
  ufStore.setUf(null)
})

const mostrarSiguientePeriodo = (periodo) => {
  console.warn('PERIODO PASADO')
  console.log(periodo)
  if (!periodo) {
    console.warn('Error: periodo es indefinido')
    return null // Manejar el caso donde periodo es indefinido
  }

  const [year, month] = periodo.split('-').map(Number)

  const fecha = new Date(year, month - 1)
  fecha.setMonth(fecha.getMonth() + 1)
  const siguienteFecha = fecha.toISOString().slice(0, 7)
  console.log(siguienteFecha)
  console.warn('PERIODO SIGUIENTE')
  return siguienteFecha
}

const currency = (value) => {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value)
}
</script>

<style scoped>
.selector-consorcio {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
}

.tabla-estados-cuenta {
  padding: 10px;
  text-align: center;
  font-size: 15px;
}

.tabla-estados-cuenta table {
  margin-top: 5px;
  border: 1px solid black;
  background-color: #ffffffe0;
  width: 100%;
}

.tabla-estados-cuenta th {
  font-weight: bold;
  border: 1px solid black;
}
</style>
