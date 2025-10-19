import { Channel, createConsumer } from "@rails/actioncable";
import { defineStore } from "pinia";
import { ref } from "vue";
import { GameState, StartGameCommand, SubmitAnswerCommand, UserData, UserSubmission } from "../models";

export const useGameStore = defineStore("gameCable", () => {
  const instanceGame = ref<Channel>();
  const gameState = ref(
    new GameState(0, 1, "", new Map<number, number>(), [], 0, new Map<number, UserSubmission>())
  );
  let accessToken: string;
  let instanceId: string;
  let currentUserData: UserData;
  let currentUserId: number;

  function setup(token: string, instance: string, userData: UserData, userId: number) {
    console.log("Attempting to setup cable");
    accessToken = token;
    instanceId = instance;
    currentUserData = userData;
    currentUserId = userId;
    connectToCable();
  }
  function connectToCable() {
    console.log("Connect to cable called");
    console.log(`Discord Instance ID: ${instanceId}`);
    const consumer = createConsumer(
      `/.proxy/api/cable?token=${accessToken}`
    );
    consumer.connect();
    instanceGame.value = consumer.subscriptions.create(
      {
        channel: "GameChannel",
        instance: instanceId,
        discordUserId: currentUserId,
      },
      {
        received(data: GameState) {
          gameState.value = data;
        },
      }
    );
  }

  function startGame() {
    instanceGame.value!.send(new StartGameCommand());
  }

  function submitAnswer(answer: string) {
    instanceGame.value!.send(new SubmitAnswerCommand(new UserSubmission(answer, 0, currentUserData)))
  }

  return { setup, gameState, startGame, submitAnswer };
});
