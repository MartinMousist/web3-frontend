<template>
  <AppLayout>

    <div class="mb-4">
      <div class="text-h5 font-weight-bold">
        Gestión de Usuarios
      </div>
      <div class="text-subtitle-2 text-grey">
        Administración de roles del sistema
      </div>
    </div>

    <v-card class="rounded-xl pa-4">

      <v-data-table
        :headers="headers"
        :items="users"
        item-value="id"
      >

        <!-- Rol editable -->
        <template #item.role="{ item }">
          <v-select
            v-model="item.role"
            :items="roles"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
          />
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            @click="saveRole(item)"
          >
            Guardar
          </v-btn>
        </template>

      </v-data-table>

    </v-card>

  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AppLayout from "../components/AppLayout.vue"

const roles = ["ADMIN", "OPERATOR"]

const users = ref([
  { id: 1, username: "admin", role: "ADMIN" },
  { id: 2, username: "operador1", role: "OPERATOR" },
  { id: 3, username: "operador2", role: "OPERATOR" }
])

const headers = [
  { title: "ID", key: "id" },
  { title: "Usuario", key: "username" },
  { title: "Rol", key: "role" },
  { title: "Acciones", key: "actions" }
]

const saveRole = (user: any) => {
  alert(`Rol actualizado para ${user.username}: ${user.role}`)
}
</script>
