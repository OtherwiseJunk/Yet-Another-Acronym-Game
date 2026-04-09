<template>
  <Acronym :letterArray="letterArray" :colors="colors.acronymPallette"></Acronym>
  <br />
  <div class="input">
    <AnimatedTypingComponent
      v-if="displayInputAutomation"
      :text="fullText"
    ></AnimatedTypingComponent>
  </div>

  <!-- Host: mode selection -->
  <div v-if="displayStartButton && props.isHost" class="mode-selection">
    <div v-if="!selectedMode" class="mode-buttons">
      <div class="mode-option" @click="selectMode('deadline')">
        <button class="font mode-btn deadline-btn">Deadline</button>
        <span class="mode-hint">Rounds continue until nobody submits an answer</span>
      </div>
      <div class="mode-option" @click="selectMode('fixed_rounds')">
        <button class="font mode-btn fixed-btn">Hard Stop</button>
        <span class="mode-hint">Play a set number of rounds, highest score wins</span>
      </div>
    </div>

    <!-- Round count picker for hard stop mode -->
    <div v-if="selectedMode === 'fixed_rounds'" class="round-picker">
      <p class="font round-label">How many rounds?</p>
      <div class="round-options">
        <button
          v-for="count in roundOptions"
          :key="count"
          class="font round-btn"
          :class="{ 'round-selected': selectedRounds === count }"
          @click="selectedRounds = count"
        >
          {{ count }}
        </button>
      </div>
      <button class="font start-btn go-btn" @click="startWithConfig()">Go</button>
    </div>

    <!-- Deadline mode: start immediately -->
    <div v-if="selectedMode === 'deadline'" class="deadline-confirm">
      <p class="font deadline-text">Last one standing wins</p>
      <button class="font start-btn go-btn" @click="startWithConfig()">Go</button>
    </div>
  </div>

  <!-- Non-host: waiting message -->
  <div v-if="displayStartButton && !props.isHost" class="waiting">
    <p class="font waiting-text">Waiting for host to pick a mode...</p>
  </div>
</template>

<style scoped>
.input {
  padding: 10px;
  outline: 3px black solid;
  width: 700px;
  height: 50px;
  border-radius: 35px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: saturate(150%) blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.font {
  font-size: 2em;
  font-family: "Orbitron";
  font-weight: 800;
  font-style: normal;
}

.mode-selection {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-buttons {
  display: flex;
  gap: 24px;
}

.mode-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mode-btn {
  font-size: 1.2em;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 16px 32px;
  border-radius: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: saturate(150%) blur(10px);
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.deadline-btn:hover {
  border-color: #ff4444;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.fixed-btn:hover {
  border-color: #44aaff;
  box-shadow: 0 0 20px rgba(68, 170, 255, 0.3);
}

.mode-hint {
  font-family: "Orbitron";
  font-size: 0.7em;
  color: rgba(255, 255, 255, 0.4);
  max-width: 220px;
  text-align: center;
  line-height: 1.4;
}

.round-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.round-label {
  font-size: 1em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.round-options {
  display: flex;
  gap: 12px;
}

.round-btn {
  font-size: 1.1em;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.round-btn:hover {
  background: rgba(68, 170, 255, 0.15);
  border-color: #44aaff;
}

.round-selected {
  background: rgba(68, 170, 255, 0.25);
  border-color: #44aaff;
  box-shadow: 0 0 16px rgba(68, 170, 255, 0.4);
}

.start-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 30px;
  border-radius: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: saturate(150%) blur(10px);
}

.start-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.go-btn {
  margin-top: 8px;
  font-size: 1.3em;
  padding: 12px 48px;
}

.deadline-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.deadline-text {
  font-size: 0.9em;
  color: rgba(255, 68, 68, 0.7);
  margin: 0;
}

.waiting {
  margin-top: 40px;
}

.waiting-text {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>

<script setup lang="ts">
const emits = defineEmits(["animation-complete", "start"]);
import Acronym from "./Acronym.vue";
import AnimatedTypingComponent from "./AnimatedTypingComponent.vue";
import { ref } from "vue";
import { usePalletteStore } from "../stores/palletteStore";

const props = defineProps({
  isHost: {
    type: Boolean,
    required: true,
  },
});

const letterArray = ["Y", "A", "A", "G"];
const fullText = "Yet Another Acronym Game";
const displayInputAutomation = ref(false);
const displayStartButton = ref(false);
const colors = usePalletteStore();
colors.setAcronymPallette("yaag");

const selectedMode = ref<string | null>(null);
const selectedRounds = ref<number>(10);
const roundOptions = [5, 10, 15, 20];

setTimeout(() => {
  displayInputAutomation.value = true;
}, 2300);

setTimeout(() => {
  emits("animation-complete");
}, 5500);

setTimeout(() => {
  displayStartButton.value = true;
}, 5700);

function selectMode(mode: string) {
  selectedMode.value = mode;
}

function startWithConfig() {
  emits("start", {
    mode: selectedMode.value,
    max_rounds: selectedMode.value === "fixed_rounds" ? selectedRounds.value : null,
  });
}
</script>
