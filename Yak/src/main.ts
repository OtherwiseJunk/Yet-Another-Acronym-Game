import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useDiscordStore } from './stores/discordStore'
import { useGameStore } from './stores/gameStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia);
app.mount('#app');

const discord = useDiscordStore();
const cable = useGameStore();
await discord.setup();
await cable.setup();
