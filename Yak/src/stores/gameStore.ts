import { Channel, createConsumer } from "@rails/actioncable";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useDiscordStore } from "./discordStore";
import { Message } from "../models/message";

export const useGameStore = defineStore("gameCable", () => {
  let instanceGame = ref<Channel>();
  const discord = useDiscordStore();

  function setup() {
    console.log("Attempting to setup cable");
    connectToCable();
  }
  function connectToCable() {
    console.log("Connect to cable called");
    console.log(`Discord Instance ID: ${discord.instanceId}`);
    let consumer = createConsumer(
      `/api/cable?token=${discord.auth.access_token}`
    );
    consumer.connect();
    instanceGame.value = consumer.subscriptions.create(
      {
        channel: "GameChannel",
        instance: discord.instanceId,
        discordUserId: discord.auth.user.id,
      },
      {
        received(data: any) { 
            console.log(data)
        },
      }
    );
  }

  function sendMessage(message: string) {
    instanceGame.value!.send(
      new Message(message, Date.now(), discord.currentUserData)
    );
  }

  return { setup, sendMessage };
});
