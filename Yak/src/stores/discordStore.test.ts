import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiscordStore } from "./discordStore";

let discordUserData: any = undefined;
let mockDiscordSdk: any = undefined;
const nonAuthDisplayName = 'nonAuthUser';
const nonAuthAvatar = null;
const nonAuthId = 'non-auth-user-id';
const guildId = 'test-guild-id';

// 2. Mock the entire module, making the DiscordSDK export a mock constructor
vi.mock('@discord/embedded-app-sdk', () => ({
  DiscordSDK: vi.fn().mockImplementation(() => mockDiscordSdk),
}));

// 3. Mock global fetch
vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => {
  if (url.includes('/api/tokens')) {
    return Promise.resolve({ json: () => Promise.resolve({ access_token: 'test-access-token' }) });
  }
  if (url.includes('/api/users/@me')) {
    return Promise.resolve({ json: () => Promise.resolve(discordUserData) });
  }
  if (url.includes(`/api/guilds/${guildId}/members/${nonAuthId}`)) {
    return Promise.resolve({ json: () => Promise.resolve(discordUserData) });
  }
  return Promise.resolve({ json: () => Promise.resolve({}) });
}));

describe('discordStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    discordUserData = {
      nick: 'Mocked Nickname',
      avartar: 'guildAvatarUrl',
      user: { avatar_decoration_data: { asset: 'decorationAsset' } }
    }
    vi.clearAllMocks();
    mockDiscordSdk = {
      instanceId: 'test-instance-id',
      guildId: guildId,
      commands: {
        authenticate: vi.fn().mockResolvedValue({ access_token: 'test-access-token', user: { id: 'test-user-id' } }),
        getInstanceConnectedParticipants: vi.fn().mockResolvedValue({
          participants: [
            { id: 'test-user-id', avatar: 'avatarUrl', username: 'mockedUser', global_name: 'Mocked User' },
          ]
        }),
        authorize: vi.fn().mockResolvedValue({ code: 'auth-code' }),
      },
      ready: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should initialize with default values', () => {
    const store = useDiscordStore();
    expect(store.instanceId).toBe("");
    expect(store.auth).toBe(undefined);
    expect(store.currentUserData.avatarUrl).toBe("");
    expect(store.currentUserData.decorationUrl).toBe("");
    expect(store.currentUserData.displayName).toBe("");
  });

  it('should set auth, currentUserData, and instanceId when setup is called', async () => {
    const store = useDiscordStore();
    await store.setup();

    expect(store.instanceId).toBe("test-instance-id");
    expect(store.auth).toBeDefined();
    expect(store.auth?.access_token).toBe("test-access-token");
    expect(store.currentUserData.displayName).toBe("Mocked Nickname");
    expect(store.currentUserData.avatarUrl).toContain(`https://cdn.discordapp.com/avatars/test-user-id/avatarUrl.webp?size=256`);
  });

  it('should use .gif for animated avatars', async () => {
    discordUserData = {
      nick: 'Mocked Nickname',
      avartar: 'a_guildAvatarUrl',
      user: { avatar_decoration_data: { asset: 'decorationAsset' } }
    }
    const store = useDiscordStore();
    mockDiscordSdk.commands.getInstanceConnectedParticipants.mockResolvedValueOnce({
      participants: [
        { id: 'test-user-id', avatar: 'a_avatarUrl', username: 'mockedUser', global_name: 'Mocked User' },
      ]
    });
    await store.setup();
    expect(store.currentUserData.avatarUrl).toContain(`https://cdn.discordapp.com/avatars/test-user-id/a_avatarUrl.gif?size=256`);
  });

  it('should fail if auth is null', async () => {
    const store = useDiscordStore();
    mockDiscordSdk.commands.authenticate.mockResolvedValueOnce(null);
    await expect(store.setup()).rejects.toThrow("Error during Discord SDK setup; Authenticate command failed");
  });

  describe('getUserInformation', () => {
    it('should return default user data for unknown user', async () => {
      const store = useDiscordStore();
      await store.setup();
      const userData = await store.getUserInformation('unknown-user-id');
      expect(userData.displayName).toBe('Unknown User');
      expect(userData.avatarUrl).toBe("https://1219391019515121716.discordsays.com/media/yak.png");
    });

    it('should return correct user data for known user', async () => {
      const store = useDiscordStore();
      await store.setup();
      const userData = await store.getUserInformation('test-user-id');
      expect(userData.displayName).toBe('Mocked Nickname');
      expect(userData.avatarUrl).toContain(`https://cdn.discordapp.com/avatars/test-user-id/avatarUrl.webp?size=256`);
      expect(userData.decorationUrl).toBe('https://cdn.discordapp.com/avatar-decoration-presets/decorationAsset.png?size=256');
    });

    it('should handle users without avatars', async () => {
      const store = useDiscordStore();
      const displayName = 'noAvatarUser';
      const avatar = null;
      const id = 'no-avatar-user-id';

      mockDiscordSdk.commands.getInstanceConnectedParticipants.mockResolvedValue({
        participants: [
          { id: id, avatar: avatar, displayName: displayName },
        ]
      });
      store.auth = {
        user: { id: id },
      };
      discordUserData = {
        nick: displayName,
        avartar: avatar,
        user: {}
      }

      const userData = await store.getUserInformation(id);

      expect(userData.displayName).toBe(displayName);
      expect(userData.avatarUrl).toBe('https://cdn.discordapp.com/embed/avatars/0.webp');
    });

    it('should correctly get guild member data for non-auth user', async () => {
      const store = useDiscordStore();
      const authDisplayName = 'authUser';
      const authAvatar = null;
      const authId = 'auth-user-id';

      mockDiscordSdk.commands.getInstanceConnectedParticipants.mockResolvedValue({
        participants: [
          { id: authId, avatar: authAvatar, displayName: authDisplayName },
          { id: nonAuthId, avatar: nonAuthAvatar, displayName: nonAuthDisplayName },
        ]
      });
      store.auth = {
        user: { id: authId },
      };
      discordUserData = {
        nick: nonAuthAvatar,
        avartar: nonAuthAvatar,
        user: {}
      }

      const userData = await store.getUserInformation(nonAuthId);

      expect(userData.displayName).toBe(nonAuthDisplayName);
      expect(userData.avatarUrl).toBe('https://cdn.discordapp.com/embed/avatars/0.webp');
    });
  });
});
