import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDiscordStore } from "./discordStore";

let discordUserData: any = undefined;

const mockDiscordSdk = {
  instanceId: 'test-instance-id',
  guildId: 'test-guild-id',
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
});