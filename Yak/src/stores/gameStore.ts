import { Channel, createConsumer } from "@rails/actioncable";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  GameState,
  StartGameCommand,
  SubmitAnswerCommand,
  SubmitVoteCommand,
  UserData,
  UserSubmission,
} from "../models";

export const useGameStore = defineStore("gameCable", () => {
  const instanceGame = ref<Channel>();
  const gameState = ref(
    new GameState(0, 1, "", new Map<number, number>(), [], 0, new Map<number, UserSubmission>()),
  );
  const accessToken = ref<string>();
  const instanceId = ref<string>();
  const currentUserData = ref<UserData>();
  const currentUserId = ref<number>();

  function setup(token: string, instance: string, userData: UserData, userId: number) {
    console.log("Attempting to setup cable");
    accessToken.value = token;
    instanceId.value = instance;
    currentUserData.value = userData;
    currentUserId.value = userId;
    connectToCable();
  }
  function connectToCable() {
    console.log("Connect to cable called");
    console.log(`Discord Instance ID: ${instanceId.value}`);
    const consumer = createConsumer(`/.proxy/api/cable?token=${accessToken.value}`);
    consumer.connect();
    instanceGame.value = consumer.subscriptions.create(
      {
        channel: "GameChannel",
        instance: instanceId.value,
        discordUserId: currentUserId.value,
      },
      {
        received(data: GameState) {
          gameState.value = data;
        },
      },
    );
  }

  function startGame() {
    if (!instanceGame.value) {
      console.error("Game channel not connected");
      return;
    }

    instanceGame.value.send(new StartGameCommand());
  }

  function submitAnswer(answer: string) {
    if (!instanceGame.value) {
      console.error("Game channel not connected");
      return;
    }

    instanceGame.value.send(
      new SubmitAnswerCommand(new UserSubmission(answer, 0, currentUserData.value)),
    );
  }

  function submitVote(votedForUserId: string) {
    if (!instanceGame.value) {
      console.error("Game channel not connected");
      return;
    }

    instanceGame.value.send(new SubmitVoteCommand(votedForUserId));
  }

  return { setup, gameState, startGame, submitAnswer, submitVote };
});
