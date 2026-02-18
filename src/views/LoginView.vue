<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="420" elevation="10" class="pa-6">

      <v-card-title class="text-h5 text-center font-weight-bold">
        Sistema de Gestión de Cargas
      </v-card-title>

      <v-card-subtitle class="text-center mb-4">
        Monitoreo Industrial
      </v-card-subtitle>

      <v-card-text>
        <v-text-field
          v-model="username"
          label="Usuario"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          @keyup.enter="handleLogin"
        />

        <v-text-field
          v-model="password"
          label="Contraseña"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          @keyup.enter="handleLogin"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-3"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-btn
          block
          color="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          Ingresar
        </v-btn>
      </v-card-actions>

      <v-divider class="my-4" />

      <div class="text-caption text-grey text-center">
        Conectado a: http://localhost:8080/api/v1
      </div>

    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/api"; 

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Por favor, completa todos los campos";
    return;
  }

  errorMessage.value = "";
  loading.value = true;

  try {
    // Enviamos el objeto JSON al backend
    const response = await api.post("/login", {
      username: username.value,
      password: password.value
    });

    // Extraemos el token y el rol del objeto response.data
    const { token, role } = response.data;

    if (token) {
      // Guardamos en LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "ROLE_USER");
      localStorage.setItem("username", username.value);

      // Navegamos al dashboard
      router.push("/dashboard");
    } else {
      errorMessage.value = "No se recibió un token válido.";
    }

  } catch (error: any) {
    console.error("Error en la conexión:", error);
    if (!error.response) {
      errorMessage.value = "Servidor apagado o error de red.";
    } else if (error.response.status === 401) {
      errorMessage.value = "Usuario o contraseña incorrectos";
    } else {
      errorMessage.value = "Error: " + (error.response.data || "Desconocido");
    }
  } finally {
    loading.value = false;
  }
};
</script>