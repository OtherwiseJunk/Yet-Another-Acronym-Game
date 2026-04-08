<template>
  <div v-if="allowSubmission" class="submission-screen-container">
    <h1 class="font" :style="{ color: dynamicTextColor }">{{ props.timeRemaining }}</h1>
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
import { computed, ref, toRef } from "vue";
import WaitingForOtherPlayersComponent from "./WaitingForOtherPlayersComponent.vue";
import Acronym from "./Acronym.vue";
import { useDynamicTextColor } from "../composables/useDynamicTextColor";
import { Color } from "../models/color";
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

const inputBackgroundColor = ref("rgba(255, 255, 255, 0.1)"); // The background of the input container
const dynamicTextColor = useDynamicTextColor(inputBackgroundColor);

function submit() {
  if (submittable.value) {
    emits("submit", submission.value);
    allowSubmission.value = false;
  }
}

const submittable = computed(() => {
  const words = submission.value.toLowerCase().split(" ");
  const letters = props.acronym.toLowerCase().split("");
  if (words.length != letters.length) {
    return false;
  }

  return words.every((word, index) => word.startsWith(letters[index]));
});
</script>

<style scoped>
.submission-screen-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-container {
  padding: 10px;
  outline: 3px black solid;
  width: 700px;
  height: 50px;
  border-radius: 35px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: saturate(150%) blur(10px);
}

.font {
  font-size: 2em;
  font-family: "Orbitron";
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

.submit-button {
  height: 100px;
  margin-top: 40px;
}

.start-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 30px;
  border-radius: 35px; /* Match the input box */
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: saturate(150%) blur(10px); /* Match the input box */
}

.start-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}
</style>
