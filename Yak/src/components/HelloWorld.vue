<script setup lang="ts">
import { DiscordSDK } from '@discord/embedded-app-sdk';
import { Channel, createConsumer } from '@rails/actioncable';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { Message } from '../models/message'
import MessageComponent from './MessageComponent.vue';

defineProps<{ msg: string }>()

// Will eventually store the authenticated user's access_token
let auth: any;
let accessToken: string;
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

let message = ref("");
let messages: Ref<Message[]> = ref([])
let instanceChat: Channel

setupDiscordSdk().then(async() => {
  console.log("Discord SDK is authenticated");

  // We can now make API calls within the scopes we requested in setupDiscordSDK()
  // Note: the access_token returned is a sensitive secret and should be treated as such
  if(accessToken){
    appendVoiceChannelName()
    connectToCable();
  }
  else{
    unauthenticatedUser();
  }
});

function unauthenticatedUser(){
  // Update the UI with a message telling the user they're A CRIMINAL
  const app = document.querySelector('#app');
  const textTag = document.createElement('p');
  textTag.innerHTML = 'You\'re UNAUTHORIZED. Police will be dispatched to your area shortly.';
  app?.appendChild(textTag);
}

async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  // Authorize with Discord Client
  const { code } = await requestAuthorizationCode();

  // Retrieve an access_token from your activity's server
  const response = await requestTokenExchange(code);
  accessToken = (await response.json()).access_token;

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token: accessToken,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }
}

async function requestAuthorizationCode(){
  return discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
    ],
  });
}

async function requestTokenExchange(code: string){
  return fetch("/api/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
}

async function appendVoiceChannelName() {
  const app = document.querySelector('#app');

  let activityChannelName = 'Unknown';

  // Requesting the channel in GDMs (when the guild ID is null) requires
  // the dm_channels.read scope which requires Discord approval.
  if (discordSdk.channelId != null && discordSdk.guildId != null) {
    // Over RPC collect info about the channel
    const channel = await discordSdk.commands.getChannel({channel_id: discordSdk.channelId});
    if (channel.name != null) {
      activityChannelName = channel.name;
    }
  }

  if(auth.user.id === "94545463906144256"){
    activityChannelName += "<br>Oh. It's you. ಠ_ಠ"
  }
  if(auth.user.id === "151162710757867521"){
    activityChannelName += "<br>Oh shit, it's Reddy!"
  }

  // Update the UI with the name of the current voice channel
  const textTagString = `Activity Channel: ${activityChannelName}`;
  const textTag = document.createElement('p');
  textTag.innerHTML = textTagString;
  app?.appendChild(textTag);
}

function connectToCable(){
  let consumer = createConsumer(`/api/cable?token=${accessToken}`);
  consumer.connect();
  instanceChat = consumer.subscriptions.create({ channel: "ChatChannel", instance: discordSdk.instanceId, discordUserId: auth.user.id },
  {
    received(data){
      messages.value.push(data as Message);
    }
  })
}

function sendMessage(){
  instanceChat.send(new Message(auth.user.username, message.value, Date.now()));
  message.value = "";
}


</script>

<template>
  <div class="chat-box">
    <div v-for="msg in messages">
      <MessageComponent :content="msg.content" :author="msg.author" :time="msg.timestamp"/>
    </div>
  </div>
  <div class="chat-inputs">
    <input id="message-input" type="text" placeholder="Enter a message!" v-model="message"/>
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<style scoped>
  .chat-box{
    height: 250px;
    width: 700px;
    outline: 2px black solid;
  }
</style>
