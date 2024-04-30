import { Channel, createConsumer } from "@rails/actioncable";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useDiscordStore } from "./discordStore";
import { GameState, StartGameCommand, SubmitAnswerCommand, UserSubmission } from "../models";

export const useGameStore = defineStore("gameCable", () => {
  let instanceGame = ref<Channel>();
  let gameState = ref(
    new GameState(0, 1, "", new Map<number, number>(), [], 0, new Map<number, UserSubmission>())
  );
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
          gameState.value = data as GameState;
        },
      }
    );
  }

  function startGame() {
    instanceGame.value!.send(new StartGameCommand());
  }

  function submitAnswer(answer: string){
    instanceGame.value!.send(new SubmitAnswerCommand(new UserSubmission(answer, 0, discord.currentUserData)))
  }

  return { setup, gameState, startGame, submitAnswer };
});
