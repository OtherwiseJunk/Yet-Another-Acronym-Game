export class DiscordSDK {
    instanceId = '';
    guildId = '';
    constructor(_clientId?: string) {
        // no-op
    }
    async ready() {
        return Promise.resolve();
    }
    commands = {
        authorize: async (_opts?: any) => ({ code: '' }),
        authenticate: async (_opts?: any) => ({ user: { id: 'storybook-user' }, access_token: '' }),
        getInstanceConnectedParticipants: async () => ({ participants: [] }),
    };
}

export default DiscordSDK;
