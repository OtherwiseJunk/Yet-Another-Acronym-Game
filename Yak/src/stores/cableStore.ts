import { Channel, createConsumer } from '@rails/actioncable';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDiscordStore } from './discordStore';
import { Message } from '../models/message';

export const useChatStore = defineStore('cable', () =>{
    let instanceChat = ref<Channel>();
    const discord = useDiscordStore();
    let messages= ref<Message[]>([])

    function setup(){
        console.log('Attempting to setup cable');
        connectToCable();
    }
    function connectToCable() {
        console.log('Connect to cable called');
        let consumer = createConsumer(`/api/cable?token=${discord.auth.access_token}`);
        consumer.connect();
        instanceChat.value = consumer.subscriptions.create({ channel: "ChatChannel", instance: discord.instanceId, discordUserId: discord.auth.user.id },
          {
            received(data) {
              let msg = (data as Message);
              messages.value.push(msg);
            }
          })
    }

    function sendMessage(message: string){
        instanceChat.value!.send(new Message(message, Date.now(), discord.currentUserData));
    }

    return { setup, messages, sendMessage}
})