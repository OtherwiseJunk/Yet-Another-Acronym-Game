<template>
    <div class="bubbleWrapper" @mouseenter="hovered" @mouseleave="hovered">
        <div class="inlineContainer" >
            <Avatar class="avatar" :avatarDecorationUrl="avatarDecorationUrl" :avatarUrl="avatarUrl" :shouldAnimate="shouldAnimate"></Avatar>
            <div class="content-and-username">
                <div>
                    <span class="username">{{ author }}</span> <span class="timestamp">{{ new Date(time).toLocaleTimeString() }}</span>
                </div>
                <div class="bubble">
                    {{ content }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Avatar from './Avatar.vue'
const props = defineProps(['content', 'author', 'time', 'avatarUrl', 'avatarDecorationUrl']);
let shouldAnimate = ref(false)

function hovered(){
    shouldAnimate.value = !shouldAnimate.value;
}

console.log(props);
</script>

<style scoped>
* {
    font-family: 'Raleway';
}

.timestamp{
    font-size: small;
    color: lightgray;
}

.username{
    font-weight: 900;
}

.avatar{
    margin-top: 20px;
}

.bubbleWrapper {
    padding: 10px 10px;
    color: #fff;
}

.content-and-username{
    display: flex;
    flex-direction: column;
    min-width: 60px;
    margin-left: 25px;
    align-items: start;
    
}

.inlineContainer {
    display: flex;
    flex-direction: row;
    
}

.bubble {
    width: fit-content;
    text-align: left;
}
</style>