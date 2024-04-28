<template>
    <div v-if="allowSubmission" >
        <Acronym :letterArray="letterArray" :colors="colors.acronymPallette"></Acronym>
        <br>
        <div class="input-container">
            <input v-model="submission" class="input font fill-parent" type="text">
        </div>
        <div class="submit-button">
            <button type="submit" v-if="submittable" @click="submit()" @keyup.enter="submit" class="font">Submit</button>
        </div>
    </div>
    <div v-else>
        <WaitingForOtherPlayersComponent :submissionText="submission"></WaitingForOtherPlayersComponent>
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
import WaitingForOtherPlayersComponent from './WaitingForOtherPlayersComponent.vue'
import Acronym from './Acronym.vue';
import { usePalletteStore } from '../stores/palletteStore';
const props = defineProps(['acronym', 'colorPallette'])
const emits = defineEmits({
    submit(answer: string) {
        if (answer) return true;

        return false;
    }
})
const colors = usePalletteStore();
colors.setAcronymPallette(props.acronym);
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
</script>../stores/palletteStore