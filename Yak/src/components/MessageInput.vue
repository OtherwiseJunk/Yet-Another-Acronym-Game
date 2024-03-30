<template>
    <div class="chat-inputs">
        <input id="message-input" type="text" placeholder="Enter a message!" v-model="message"
            @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send Message</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../stores/chatStore';

const chat = useChatStore();

let message = ref("");

function sendMessage() {
  if (message.value) {
    chat.sendMessage(message.value);
    message.value = "";
  }
}

</script>

<style></style>../stores/chatStore