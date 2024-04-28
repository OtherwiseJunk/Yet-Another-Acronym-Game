<template>
    <Acronym :letterArray="letterArray" :colors="colors.acronymPallette"></Acronym>
    <br>
    <div class="input">
        <AnimatedTypingComponent v-if="displayInputAutomation" :text="fullText"></AnimatedTypingComponent>
    </div>
    <div class="start-button">
        <button v-if="displayStartButton" @click="clickStart()" class="font">Start</button>
    </div>
</template>

<style scoped>
.input {
    padding: 10px;
    outline: 3px black solid;
    width: 700px;
    height: 50px;
    border-radius: 35px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: saturate(150%) blur(10px);
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