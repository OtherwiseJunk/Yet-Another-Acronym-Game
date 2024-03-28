<template>
    <div class="message-container" @mouseenter="hovered" @mouseleave="hovered">
        <Avatar class="avatar" :avatarDecorationUrl="userData.decorationUrl" :avatarUrl="userData.avatarUrl"
            :shouldAnimate="shouldAnimate"></Avatar>
        <div class="content-and-username">
            <div>
                <span class="username">{{ userData.displayName }}</span> 
                <span class="timestamp">{{ `  ${new Date(time).toLocaleTimeString()}` }}</span>
            </div>
            <div class="message">
                {{ content }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Avatar from './Avatar.vue'
import { MessageUserData } from '../models/userData';
const props = defineProps<{
    content: string,
    time: number,
    userData: MessageUserData
}>();
let shouldAnimate = ref(false)

function hovered() {
    shouldAnimate.value = !shouldAnimate.value;
}

console.log(props);
</script>

<style scoped>
* {
    font-family: 'Raleway';
}

.timestamp {
    font-size: small;
    color: lightgray;
}

.username {
    font-weight: 900;
}

.avatar {
    margin-top: 25px;
}

.message-container {
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
}

.content-and-username {
    display: flex;
    flex-direction: column;
    min-width: 60px;
    margin-left: 25px;
    align-items: start;
}

.message {
    width: fit-content;
    text-align: left;
}
</style>