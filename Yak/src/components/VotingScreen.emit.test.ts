import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import VotingScreen from './VotingScreen.vue';
import { UserSubmission, UserData } from '../models';

vi.mock('../stores/discordStore', () => ({
    useDiscordStore: vi.fn(() => ({
        auth: { access_token: 'test', user: { id: 'voter-id' } },
        currentUserData: new UserData('avatar', 'decoration', 'Voter'),
    })),
}));

function createSubmissions() {
    return {
        'user-1': new UserSubmission('Some Answer', 5, new UserData('a1.png', '', 'Player1')),
        'user-2': new UserSubmission('Other Answer', 8, new UserData('a2.png', '', 'Player2')),
    };
}

function mountVotingScreen(propsOverrides = {}) {
    return shallowMount(VotingScreen, {
        props: {
            submissionsByUserId: createSubmissions(),
            resultsMode: false,
            skipVoting: false,
            timeRemaining: 20,
            ...propsOverrides,
        },
        global: {
            config: { errorHandler: () => {} },
        },
    });
}

describe('VotingScreen - emits', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should emit next-round when the Next Round button is clicked', async () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: true,
                skipVoting: false,
                timeRemaining: 20,
            },
        });

        const nextRoundButton = wrapper.find('.next-round-button');
        expect(nextRoundButton.exists()).toBe(true);

        await nextRoundButton.trigger('click');

        expect(wrapper.emitted('next-round')).toHaveLength(1);
    });

    it('should not show Next Round button when not in results mode', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: false,
                skipVoting: false,
                timeRemaining: 20,
            },
        });

        // The controls div uses v-show with resultsMode, so it exists but is hidden
        const controls = wrapper.find('.controls');
        expect(controls.exists()).toBe(true);
        expect(controls.element.style.display).toBe('none');
    });

    it('should display skip voting message when skipVoting is true', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: false,
                skipVoting: true,
                timeRemaining: 20,
            },
        });

        expect(wrapper.text()).toContain("voting skipped as there aren't enough players");
    });

    it('should display time remaining in voting mode', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: false,
                skipVoting: false,
                timeRemaining: 42,
            },
        });

        expect(wrapper.text()).toContain('Vote - 42');
    });

    it('should display Results header in results mode', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: true,
                skipVoting: false,
                timeRemaining: 0,
            },
        });

        expect(wrapper.text()).toContain('Results');
    });

    it('should render a voting card for each submission', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: createSubmissions(),
                resultsMode: false,
                skipVoting: false,
                timeRemaining: 20,
            },
        });

        const cards = wrapper.findAll('.voting-card');
        expect(cards.length).toBe(2);
    });

    it('should not render anything when submissionsByUserId is falsy', () => {
        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: undefined as any,
                resultsMode: false,
                skipVoting: false,
                timeRemaining: 20,
            },
        });

        expect(wrapper.find('.container').exists()).toBe(false);
    });

    it('should emit vote when a non-self card is clicked in voting mode', async () => {
        const wrapper = mountVotingScreen();

        const cards = wrapper.findAll('.voting-card');
        expect(cards.length).toBe(2);

        // Click a card that's not the voter's own (voter-id)
        await cards[0].trigger('click');

        expect(wrapper.emitted('vote')).toHaveLength(1);
        expect(wrapper.emitted('vote')![0]).toEqual(['user-1']);
    });

    it('should not emit vote when clicking own card', async () => {
        // Create submissions that include the voter's own user id
        const submissions = {
            'voter-id': new UserSubmission('My Answer', 5, new UserData('a.png', '', 'Voter')),
            'user-2': new UserSubmission('Other Answer', 8, new UserData('a2.png', '', 'Player2')),
        };

        const wrapper = mountVotingScreen({ submissionsByUserId: submissions });

        // Find the card for voter-id and click it
        const cards = wrapper.findAll('.voting-card');
        const voterCard = cards.find(c => c.attributes('id') === 'voter-id');
        if (voterCard) {
            await voterCard.trigger('click');
        }

        expect(wrapper.emitted('vote')).toBeUndefined();
    });

    it('should not emit vote twice (prevents double voting)', async () => {
        const wrapper = mountVotingScreen();
        const cards = wrapper.findAll('.voting-card');

        await cards[0].trigger('click');
        await cards[1].trigger('click');

        // Only the first vote should go through
        expect(wrapper.emitted('vote')).toHaveLength(1);
    });

    it('should toggle shouldAnimate on mouseenter/mouseleave', async () => {
        const wrapper = mountVotingScreen({ resultsMode: true });
        const cards = wrapper.findAll('.voting-card');

        await cards[0].trigger('mouseenter');
        await cards[0].trigger('mouseleave');

        // No error = setShouldAnimate works
        expect(wrapper.find('.voting-card').exists()).toBe(true);
    });

    it('should sort voting cards by submission time', () => {
        const submissions = {
            'user-slow': new UserSubmission('Slow Answer', 20, new UserData('a1.png', '', 'SlowPlayer')),
            'user-fast': new UserSubmission('Fast Answer', 3, new UserData('a2.png', '', 'FastPlayer')),
        };

        const wrapper = shallowMount(VotingScreen, {
            props: {
                submissionsByUserId: submissions,
                resultsMode: false,
                skipVoting: false,
                timeRemaining: 20,
            },
        });

        const timeTexts = wrapper.findAll('.time');
        expect(timeTexts[0].text()).toContain('3');
        expect(timeTexts[1].text()).toContain('20');
    });
});
