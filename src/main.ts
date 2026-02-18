import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labs from "vuetify/labs/components"; // 👈 ESTA LINEA

const vuetify = createVuetify({
  components: {
    ...components,
    ...labs, // 👈 ESTA LINEA
  },
  directives,
  theme: {
    defaultTheme: "dark",
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount("#app");
