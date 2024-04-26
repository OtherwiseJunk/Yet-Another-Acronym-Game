<template>
    <Acronym :letterArray="letterArray"></Acronym>
    <br>
    <div class="input-container">
        <input class="input font fill-parent" stype="text">
    </div>
    <div class="submit-button">
        <button @click="submitButton()" class="font">Submit</button>
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
import Acronym from './Acronym.vue';
const props = defineProps(['acronym'])
const emits = defineEmits({
    submit(answer: string){
        if (answer) return true;

        return false;
    }
})

const letterArray = props.acronym.split('');

function submitButton(){
    emits('submit', 'deez');
}
</script>