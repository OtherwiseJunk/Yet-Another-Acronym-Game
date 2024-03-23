<template>
    <div class="message-container">
        <p class="message-content">{{ content }}</p>
        <p class="message-metadata">{{ author }} - {{ new Date(time * 1000).toLocaleTimeString() }}</p>
    </div>
</template>

<script setup lang="ts">
    defineProps(['isMe','content','author', 'time'])
</script>

<style scoped>
    .message-container{
        padding: 10px;
        margin: 5px;
        background-color: #a0e;
        color: white;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        width: fit-content;
    }
    .message-content{
        font-size: 14px;
        margin: 0;
    }
    .message-metadata{
        font-size: 10px;
        margin: 0;
        color: #ccc;
    }
</style>