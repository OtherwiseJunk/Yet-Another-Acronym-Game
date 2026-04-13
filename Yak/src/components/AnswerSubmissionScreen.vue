<template>
  <div v-if="allowSubmission" class="submission-screen-container">
    <h1 class="font">{{ props.timeRemaining }}</h1>
    <Acronym :letterArray="letterArray" :colors="props.colorPallette"></Acronym>
    <br />
    <form @submit.prevent="submit">
      <div class="input-container">
        <input
          v-model="submission"
          class="input font fill-parent"
          type="text"
          :style="{ color: dynamicTextColor }"
        />
      </div>
      <div v-if="submission.trim().length > 0" class="word-validation">
        <span
          v-for="(result, index) in wordValidation"
          :key="index"
          class="validation-word font"
          :class="{ 'invalid-word': !result.valid }"
        >{{ result.word }}</span>
      </div>
      <div class="submit-button">
        <button type="submit" :disabled="!submittable" class="font start-btn">Submit</button>
      </div>
    </form>
  </div>
  <div v-else>
    <WaitingForOtherPlayersComponent :submissionText="submission"></WaitingForOtherPlayersComponent>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import WaitingForOtherPlayersComponent from "./WaitingForOtherPlayersComponent.vue";
import Acronym from "./Acronym.vue";
import { useDynamicTextColor } from "../composables/useDynamicTextColor";
import { Color } from "../models/color";
import { isValidWordLength } from "../constants/shortWords";
const props = defineProps({
  acronym: {
    type: String,
    required: true,
  },
  timeRemaining: {
    type: Number,
    required: true,
  },
  colorPallette: {
    type: Array as () => Color[],
    required: true,
  },
});
const emits = defineEmits({
  submit(answer: string) {
    if (answer) return true;

    return false;
  },
});

let submission = ref<string>("");
let allowSubmission = ref<boolean>(true);

const letterArray = computed(() => props.acronym.split(""));

const inputBackgroundColor = ref("rgba(255, 255, 255, 0.1)");
const dynamicTextColor = useDynamicTextColor(inputBackgroundColor);

function submit() {
  if (submittable.value) {
    emits("submit", submission.value);
    allowSubmission.value = false;
  }
}

const wordValidation = computed(() => {
  const words = submission.value.split(" ");
  const letters = props.acronym.toLowerCase().split("");

  return words.map((word, index) => {
    const lowerWord = word.toLowerCase();
    const startsCorrectly = index < letters.length && lowerWord.startsWith(letters[index]);
    const validLength = isValidWordLength(lowerWord);
    return { word, valid: startsCorrectly && validLength };
  });
});

const submittable = computed(() => {
  const words = submission.value.toLowerCase().split(" ");
  const letters = props.acronym.toLowerCase().split("");
  if (words.length != letters.length) {
    return false;
  }

  return words.every((word, index) => word.startsWith(letters[index]) && isValidWordLength(word));
});
</script>

<style scoped>
.submission-screen-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-container {
  padding: var(--space-sm);
  outline: var(--border-thick) black solid;
  width: var(--input-max-width);
  height: var(--input-height);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-solid);
  backdrop-filter: var(--glass-backdrop);
}

.font {
  font-size: var(--font-size-3xl);
  font-family: var(--font-family);
  font-weight: 800;
  font-style: normal;
}

.fill-parent {
  width: 100%;
  height: 100%;
}

.input {
  border: none;
  text-align: center;
  background: transparent;
}

input:focus {
  outline: none;
}

.word-validation {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  flex-wrap: wrap;
}

.validation-word {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.invalid-word {
  color: var(--color-danger);
  text-decoration: underline wavy var(--color-danger);
}

.submit-button {
  height: 100px;
  margin-top: var(--space-4xl);
}

.start-btn {
  background: var(--glass-bg-strong);
  border: var(--border-default) solid var(--glass-bg-heavy);
  color: var(--text-primary);
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
</style>
