<template>
    <div class="bubbleWrapper">
        <div class="inlineContainer">
            <div>
                <span class="username">{{ author }}</span> <span class="timestamp">{{ new Date(time).toLocaleTimeString() }}</span>
            </div>
            <div class="content-and-avatar">
                <div class="avatar-container">
                    <img v-if="avatarDecorationUrl" class="avatar-decoration avatar" :src="avatarDecorationUrl">
                    <img class="avatar-icon avatar" :src=" avatarUrl ?? 'https://1219391019515121716.discordsays.com/assets/ninja.png'">
                </div>
                <div class="bubble">
                    {{ content }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps(['content', 'author', 'time', 'avatarUrl', 'avatarDecorationUrl']);
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

.bubbleWrapper {
    padding: 10px 10px;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    align-self: flex-end;
    color: #fff;
}

.content-and-avatar{
    display: flex;
    flex-direction: row;
    min-width: 60px;
    max-width: 700px;
    align-items: center;
    justify-items: center;
}

.avatar-container{
    position: relative;
    margin-right: 25px;
}

.avatar-decoration{
    z-index: 1;
    height: 48px;
    left: -4px;
    top: -24px;
}

.inlineContainer {
    display: flex;
    flex-direction: column;
    align-items: start;
}

.avatar-icon {
    height: 40px;
    border-radius: 50%;
    z-index: -1;
    top: -20px;
    left: 0px;
}

.avatar {
    position: absolute;
    border-radius: 50%;
}

.bubble {
    padding: 15px 20px;
    margin: 6px 8px;
    border-radius: 16px;
    width: fit-content
}
</style>