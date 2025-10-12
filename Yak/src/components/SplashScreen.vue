<template>
    <Acronym :letterArray="letterArray" :colors="colors.acronymPallette"></Acronym>
    <br>
    <div class="input">
        <AnimatedTypingComponent v-if="displayInputAutomation" :text="fullText"></AnimatedTypingComponent>
    </div>
    <div class="start-button">
        <button v-if="displayStartButton" @click="clickStart()" class="font start-btn">Start</button>
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
    font-family: 'Orbitron';
    font-weight: 800;
    font-style: normal;
}

.start-button {
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

<script setup lang="ts">
const emits = defineEmits(['animation-complete', 'start']);
import Acronym from './Acronym.vue';
import AnimatedTypingComponent from './AnimatedTypingComponent.vue'
import { ref } from 'vue';
import { usePalletteStore } from '../stores/palletteStore';

const letterArray = ["Y", "A", "A", "G"]
const fullText = "Yet Another Acronym Game"
const displayInputAutomation = ref(false);
const displayStartButton = ref(false);
const colors = usePalletteStore();
colors.setAcronymPallette('yaag');

setTimeout(() => {
    displayInputAutomation.value = true;
}, 2300)

setTimeout(() => {
    emits('animation-complete');
}, 5500)

setTimeout(() => {
    displayStartButton.value = true;
}, 5700)

function clickStart() {
    emits('start');
}
</script>
