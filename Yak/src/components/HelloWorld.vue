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
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
const incomingMessage = new Audio('/assets/incoming_message.mp3');
let message = ref("");
let messages: Ref<Message[]> = ref([])
let instanceChat: Channel
let userAvatarUrl: string;
let userAvatarDecorationUrl: string;
let userDisplayName: string;

setupDiscordSdk().then(async () => {
  console.log("Discord SDK is authenticated");

  // We can now make API calls within the scopes we requested in setupDiscordSDK()
  // Note: the access_token returned is a sensitive secret and should be treated as such
  if (auth.access_token) {
    appendVoiceChannelName()
    connectToCable();
    setUserInformation();
  }
  else {
    unauthenticatedUser();
  }
});

async function setUserInformation() {
  let user = auth.user;
  let extension = user.avatar.startsWith('a_') ? 'gif' : 'webp';

  fetch(`https://discord.com/api/users/@me/guilds/${discordSdk.guildId}/member`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
    },
  }).then((response) => {
      return response.json();
    })
    .then((guildsMembersRead) => {
      // Retrieve the guild-specific avatar, and fallback to the user's avatar
      if (guildsMembersRead?.avatar) {
        userAvatarUrl = `https://cdn.discordapp.com/guilds/${discordSdk.guildId}/users/${user.id}/avatars/${guildsMembersRead.avatar}.${extension}?size=256`;
      } else if (user.avatar) {
        userAvatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
      } else {
        const defaultAvatarIndex = Math.abs(Number(user.id) >> 22) % 6;
        userAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.${extension}`;
      }

      if(guildsMembersRead?.user.avatar_decoration_data){
        //https://cdn.discordapp.com/avatar-decoration-presets
        userAvatarDecorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${guildsMembersRead.user.avatar_decoration_data.asset}.png?size=256`;
      }

      // Retrieve the guild-specific nickname, and fallback to the username#discriminator
      userDisplayName = guildsMembersRead?.nick ?? (user.global_name ?? `${user.username}#${user.discriminator}`);
    });
}

function unauthenticatedUser() {
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

  // Authenticate with Discord client (using the access_token)
  auth = await discordSdk.commands.authenticate({
    access_token: (await response.json()).access_token
    ,
  });

  if (auth == null) {
    throw new Error("Authenticate command failed");
  }
}

async function requestAuthorizationCode() {
  return discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds",
      "guilds.members.read"
    ],
  });
}

async function requestTokenExchange(code: string) {
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
    const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
    if (channel.name != null) {
      activityChannelName = channel.name;
    }
  }

  if (auth.user.id === "94545463906144256") {
    activityChannelName += "<br>Oh. It's you. ಠ_ಠ"
  }
  if (auth.user.id === "151162710757867521") {
    activityChannelName += "<br>Oh shit, it's Reddy!"
  }

  // Update the UI with the name of the current voice channel
  const textTagString = `Activity Channel: ${activityChannelName}`;
  const textTag = document.createElement('p');
  textTag.innerHTML = textTagString;
  app?.appendChild(textTag);
}

function connectToCable() {
  let consumer = createConsumer(`/api/cable?token=${auth.access_token}`);
  consumer.connect();
  instanceChat = consumer.subscriptions.create({ channel: "ChatChannel", instance: discordSdk.instanceId, discordUserId: auth.user.id },
    {
      received(data) {
        let msg = (data as Message);
        messages.value.push(msg);
        scrollToBottom();
        if (msg.author !== auth.user.username) {
          incomingMessage.play()
        }
      }
    })
}

function sendMessage() {
  if (message.value) {
    instanceChat.send(new Message(userDisplayName, message.value, Date.now(), userAvatarUrl, userAvatarDecorationUrl));
    message.value = "";
  }
}

function scrollToBottom() {
  setTimeout(() => {
    var chatWindow = document.getElementById("chat-box");
    chatWindow!.scrollTop = chatWindow!.scrollHeight;
  }, 50);
}


</script>

<template>
  <div id="chat-box" class="chat-box">
    <div v-for="msg in messages">
      <MessageComponent class="message" :content="msg.content" :author="msg.author" :time="msg.timestamp" :avatarDecorationUrl="msg.avatarDecorationUrl"
        :avatarUrl="msg.avatarUrl" />
    </div>
  </div>
  <div class="chat-inputs">
    <input id="message-input" type="text" placeholder="Enter a message!" v-model="message" @keyup.enter="sendMessage" />
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<style scoped>
.message {
  padding: 10px 10px;
  display: flex;
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
