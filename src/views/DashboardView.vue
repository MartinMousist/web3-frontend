<template>
  <AppLayout>

    <v-card v-if="activeAlarms.length" class="mb-6" color="red-darken-4" variant="tonal" rounded="xl">
      <v-card-title class="text-error font-weight-bold d-flex align-center">
        <v-icon start color="error">mdi-alert-circle</v-icon>
        ALARMA DE TEMPERATURA ALTA ({{ activeAlarms.length }})
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-for="order in activeAlarms" :key="order.id"
          class="d-flex justify-space-between align-center mb-4 pa-3 rounded-lg"
          style="background: rgba(255,0,0,0.05)">
          <div>
            <div class="font-weight-bold text-h6">Orden OC-{{ order.id }}</div>
            <div class="text-body-1 text-grey-lighten-1">
              Camión {{ order.truck }} —
              <span class="text-error font-weight-bold text-h6">{{ formatTemp(order.temperature) }}</span>
            </div>
          </div>
          <v-btn size="large" color="error" variant="flat" :loading="loadingAlarm === order.id" @click="acknowledgeAlarm(order.id)">
            <v-icon start>mdi-check-circle</v-icon> RECONOCER ALARMA
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <div class="text-h4 font-weight-bold text-primary">Órdenes de Carga</div>
        <v-chip size="small" class="ml-4 font-weight-bold" color="primary">{{ filteredOrders.length }}</v-chip>
        <v-btn icon size="small" variant="text" class="ml-2" @click="loadOrders" :loading="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>

      <div class="d-flex align-center ga-4">
        <v-btn color="primary" prepend-icon="mdi-plus" rounded size="large" class="text-none font-weight-bold elevation-4"
          @click="showCreateModal = true">
          Nueva Orden
        </v-btn>

        <v-btn-toggle v-model="filterStatus" mandatory rounded class="elevation-2 bg-surface-light">
          <v-btn value="ALL" size="small">Todas</v-btn>
          <v-btn value="1" size="small" color="warning">Pendientes</v-btn>
          <v-btn value="2" size="small" color="info">Cargando</v-btn>
          <v-btn value="3" size="small" color="grey">Cerradas</v-btn>
          <v-btn value="4" size="small" color="success">Finalizadas</v-btn>
        </v-btn-toggle>

        <v-text-field v-model="search" density="compact" variant="solo-filled" hide-details rounded
          placeholder="Buscar..." prepend-inner-icon="mdi-magnify" style="width: 250px" />
      </div>
    </div>

    <v-card elevation="3" rounded="xl" border>
      <v-data-table :headers="headers" :items="filteredOrders" item-value="id" :loading="loading" hover>

        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)" class="font-weight-bold">
            {{ statusText(item.status) }}
          </v-chip>
        </template>

        <template #item.preset="{ item }"> {{ formatKg(item.preset) }} </template>
        <template #item.current="{ item }"> 
            <span :class="item.status === 2 ? 'text-primary font-weight-bold' : ''">{{ formatKg(item.current) }}</span>
        </template>
        <template #item.temperature="{ item }">
          <span :class="item.temperature > temperatureThreshold ? 'text-error font-weight-bold blinking' : ''">
            {{ formatTemp(item.temperature) }}
          </span>
        </template>
        <template #item.density="{ item }"> {{ item.density.toFixed(3) }} </template>
        
        <template #item.eta="{ item }">
          <div v-if="item.status === 2 && item.flow > 0" class="d-flex align-center text-caption text-info font-weight-bold">
             <v-icon size="small" start>mdi-clock-outline</v-icon> {{ calculateETA(item) }}
          </div>
          <span v-else class="text-grey">-</span>
        </template>

        <template #item.actions="{ item }">
          
          <v-btn v-if="item.status === 1" color="warning" size="small" variant="flat" @click="openWeighingModal(item, 'INITIAL')">
            <v-icon start>mdi-scale-balance</v-icon> Pesaje Inicial
          </v-btn>

          <v-btn v-if="item.status === 2" color="error" size="small" variant="outlined" @click="closeOrder(item)">
            <v-icon start>mdi-stop-circle-outline</v-icon> Cerrar Carga
          </v-btn>

          <v-btn v-if="item.status === 3" color="indigo" size="small" variant="flat" @click="openWeighingModal(item, 'FINAL')">
            <v-icon start>mdi-truck-check</v-icon> Pesaje Final
          </v-btn>

          <v-btn v-if="item.status === 4" color="success" size="small" variant="tonal" @click="openReconciliation(item)">
            <v-icon start>mdi-file-document-outline</v-icon> Conciliación
          </v-btn>

        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showCreateModal" width="700" persistent>
      <v-card class="rounded-xl">
        <v-toolbar color="primary" title="Nueva Orden de Carga"></v-toolbar>
        <v-card-text class="pa-4">
          <v-form @submit.prevent="createOrder">
            <v-row>
              <v-col cols="12"><div class="text-subtitle-2 text-primary mb-1">Datos de Carga</div></v-col>
              <v-col cols="6">
                <v-text-field v-model.number="newOrder.preset" label="Preset (Kg)" type="number" variant="outlined" suffix="kg" color="primary"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="newOrder.producto.nombre" label="Producto" variant="outlined"></v-text-field>
              </v-col>

              <v-col cols="12"><v-divider class="mb-2"></v-divider><div class="text-subtitle-2 text-primary mb-1">Transporte</div></v-col>
              <v-col cols="4">
                <v-text-field v-model="newOrder.camion.patente" label="Patente Camión" variant="outlined" prepend-inner-icon="mdi-truck"></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="newOrder.camion.descripcion" label="Desc. Camión" variant="outlined"></v-text-field>
              </v-col>
              
              <v-col cols="4">
                <v-text-field 
                  v-model.number="capacidadInput" 
                  label="Cisternado Total" 
                  type="number" 
                  variant="outlined">
                </v-text-field>
              </v-col>

              <v-col cols="6">
                 <v-text-field v-model="newOrder.chofer.dni" label="DNI Chofer" type="number" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="6">
                 <v-text-field v-model="newOrder.chofer.nombre" label="Nombre Chofer" variant="outlined"></v-text-field>
              </v-col>

              <v-col cols="12"><v-divider class="mb-2"></v-divider><div class="text-subtitle-2 text-primary mb-1">Cliente</div></v-col>
              <v-col cols="12">
                 <v-text-field v-model="newOrder.cliente.razonSocial" label="Razón Social Cliente" variant="outlined" placeholder="Escriba para crear nuevo..."></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex justify-end ga-2 mt-4">
              <v-btn variant="text" @click="showCreateModal = false">Cancelar</v-btn>
              <v-btn type="submit" color="primary" variant="flat" :loading="creating">Crear Orden</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showWeighingModal" width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-center">
          {{ weighingType === 'INITIAL' ? 'Registro de Tara' : 'Registro de Pesaje Final' }}
        </v-card-title>
        <v-card-text>
          <div class="text-caption text-center mb-4">Orden OC-{{ selectedOrder?.id }}</div>
          <v-text-field 
            v-model.number="weighingValue" 
            :label="weighingType === 'INITIAL' ? 'Tara (kg)' : 'Peso Total (kg)'" 
            type="number" 
            variant="outlined" 
            autofocus
            class="text-h5"
          ></v-text-field>
          <v-btn block color="primary" size="large" @click="submitWeighing" :loading="processingWeighing">
            Confirmar Pesaje
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showReconciliation" width="600">
      <v-card class="pa-6 rounded-xl">
        <div class="d-flex justify-space-between mb-4">
          <div class="text-h5 font-weight-bold text-success">Conciliación Final</div>
          <v-btn icon variant="text" @click="showReconciliation = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-table density="comfortable">
          <tbody>
            <tr><td class="text-grey">Orden</td><td class="font-weight-bold text-right">{{ reconciliationData?.numeroOrden }}</td></tr>
            <tr><td class="text-grey">Producto</td><td class="font-weight-bold text-right">{{ reconciliationData?.producto }}</td></tr>
            <tr class="bg-grey-lighten-4"><td class="font-weight-bold">Pesaje Inicial (Tara)</td><td class="text-right">{{ formatKg(reconciliationData?.pesajeInicial || 0) }}</td></tr>
            <tr class="bg-grey-lighten-4"><td class="font-weight-bold">Pesaje Final</td><td class="text-right">{{ formatKg(reconciliationData?.pesajeFinal || 0) }}</td></tr>
            <tr><td class="font-weight-bold text-primary">Neto por Balanza</td><td class="text-right font-weight-bold text-primary">{{ formatKg(reconciliationData?.netoPorBalanza || 0) }}</td></tr>
            <tr><td class="text-grey">Producto Cargado (Caudalímetro)</td><td class="text-right">{{ formatKg(reconciliationData?.masaAcumulada || 0) }}</td></tr>
            <tr>
              <td class="font-weight-bold">Diferencia</td>
              <td class="text-right font-weight-bold" :class="(reconciliationData?.diferenciaBalanzaCaudalimetro || 0) >= 0 ? 'text-success' : 'text-error'">
                {{ formatKg(reconciliationData?.diferenciaBalanzaCaudalimetro || 0) }}
              </td>
            </tr>
             <tr><td class="text-grey">Promedio Temp</td><td class="text-right">{{ formatTemp(reconciliationData?.promedioTemperatura || 0) }}</td></tr>
             <tr><td class="text-grey">Promedio Densidad</td><td class="text-right">{{ (reconciliationData?.promedioDensidad || 0).toFixed(3) }}</td></tr>
          </tbody>
        </v-table>
      </v-card>
    </v-dialog>

  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import axios from "axios"
import AppLayout from "../components/AppLayout.vue"

// --- CONFIGURACIÓN API ---
const api = axios.create({ baseURL: 'http://localhost:8080/api/v1' })
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- ESTADO ---
const orders = ref<any[]>([])
const loading = ref(false)
const search = ref("")
const filterStatus = ref("ALL")
const temperatureThreshold = ref(45)

// Variables para Modales
const showCreateModal = ref(false)
const creating = ref(false)

const showWeighingModal = ref(false)
const weighingType = ref<'INITIAL' | 'FINAL'>('INITIAL')
const weighingValue = ref<number | null>(null)
const processingWeighing = ref(false)
const selectedOrder = ref<any>(null)

const showReconciliation = ref(false)
const reconciliationData = ref<any>(null)
const loadingAlarm = ref<string | null>(null)

// --- VARIABLES FORMULARIO ---
// 1. Variable SUELTA para evitar errores con arrays vacíos
const capacidadInput = ref(30000)

// 2. Objeto base sin arrays anidados
const newOrder = ref({
  preset: 10000,
  fechaCargaPrevista: new Date().toISOString(),
  camion: { patente: '', descripcion: '' },
  chofer: { dni: '', nombre: '' },
  cliente: { razonSocial: '', contacto: 'Sin contacto' },
  producto: { nombre: 'Gas Propano' }
})

const headers = [
  { title: "ID", key: "id", align: "start" },
  { title: "Camión", key: "truck" },
  { title: "Estado", key: "status" },
  { title: "Preset", key: "preset", align: "end" },
  { title: "Carga Actual", key: "current", align: "end" },
  { title: "Temp", key: "temperature", align: "end" },
  { title: "Densidad", key: "density", align: "end" },
  { title: "ETA", key: "eta", align: "end" },
  { title: "Acciones", key: "actions", sortable: false, align: "center" },
]

// --- CARGA DE DATOS ---
const loadOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/ordenes')
    orders.value = res.data.map((o: any) => ({
      id: o.numeroOrden.toString(),
      status: o.estado.id,
      truck: o.camion ? o.camion.patente : 'S/D',
      preset: o.preset,
      current: o.masaAcumulada || 0,
      temperature: o.temperaturaPromedio || 0,
      density: o.densidadPromedio || 0,
      flow: o.caudalPromedio || 0,
      raw: o 
    }))
  } catch (e) { console.error(e) } 
  finally { loading.value = false }
}

// --- CREAR ORDEN (CORREGIDO Y ROBUSTO) ---
const createOrder = async () => {
  creating.value = true
  try {
    // 1. Armamos el objeto final mezclando el form + la variable suelta
    const ordenParaEnviar = {
      ...newOrder.value,
      camion: {
        ...newOrder.value.camion,
        cisternado: [ { capacidad: capacidadInput.value } ] // <--- ACÁ INYECTAMOS EL ARRAY
      }
    }

    // 2. Enviamos
    await api.post('/ordenes', ordenParaEnviar)
    
    showCreateModal.value = false
    await loadOrders()
    
    // 3. Reseteamos todo limpio
    newOrder.value = {
      preset: 10000,
      fechaCargaPrevista: new Date().toISOString(),
      camion: { patente: '', descripcion: '' },
      chofer: { dni: '', nombre: '' },
      cliente: { razonSocial: '', contacto: '' },
      producto: { nombre: 'Gas Propano' }
    }
    capacidadInput.value = 30000 // Reset de la variable suelta

  } catch (e) { alert("Error al crear orden. Verificá los datos.") } 
  finally { creating.value = false }
}

// --- FLUJO DE ESTADOS (STATE MACHINE) ---

// Paso 1 -> 2
const openWeighingModal = (item: any, type: 'INITIAL' | 'FINAL') => {
  selectedOrder.value = item
  weighingType.value = type
  weighingValue.value = null
  showWeighingModal.value = true
}

const submitWeighing = async () => {
  if (!weighingValue.value || !selectedOrder.value) return
  processingWeighing.value = true
  try {
    if (weighingType.value === 'INITIAL') {
      await api.put(`/ordenes/${selectedOrder.value.id}/tara`, null, { params: { tara: weighingValue.value } })
    } else {
      await api.put(`/ordenes/${selectedOrder.value.id}/final-weighing`, null, { params: { pesajeFinal: weighingValue.value } })
    }
    showWeighingModal.value = false
    await loadOrders()
  } catch (e) { alert("Error al registrar pesaje") }
  finally { processingWeighing.value = false }
}

// Paso 2 -> 3
const closeOrder = async (item: any) => {
  if (!confirm(`¿Seguro que querés cerrar la carga de la orden ${item.id}?`)) return
  try {
    await api.put(`/ordenes/${item.id}/close`)
    await loadOrders()
  } catch (e) { alert("Error al cerrar orden") }
}

// Paso 4
const openReconciliation = async (item: any) => {
  try {
    const res = await api.get(`/ordenes/${item.id}/conciliacion`)
    reconciliationData.value = res.data
    showReconciliation.value = true
  } catch (e) { alert("No se pudo obtener la conciliación") }
}

// --- ALARMAS ---
const activeAlarms = computed(() => 
  orders.value.filter(o => o.temperature > temperatureThreshold.value && o.status === 2)
)

const acknowledgeAlarm = async (orderId: string) => {
  loadingAlarm.value = orderId
  try {
    await api.put(`/ordenes/${orderId}/aceptar-alarma`)
    await loadOrders() 
  } catch (e) { alert("Error al reconocer alarma") } 
  finally { loadingAlarm.value = null }
}

// --- HELPERS UI ---
const filteredOrders = computed(() => 
  orders.value.filter(o => {
    const matchesStatus = filterStatus.value === "ALL" || o.status.toString() === filterStatus.value
    const matchesSearch = o.id.includes(search.value) || o.truck.toLowerCase().includes(search.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
)

const calculateETA = (o: any) => {
  if(!o.flow || o.flow <= 0) return "-"
  const remaining = o.preset - o.current
  const minutes = remaining / o.flow
  return minutes.toFixed(0) + " min"
}

const statusText = (s: number) => {
    switch(s) {
        case 1: return "Pendiente Pesaje";
        case 2: return "Cargando";
        case 3: return "Cerrada";
        case 4: return "Finalizada";
        default: return "Desconocido";
    }
}
const statusColor = (s: number) => s === 1 ? "warning" : s === 2 ? "info" : s === 3 ? "grey" : "success"
const formatKg = (v: number) => v.toLocaleString("es-AR") + " kg"
const formatTemp = (v: number) => v.toFixed(1) + " °C"

onMounted(() => loadOrders())
</script>

<style scoped>
.blinking {
  animation: blinker 1s linear infinite;
}
@keyframes blinker {
  50% { opacity: 0; }
}
</style>