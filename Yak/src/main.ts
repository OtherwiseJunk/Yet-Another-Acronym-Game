import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useDiscordStore } from './stores/discordStore'
import { useChatStore } from './stores/chatStore'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia);
app.mount('#app');

const discord = useDiscordStore();
const cable = useChatStore();
await discord.setup();
await cable.setup();