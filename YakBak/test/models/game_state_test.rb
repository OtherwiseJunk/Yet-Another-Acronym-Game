require 'test_helper'

class GameStateTest < ActiveSupport::TestCase
  setup do
    @game = GameState.new('player-1')
  end

  test 'initializes with correct defaults' do
    assert_equal [@game.players, @game.game_phase, @game.round_number],
                 [['player-1'], GamePhases::UNSTARTED, 0]
    assert_empty @game.scores
  end

  test 'start_game advances round and sets submitting phase' do
    @game.start_game

    assert_equal 1, @game.round_number
    assert_equal GamePhases::SUBMITTING, @game.game_phase
    assert_equal 60, @game.round_time_remaining
    assert_empty @game.submissions
    assert_kind_of String, @game.current_acronym
    refute_empty @game.current_acronym
  end

  test 'start_game increments round number on subsequent calls' do
    @game.start_game
    @game.start_game

    assert_equal 2, @game.round_number
  end

  test 'generate_new_acronym returns correct length for early rounds' do
    100.times do
      acronym = @game.generate_new_acronym(1)
      assert_includes 3..5, acronym.length, "Round 1 acronym '#{acronym}' should be 3-5 chars"
    end
  end

  test 'generate_new_acronym returns correct length for mid rounds' do
    100.times do
      acronym = @game.generate_new_acronym(5)
      assert_includes 5..8, acronym.length, "Round 5 acronym '#{acronym}' should be 5-8 chars"
    end
  end

  test 'generate_new_acronym returns correct length for late rounds' do
    100.times do
      acronym = @game.generate_new_acronym(9)
      assert_includes 9..12, acronym.length, "Round 9 acronym '#{acronym}' should be 9-12 chars"
    end
  end

  test 'generate_new_acronym only uses lowercase letters' do
    100.times do
      acronym = @game.generate_new_acronym(1)
      assert_match(/\A[a-z]+\z/, acronym)
    end
  end

  test 'add_player_to_game adds player to players list' do
    @game.add_player_to_game('player-2')

    assert_equal %w[player-1 player-2], @game.players
  end

  test 'remove_player_from_game removes player from players list' do
    @game.add_player_to_game('player-2')
    @game.remove_player_from_game('player-1')

    assert_equal ['player-2'], @game.players
  end

  test 'next_phase transitions from submitting to voting' do
    @game.start_game
    @game.next_phase

    assert_equal GamePhases::VOTING, @game.game_phase
    assert_equal 20, @game.round_time_remaining
    assert_empty @game.votes
  end

  test 'next_phase transitions from voting to results' do
    @game.start_game
    @game.next_phase # submitting -> voting
    @game.next_phase # voting -> results

    assert_equal GamePhases::RESULTS, @game.game_phase
    assert_equal 0, @game.round_time_remaining
  end

  test 'round_second_elapsed decrements time remaining' do
    @game.start_game
    initial_time = @game.round_time_remaining

    @game.round_second_elapsed

    assert_equal initial_time - 1, @game.round_time_remaining
  end

  test 'handle_player_submission stores submission keyed by discord id' do
    @game.start_game
    user_data = { 'displayName' => 'Player', 'avatarUrl' => 'avatar.png' }
    submission_data = { 'submission' => 'Some Great Answer', 'user_data' => user_data }

    @game.handle_player_submission('discord-123', submission_data)

    assert @game.submissions.key?('discord-123')
    assert_equal 'Some Great Answer', @game.submissions['discord-123'].submission
  end

  test 'handle_player_submission calculates answer time from remaining time' do
    @game.start_game # sets round_time_remaining to 60
    5.times { @game.round_second_elapsed } # 55 remaining

    submission_data = { 'submission' => 'Answer', 'user_data' => {} }
    @game.handle_player_submission('discord-123', submission_data)

    assert_equal 5, @game.submissions['discord-123'].answer_time
  end
end
