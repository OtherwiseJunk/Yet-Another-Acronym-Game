<template>
    <Acronym :letterArray="letterArray"></Acronym>
    <br>
    <div class="input">
        <AnimatedTypingComponent v-if="displayInput" :text="fullText"></AnimatedTypingComponent>
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
</style>

<script setup lang="ts">
import Acronym from './Acronym.vue';
import AnimatedTypingComponent from './AnimatedTypingComponent.vue'
import { ref } from 'vue';

const letterArray = ["Y", "A", "A", "G"]
const fullText = "Yet Another Acronym Game"
const displayInput = ref(false);

setTimeout(() => {
    displayInput.value = true;
}, 2500)
</script>