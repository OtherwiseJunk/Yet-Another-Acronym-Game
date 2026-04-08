import { describe, it, expect, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Avatar from './Avatar.vue';

describe('Avatar', () => {
    describe('rendering', () => {
        it('should render the avatar icon image', () => {
            const wrapper = shallowMount(Avatar, {
                props: { avatarUrl: 'https://example.com/avatar.webp', shouldAnimate: false },
            });

            const icon = wrapper.find('.avatar-icon');
            expect(icon.exists()).toBe(true);
        });

        it('should show decoration image when avatarDecorationUrl is provided', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.webp',
                    avatarDecorationUrl: 'https://example.com/decoration.png',
                    shouldAnimate: false,
                },
            });

            const decoration = wrapper.find('.avatar-decoration');
            expect(decoration.exists()).toBe(true);
        });

        it('should not show decoration image when avatarDecorationUrl is not provided', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.webp',
                    shouldAnimate: false,
                },
            });

            const decoration = wrapper.find('.avatar-decoration');
            expect(decoration.exists()).toBe(false);
        });

        it('should use the default yak image when avatarUrl is not provided', () => {
            const wrapper = shallowMount(Avatar, {
                props: { shouldAnimate: false },
            });

            const icon = wrapper.find('.avatar-icon');
            expect(icon.attributes('src')).toContain('yak.png');
        });
    });

    describe('animation toggling', () => {
        it('should use non-animated avatar URL when shouldAnimate is false', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.gif',
                    shouldAnimate: false,
                },
            });

            const icon = wrapper.find('.avatar-icon');
            expect(icon.attributes('src')).toContain('.webp');
            expect(icon.attributes('src')).not.toContain('.gif');
        });

        it('should use animated avatar URL when shouldAnimate is true', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.gif',
                    shouldAnimate: true,
                },
            });

            const icon = wrapper.find('.avatar-icon');
            expect(icon.attributes('src')).toContain('.gif');
        });

        it('should append passthrough=false to decoration URL when not animating', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.webp',
                    avatarDecorationUrl: 'https://example.com/decoration.png?size=256',
                    shouldAnimate: false,
                },
            });

            const decoration = wrapper.find('.avatar-decoration');
            expect(decoration.attributes('src')).toContain('passthrough=false');
        });

        it('should not append passthrough to decoration URL when animating', () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.webp',
                    avatarDecorationUrl: 'https://example.com/decoration.png?size=256',
                    shouldAnimate: true,
                },
            });

            const decoration = wrapper.find('.avatar-decoration');
            expect(decoration.attributes('src')).not.toContain('passthrough');
        });

        it('should react to shouldAnimate prop changes', async () => {
            const wrapper = shallowMount(Avatar, {
                props: {
                    avatarUrl: 'https://example.com/avatar.gif',
                    shouldAnimate: false,
                },
            });

            expect(wrapper.find('.avatar-icon').attributes('src')).toContain('.webp');

            await wrapper.setProps({ shouldAnimate: true });

            expect(wrapper.find('.avatar-icon').attributes('src')).toContain('.gif');
        });
    });

    describe('size prop', () => {
        it('should default size to 40', () => {
            const wrapper = shallowMount(Avatar, {
                props: { shouldAnimate: false },
            });

            const container = wrapper.find('.avatar-container');
            expect(container.attributes('style')).toContain('48px'); // 40 * 1.2 = 48
        });

        it('should apply custom size', () => {
            const wrapper = shallowMount(Avatar, {
                props: { shouldAnimate: false, size: 80 },
            });

            const container = wrapper.find('.avatar-container');
            expect(container.attributes('style')).toContain('80px');
            expect(container.attributes('style')).toContain('96px'); // 80 * 1.2 = 96
        });
    });
});
