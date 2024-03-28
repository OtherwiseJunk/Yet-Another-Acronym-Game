import { defineStore } from "pinia";
import { ref } from "vue";
import { MessageUserData } from "../models/userData";
import { DiscordSDK } from "@discord/embedded-app-sdk";

export const useDiscordStore = defineStore("discord", () => {
  let auth = ref<any>(undefined);
  let currentUserData = ref(new MessageUserData("", "", ""));
  let instanceId;
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  async function setup() {
    await setupDiscordSdk()
    console.log("Discord SDK is authenticated");
      // We can now make API calls within the scopes we requested in setupDiscordSDK()
      // Note: the access_token returned is a sensitive secret and should be treated as such
    await setUserInformation();
    instanceId = discordSdk.instanceId;
  }

  async function setupDiscordSdk() {
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    // Authorize with Discord Client
    const { code } = await requestAuthorizationCode();

    // Retrieve an access_token from your activity's server
    const response = await requestTokenExchange(code);

    // Authenticate with Discord client (using the access_token)
    auth.value = await discordSdk.commands.authenticate({
      access_token: (await response.json()).access_token,
    });

    if (auth == null) {
      throw new Error("Authenticate command failed");
    }
  }

  async function setUserInformation() {
    let user = auth.value.user;
    let extension = user.avatar.startsWith("a_") ? "gif" : "webp";

    fetch(
      `https://discord.com/api/users/@me/guilds/${discordSdk.guildId}/member`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.value.access_token}`,
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((guildsMembersRead) => {
        // Retrieve the guild-specific avatar, and fallback to the user's avatar
        if (guildsMembersRead?.avatar) {
          currentUserData.value.avatarUrl = `https://cdn.discordapp.com/guilds/${discordSdk.guildId}/users/${user.id}/avatars/${guildsMembersRead.avatar}.${extension}?size=256`;
        } else if (user.avatar) {
          currentUserData.value.avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
        } else {
          const defaultAvatarIndex = Math.abs(Number(user.id) >> 22) % 6;
          currentUserData.value.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.${extension}`;
        }

        if (guildsMembersRead?.user.avatar_decoration_data) {
          //https://cdn.discordapp.com/avatar-decoration-presets
          currentUserData.value.decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${guildsMembersRead.user.avatar_decoration_data.asset}.png?size=256`;
        }

        // Retrieve the guild-specific nickname, and fallback to the username#discriminator
        currentUserData.value.displayName =
          guildsMembersRead?.nick ??
          user.global_name ??
          `${user.username}#${user.discriminator}`;
      });
  }

  async function requestAuthorizationCode() {
    return discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "guilds.members.read"],
    });
  }

  async function requestTokenExchange(code: string) {
    return fetch("/api/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });
  }

  return {auth, setup, currentUserData, instanceId}
});
