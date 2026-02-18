<template>
  <AppLayout>

    <div class="d-flex justify-center">

      <v-card
        width="700"
        class="pa-6 rounded-xl"
        style="
          background: rgba(15,23,42,0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.05);
        "
      >

        <!-- Header -->
        <div class="d-flex justify-space-between align-start mb-6">

          <div>
            <div class="text-h5 font-weight-bold">
              Conciliación — OC-2026-0454
            </div>
            <div class="text-subtitle-2 text-grey">
              Resumen de carga para DEF-321
            </div>
          </div>

          <v-btn
            icon
            variant="tonal"
            color="cyan"
            @click="goBack"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>

        </div>

        <!-- GRID -->
        <v-row dense>

          <v-col cols="12" md="6">
            <InfoCard title="Preset" :value="order.preset + ' Kg'" />
          </v-col>

          <v-col cols="12" md="6">
            <InfoCard title="Carga Real" :value="order.current + ' Kg'" />
          </v-col>

          <v-col cols="12" md="6">
            <InfoCard
              title="Diferencia"
              :value="difference + ' Kg'"
              highlight="warning"
            />
          </v-col>

          <v-col cols="12" md="6">
            <InfoCard
              title="Densidad Prom."
              :value="order.density"
            />
          </v-col>

          <v-col cols="12" md="6">
            <InfoCard
              title="Producto"
              :value="order.product"
            />
          </v-col>

          <v-col cols="12" md="6">
            <InfoCard
              title="Conductor"
              :value="order.driver"
            />
          </v-col>

        </v-row>

      </v-card>

    </div>

  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import AppLayout from "../components/AppLayout.vue"
import InfoCard from "../components/InfoCard.vue"

const router = useRouter()

// MOCK DATA (luego viene del backend)
const order = {
  preset: "25.000",
  current: "24.850",
  density: "0.837",
  product: "Gasoil Grado 3",
  driver: "Luis Fernández"
}

const difference = computed(() => 150)

const goBack = () => {
  router.back()
}
</script>
