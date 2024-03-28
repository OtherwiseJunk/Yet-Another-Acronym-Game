<script setup lang="ts">
import MessageComponent from './MessageComponent.vue';
import MessageInput from './MessageInput.vue';
import { useChatStore } from '../stores/cableStore';
import { watch } from 'vue';
import { useDiscordStore } from '../stores/discordStore';
import { Message } from '../models/message';

const chat = useChatStore();
const discord = useDiscordStore();
const incomingMessage = new Audio('/assets/incoming_message.mp3');

chat.$subscribe((mutation: any, _) =>{
  const newMessage = mutation.events.newValue;
  if(!newMessage){
    return;
  }
  
  scrollToBottom();
  if (newMessage.userData.displayName !== discord.auth.user.username) {
    incomingMessage.play()
  }
})

function scrollToBottom() {
  setTimeout(() => {
    var chatWindow = document.getElementById("chat-box");
    chatWindow!.scrollTop = chatWindow!.scrollHeight;
  }, 50);
}
</script>

<template>
  <div id="chat-box" class="chat-box">
    <div v-for="msg in chat.messages">
      <MessageComponent class="message" :content="msg.content" :time="msg.timestamp" :userData="msg.userData" />
    </div>
  </div>
  <MessageInput></MessageInput>
</template>

<style scoped>
.message {
  padding: 10px 10px;
  width: 100%;
}

.chat-box {
  height: 250px;
  width: 700px;
  outline: 2px black solid;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}
</style>
