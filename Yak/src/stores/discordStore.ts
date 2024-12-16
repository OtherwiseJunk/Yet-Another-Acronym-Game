import { defineStore } from "pinia";
import { ref } from "vue";
import { UserData } from "../models";
import { DiscordSDK } from "@discord/embedded-app-sdk";

export const useDiscordStore = defineStore("discord", () => {
  let auth = ref<any>(undefined);
  let currentUserData = ref(new UserData("", "", ""));
  let instanceId = ref("");
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
  const defaultImage =
    "https://1219391019515121716.discordsays.com/media/yak.png";

  async function setup() {
    await setupDiscordSdk();
    console.log("Discord SDK is authenticated");
    // We can now make API calls within the scopes we requested in setupDiscordSDK()
    // Note: the access_token returned is a sensitive secret and should be treated as such
    currentUserData.value = await getUserInformation(auth.value.user.id);
    instanceId.value = discordSdk.instanceId;
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

  async function fetchDiscordResource(resource: string): Promise<any> {
    let resp = await fetch(resource, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.value.access_token}`,
      },
    });
    return resp.json();
  }

  async function getUserInformation(userId: string): Promise<UserData> {
    let participants = (
      await discordSdk.commands.getInstanceConnectedParticipants()
    ).participants;
    let user = participants.find((user) => user.id === userId);
    let userData = new UserData(defaultImage, "", "Unknown User");

    if (user == undefined || user == null) {
      return userData;
    }

    let extension = user.avatar?.startsWith("a_") ? "gif" : "webp";

    let guildUser = await fetchDiscordResource( userId === auth.value.user.id ? `https://discord.com/api/users/@me/guilds/${discordSdk.guildId}/member` :
      `https://discord.com/api/guilds/${discordSdk.guildId}/members/${userId}`
    );
    // Retrieve the guild-specific avatar, and fallback to the user's avatar
    if (guildUser?.avatar) {
      userData.avatarUrl = `https://cdn.discordapp.com/guilds/${discordSdk.guildId}/users/${user.id}/avatars/${guildUser.avatar}.${extension}?size=256`;
    } else if (user.avatar) {
      userData.avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
    } else {
      const defaultAvatarIndex = Math.abs(Number(user.id) >> 22) % 6;
      userData.avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.${extension}`;
    }

    if (guildUser?.user.avatar_decoration_data) {
      userData.decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${guildUser.user.avatar_decoration_data.asset}.png?size=256`;
    }

    // Retrieve the guild-specific nickname, and fallback to the username#discriminator
    userData.displayName =
      guildUser?.nick ??
      user.global_name ??
      `${user.username}#${user.discriminator}`;

    return userData;
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
    return fetch("/.proxy/api/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });
  }

  return { auth, setup, currentUserData, instanceId, getUserInformation };
});
