require 'test_helper'

class RedisGameStoreTest < ActiveSupport::TestCase
  setup do
    @instance_id = "test-instance-#{SecureRandom.hex(4)}"
    @game = GameState.new('player-1')
  end

  teardown do
    RedisGameStore.delete(@instance_id)
    RedisGameStore.delete_subscriptions(@instance_id)
  end

  test 'set and get round-trips a game state through Redis' do
    @game.start_game
    RedisGameStore.set(@instance_id, @game)

    restored = RedisGameStore.get(@instance_id)

    assert_equal @game.round_number, restored.round_number
    assert_equal @game.current_acronym, restored.current_acronym
    assert_equal @game.game_phase, restored.game_phase
    assert_equal @game.players, restored.players
    assert_equal @game.round_time_remaining, restored.round_time_remaining
  end

  test 'get returns nil for nonexistent instance' do
    assert_nil RedisGameStore.get('nonexistent')
  end

  test 'exists? returns true for stored instances' do
    RedisGameStore.set(@instance_id, @game)

    assert RedisGameStore.exists?(@instance_id)
  end

  test 'exists? returns false for missing instances' do
    assert_not RedisGameStore.exists?('nonexistent')
  end

  test 'delete removes the game state' do
    RedisGameStore.set(@instance_id, @game)
    RedisGameStore.delete(@instance_id)

    assert_nil RedisGameStore.get(@instance_id)
  end

  test 'increment and decrement subscriptions' do
    RedisGameStore.increment_subscriptions(@instance_id)
    RedisGameStore.increment_subscriptions(@instance_id)

    assert_equal 2, RedisGameStore.subscription_count(@instance_id)

    RedisGameStore.decrement_subscriptions(@instance_id)

    assert_equal 1, RedisGameStore.subscription_count(@instance_id)
  end

  test 'subscription_count returns 0 for unknown instance' do
    assert_equal 0, RedisGameStore.subscription_count('nonexistent')
  end

  test 'delete_subscriptions removes the counter' do
    RedisGameStore.increment_subscriptions(@instance_id)
    RedisGameStore.delete_subscriptions(@instance_id)

    assert_equal 0, RedisGameStore.subscription_count(@instance_id)
  end

  test 'preserves submissions through round trip' do
    @game.start_game
    @game.handle_player_submission('discord-123', {
      'submission' => 'Great Answer',
      'user_data' => { 'displayName' => 'Tester' }
    })

    RedisGameStore.set(@instance_id, @game)
    restored = RedisGameStore.get(@instance_id)

    assert restored.submissions.key?('discord-123')
    assert_equal 'Great Answer', restored.submissions['discord-123'].submission
  end

  test 'preserves votes and scores through round trip' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.start_game
    @game.next_phase # -> voting
    @game.handle_player_vote('player-2', 'player-1')
    @game.next_phase # -> results

    RedisGameStore.set(@instance_id, @game)
    restored = RedisGameStore.get(@instance_id)

    assert_equal 1, restored.scores['player-1']
    assert_equal({ 'player-2' => 'player-1' }, restored.votes)
  end
end
