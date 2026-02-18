<template>
  <AppLayout>
    <v-container>

      <v-data-table
        :headers="headers"
        :items="alarms"
      >
        <template #item.estado="{ item }">
          <v-chip :color="item.estado === 'ACTIVA' ? 'red' : 'green'">
            {{ item.estado }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="item.estado === 'ACTIVA'"
            color="orange"
            size="small"
            @click="ackAlarm(item.id)"
          >
            Reconocer
          </v-btn>
        </template>
      </v-data-table>

    </v-container>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import api from "../api/api"
import AppLayout from "../components/AppLayout.vue"

const alarms = ref([])

const headers = [
  { title: "Orden", value: "orderId" },
  { title: "Temperatura", value: "temperatura" },
  { title: "Estado", value: "estado" },
  { title: "Fecha", value: "fecha" },
  { title: "Acciones", value: "actions" }
]

const fetchAlarms = async () => {
  const res = await api.get("/alarms")
  alarms.value = res.data
}

const ackAlarm = async (id: number) => {
  await api.put(`/alarms/${id}/ack`)
  fetchAlarms()
}

onMounted(fetchAlarms)
</script>
