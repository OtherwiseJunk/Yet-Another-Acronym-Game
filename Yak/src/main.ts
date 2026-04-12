import { createApp } from "vue";
import "./styles/tokens.css";
import "./style.css";
import Root from "./Root.vue";
import { createPinia } from "pinia";
import router from "./router";

const pinia = createPinia();
const app = createApp(Root);

app.use(pinia);
app.use(router);
app.mount("#app");
