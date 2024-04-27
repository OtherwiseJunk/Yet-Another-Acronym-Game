<template>
    <div v-if="allowSubmission" >
        <Acronym :letterArray="letterArray"></Acronym>
        <br>
        <div class="input-container">
            <input v-model="submission" class="input font fill-parent" type="text">
        </div>
        <div class="submit-button">
            <button type="submit" v-if="submittable" @click="submit()" @keyup.enter="submit" class="font">Submit</button>
        </div>
    </div>
    <div v-else>
        <WaitingForOtherPlayersComponent submissionText="submission"></WaitingForOtherPlayersComponent>
    </div>
</template>

<style scoped>
.input-container {
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

.smaller-font {
    font-size: 1.5em;
    font-family: 'Orbitron';
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
}

input:focus {
    outline: none;
}

.submit-button {
    height: 100px;
    margin-top: 40px;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Acronym from './Acronym.vue';
const props = defineProps(['acronym'])
const emits = defineEmits({
    submit(answer: string) {
        if (answer) return true;

        return false;
    }
})
let submission = ref<string>("");
let allowSubmission = ref<boolean>(true);

const letterArray = props.acronym.split('');

function submit() {
    if (submittable.value) {
        emits('submit', submission.value);
        allowSubmission.value = false;
    }
}

const submittable = computed(() => {
    const words = submission.value.toLowerCase().split(' ')
    const letters = props.acronym.toLowerCase().split('');
    if (words.length != letters.length) {
        return false;
    }

    let submittable = true;

    words.forEach((word, index) => {
        submittable = submittable && word.startsWith(letters[index]);
    });

    return submittable
})
</script>