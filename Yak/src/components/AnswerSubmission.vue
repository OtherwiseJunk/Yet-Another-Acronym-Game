<template>
    <Acronym :letterArray="letterArray"></Acronym>
    <br>
    <div class="input-container">
        <input v-model="submission" class="input font fill-parent" stype="text">
    </div>
    <div class="submit-button">
        <button v-if="submitable" @click="submitButton()" class="font">Submit</button>
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

.fill-parent{
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
    submit(answer: string){
        if (answer) return true;

        return false;
    }
})
let submission = ref<string>("");

const letterArray = props.acronym.split('');

function submitButton(){
    emits('submit', 'deez');
}

const submitable  = computed(() => {
    const words = submission.value.toLowerCase().split(' ')
    const letters = props.acronym.toLowerCase().split('');
    if (words.length != letters.length){
        return false;
    }

    let submitable = true;

    words.forEach((word, index) =>{
        submitable = submitable && word.startsWith(letters[index]);
    });

    return submitable
})
</script>