<template>
  <Acronym :letterArray="letterArray" :colors="colors.acronymPallette"></Acronym>
  <br />
  <div class="input">
    <AnimatedTypingComponent
      v-if="displayInputAutomation"
      :text="fullText"
    ></AnimatedTypingComponent>
  </div>

  <!-- Mode selection — any player can start -->
  <div v-if="displayStartButton" class="mode-selection">
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
</template>

<style scoped>
.input {
  padding: var(--space-sm);
  outline: var(--border-thick) black solid;
  width: var(--input-max-width);
  height: var(--input-height);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-solid);
  backdrop-filter: var(--glass-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
}

.font {
  font-size: var(--font-size-3xl);
  font-family: var(--font-family);
  font-weight: 800;
  font-style: normal;
}

.mode-selection {
  margin-top: var(--space-4xl);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-buttons {
  display: flex;
  gap: var(--space-2xl);
}

.mode-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.mode-btn {
  font-size: var(--font-size-lg);
  background: var(--glass-bg-light);
  border: var(--border-default) solid var(--glass-bg-prominent);
  color: white;
  padding: var(--space-lg) var(--space-3xl);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: var(--glass-backdrop);
}

.mode-btn:hover {
  background: var(--glass-bg-prominent);
  box-shadow: var(--shadow-glow-lg) var(--glass-bg-heavy);
  transform: translateY(-2px);
}

.deadline-btn:hover {
  border-color: var(--color-danger);
  box-shadow: var(--shadow-glow-lg) var(--color-danger-glow-medium);
}

.fixed-btn:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-lg) var(--color-primary-glow-strong);
}

.mode-hint {
  font-family: var(--font-family);
  font-size: 0.7em;
  color: var(--text-faint);
  max-width: 220px;
  text-align: center;
  line-height: 1.4;
}

.round-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  margin-top: var(--space-xs);
}

.round-label {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  margin: 0;
}

.round-options {
  display: flex;
  gap: var(--space-md);
}

.round-btn {
  font-size: var(--font-size-md);
  background: var(--glass-bg-light);
  border: var(--border-default) solid var(--glass-bg-prominent);
  color: white;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-circle);
  cursor: pointer;
  transition: all 0.25s ease;
}

.round-btn:hover {
  background: var(--color-primary-glow-subtle);
  border-color: var(--color-primary);
}

.round-selected {
  background: var(--color-primary-glow-medium);
  border-color: var(--color-primary);
  box-shadow: 0 0 16px var(--color-primary-glow-intense);
}

.start-btn {
  background: var(--glass-bg-strong);
  border: var(--border-default) solid var(--glass-bg-heavy);
  color: white;
  padding: var(--space-sm) 30px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: var(--glass-backdrop);
}

.start-btn:hover {
  background: var(--glass-bg-heavy);
  box-shadow: var(--shadow-glow-md) var(--glass-bg-solid);
}

.go-btn {
  margin-top: var(--space-xs);
  font-size: var(--font-size-xl);
  padding: var(--space-md) var(--space-5xl);
}

.deadline-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  margin-top: var(--space-xs);
}

.deadline-text {
  font-size: var(--font-size-sm);
  color: var(--color-danger-text);
  margin: 0;
}

.waiting {
  margin-top: var(--space-4xl);
}

.waiting-text {
  font-size: var(--font-size-sm);
  color: var(--text-faint);
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

defineProps({});

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
