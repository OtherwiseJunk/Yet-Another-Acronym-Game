import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import TermsOfService from "./pages/TermsOfService.vue";
import PrivacyPolicy from "./pages/PrivacyPolicy.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: App },
    { path: "/terms", component: TermsOfService },
    { path: "/privacy", component: PrivacyPolicy },
  ],
});

export default router;
