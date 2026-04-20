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
    assert_not_empty @game.current_acronym
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

  test 'handle_player_vote records a vote' do
    @game.start_game
    @game.next_phase # -> voting

    @game.handle_player_vote('voter-1', 'player-1')

    assert_equal 'player-1', @game.votes['voter-1']
  end

  test 'handle_player_vote prevents voting for yourself' do
    @game.start_game
    @game.next_phase

    @game.handle_player_vote('player-1', 'player-1')

    assert_empty @game.votes
  end

  test 'handle_player_vote prevents double voting' do
    @game.start_game
    @game.next_phase

    @game.handle_player_vote('voter-1', 'player-1')
    @game.handle_player_vote('voter-1', 'player-2')

    assert_equal 'player-1', @game.votes['voter-1']
  end

  test 'votes are tallied into scores when transitioning to results' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.start_game
    @game.next_phase # -> voting

    @game.handle_player_vote('player-2', 'player-1')
    @game.handle_player_vote('player-3', 'player-1')

    @game.next_phase # -> results (tallies votes)

    assert_equal 2, @game.scores['player-1']
  end

  test 'scores accumulate across rounds' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')

    # Round 1
    @game.start_game
    @game.next_phase # -> voting
    @game.handle_player_vote('player-2', 'player-1')
    @game.next_phase # -> results

    # Round 2
    @game.start_game
    @game.next_phase # -> voting
    @game.handle_player_vote('player-3', 'player-1')
    @game.next_phase # -> results

    assert_equal 2, @game.scores['player-1']
  end

  test 'players with no votes get no score entry' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.start_game
    @game.next_phase # -> voting
    @game.handle_player_vote('player-2', 'player-1')
    @game.next_phase # -> results

    assert_equal 1, @game.scores['player-1']
    assert_nil @game.scores['player-2']
    assert_nil @game.scores['player-3']
  end

  # Serialization tests

  test 'to_hash returns a hash with all game state fields' do
    hash = @game.to_hash

    assert_equal 0, hash["round_number"]
    assert_equal GamePhases::UNSTARTED, hash["game_phase"]
    assert_equal ['player-1'], hash["players"]
    assert_equal({}, hash["scores"])
  end

  test 'from_hash restores a game state from a hash' do
    @game.start_game
    hash = @game.to_hash
    restored = GameState.from_hash(hash)

    assert_equal @game.round_number, restored.round_number
    assert_equal @game.current_acronym, restored.current_acronym
    assert_equal @game.game_phase, restored.game_phase
    assert_equal @game.players, restored.players
    assert_equal @game.round_time_remaining, restored.round_time_remaining
  end

  test 'round trip through JSON preserves submissions' do
    @game.start_game
    @game.handle_player_submission('discord-123',
                                    'submission' => 'Test Answer',
                                    'user_data' => { 'displayName' => 'Tester' })

    json = JSON.generate(@game.to_hash)
    restored = GameState.from_hash(JSON.parse(json))

    assert restored.submissions.key?('discord-123')
    assert_equal 'Test Answer', restored.submissions['discord-123'].submission
    assert_equal({ 'displayName' => 'Tester' }, restored.submissions['discord-123'].user_data)
  end

  test 'round trip through JSON preserves votes and scores' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.start_game
    @game.next_phase # -> voting
    @game.handle_player_vote('player-2', 'player-1')
    @game.next_phase # -> results

    json = JSON.generate(@game.to_hash)
    restored = GameState.from_hash(JSON.parse(json))

    assert_equal({ 'player-2' => 'player-1' }, restored.votes)
    assert_equal 1, restored.scores['player-1']
  end

  test 'restored game state can continue gameplay' do
    @game.start_game
    restored = GameState.from_hash(JSON.parse(JSON.generate(@game.to_hash)))

    restored.round_second_elapsed
    assert_equal 59, restored.round_time_remaining

    restored.next_phase
    assert_equal GamePhases::VOTING, restored.game_phase
  end

  # Word length validation tests

  test 'handle_player_submission rejects single-letter words not in allowlist' do
    @game.start_round
    result = @game.handle_player_submission('discord-123',
                                            'submission' => 'A B C',
                                            'user_data' => {})

    assert_not_nil result
    assert_equal 'invalid_words', result[:error]
    assert_includes result[:words], 1 # "B" is invalid
    assert_includes result[:words], 2 # "C" is invalid
    assert_nil @game.submissions['discord-123']
  end

  test 'handle_player_submission accepts valid short words from allowlist' do
    @game.start_round
    result = @game.handle_player_submission('discord-123',
                                            'submission' => 'Hug a Frog',
                                            'user_data' => {})

    assert_nil result
    assert @game.submissions.key?('discord-123')
  end

  test 'handle_player_submission accepts all words 3+ characters' do
    @game.start_round
    result = @game.handle_player_submission('discord-123',
                                            'submission' => 'Apples Bananas Cherries',
                                            'user_data' => {})

    assert_nil result
    assert @game.submissions.key?('discord-123')
  end

  test 'handle_player_submission rejects invalid 2-letter words' do
    @game.start_round
    result = @game.handle_player_submission('discord-123',
                                            'submission' => 'Apples bb Cherries',
                                            'user_data' => {})

    assert_not_nil result
    assert_equal 'invalid_words', result[:error]
    assert_includes result[:words], 1 # "bb" is invalid
  end

  # Deadline timer decay tests

  test 'submission_timer returns 60 by default' do
    @game.configure_game(GameModes::DEADLINE)
    assert_equal 60, @game.submission_timer
  end

  test 'deadline decay increments when not all players submit' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)
    @game.start_round

    # Only one player submits (out of 2)
    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.next_phase

    assert_equal 1, @game.deadline_decay_level
    assert_equal 45, @game.submission_timer
  end

  test 'deadline decay does not increment when all players submit' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)
    @game.start_round

    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.handle_player_submission('player-2',
                                    'submission' => 'Another Answer Here',
                                    'user_data' => {})
    @game.next_phase

    assert_equal 0, @game.deadline_decay_level
    assert_equal 60, @game.submission_timer
  end

  test 'deadline decay does not apply in fixed rounds mode' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::FIXED_ROUNDS, 10)
    @game.start_round

    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.next_phase

    assert_equal 0, @game.deadline_decay_level
  end

  test 'deadline decay follows the full schedule' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)

    expected_timers = [60, 45, 30, 20, 15]

    expected_timers.each do |expected_timer|
      assert_equal expected_timer, @game.submission_timer
      @game.start_round

      # Only one player submits to trigger decay
      @game.handle_player_submission('player-1',
                                      'submission' => 'Test Answer Here',
                                      'user_data' => {})
      @game.next_phase
    end

    # Should be at floor (15s) and not go lower
    assert_equal 15, @game.submission_timer
  end

  test 'deadline decay persists through serialization' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)
    @game.start_round

    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.next_phase

    json = JSON.generate(@game.to_hash)
    restored = GameState.from_hash(JSON.parse(json))

    assert_equal 1, restored.deadline_decay_level
    assert_equal 45, restored.submission_timer
  end

  test 'start_round uses decayed timer' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)
    @game.start_round

    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.next_phase # decay to level 1
    @game.next_phase # voting -> results

    @game.start_round # should use decayed timer

    assert_equal 45, @game.round_time_remaining
  end

  test 'configure_game resets decay level' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::DEADLINE)
    @game.start_round

    @game.handle_player_submission('player-1',
                                    'submission' => 'Test Answer Here',
                                    'user_data' => {})
    @game.next_phase
    assert_equal 1, @game.deadline_decay_level

    # Reconfiguring for a new game resets decay
    @game.configure_game(GameModes::DEADLINE)
    assert_equal 0, @game.deadline_decay_level
  end

  # Scoring rework tests — use start_round (start_game doesn't exist)

  def setup_three_player_voting_round(submit_order: %w[player-1 player-2 player-3])
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.configure_game(GameModes::FIXED_ROUNDS, 10)
    @game.start_round

    submit_order.each_with_index do |player, idx|
      idx.times { @game.round_second_elapsed }
      @game.handle_player_submission(player,
                                      'submission' => "Answer from #{player}",
                                      'user_data' => {})
    end
    @game.next_phase # -> voting
  end

  test 'score_round awards +1 per vote received' do
    setup_three_player_voting_round
    @game.handle_player_vote('player-2', 'player-1')
    @game.handle_player_vote('player-3', 'player-1')
    @game.next_phase # -> results, triggers score_round

    # player-1 gets 2 (votes) + 1 (speed bonus, fastest submitter with votes) = 3
    assert_equal 3, @game.scores['player-1']
  end

  test 'voter who voted for winner gets +1' do
    setup_three_player_voting_round
    @game.handle_player_vote('player-2', 'player-1') # player-2 votes for winner
    @game.handle_player_vote('player-3', 'player-1')
    @game.next_phase

    # player-2 and player-3 each get +1 for voting for the winner
    assert_equal 1, @game.scores['player-2']
    assert_equal 1, @game.scores['player-3']
  end

  test 'voter who did not vote for winner gets no voter-reward bonus' do
    setup_three_player_voting_round
    @game.handle_player_vote('player-2', 'player-1') # winner
    @game.handle_player_vote('player-1', 'player-3') # loser vote
    @game.next_phase

    # player-1 got 1 vote (loser vote) but voted for player-3 (not winner),
    # so no voter reward. Winner is player-2 (1 vote, faster than player-3).
    # Actually with this setup both player-1 and player-3 got 1 vote;
    # tiebreak by answer_time: player-1 submitted first (0s) vs player-3 (2s).
    # Winner => player-1.
    assert_equal 'player-1', @game.last_round_winner_id
    # player-2 voted for winner (player-1) so gets +1 voter reward
    assert_equal 1, @game.scores['player-2']
    # player-1 voted for player-3 (not winner) so no voter reward:
    # 1 (vote received) + 1 (speed bonus, fastest voted-for) = 2, not 3.
    assert_equal 2, @game.scores['player-1']
    assert_equal 0, @game.last_round_scoring.dig('player-1', 'voted_for_winner')
  end

  test 'winner tie is broken by lowest answer_time; only one winner bonus' do
    # Two candidates tied at 1 vote, tiebreak by answer_time
    setup_three_player_voting_round(submit_order: %w[player-1 player-3 player-2])
    # player-1 answer_time=0, player-3=1, player-2=2
    # player-2 votes for player-3, player-3 votes for player-2 -> tied at 1 each
    # Tiebreak: player-3 (answer_time=1) beats player-2 (answer_time=2)
    @game.handle_player_vote('player-2', 'player-3')
    @game.handle_player_vote('player-1', 'player-2')
    @game.next_phase

    assert_equal 'player-3', @game.last_round_winner_id
  end

  test 'speed bonus only goes to fastest submitter with at least one vote' do
    setup_three_player_voting_round
    # Only player-3 (slowest, answer_time=2) gets votes
    @game.handle_player_vote('player-1', 'player-3')
    @game.handle_player_vote('player-2', 'player-3')
    @game.next_phase

    # player-3 gets: 2 votes + 0 (they didn't vote for themselves) + 1 speed bonus
    # (fastest-with-votes among those voted-for is only player-3)
    assert_equal 3, @game.scores['player-3']
    # player-1 is fastest submission but got no votes → no speed bonus
    assert_nil @game.scores['player-1']
  end

  test 'no speed bonus awarded when no one got votes' do
    setup_three_player_voting_round
    @game.next_phase # no votes cast

    assert_nil @game.last_round_winner_id
    assert_empty @game.scores
  end

  test 'winner bonus and speed bonus stack when same player wins and is fastest' do
    setup_three_player_voting_round
    # player-1 is fastest AND gets votes
    @game.handle_player_vote('player-2', 'player-1')
    @game.handle_player_vote('player-3', 'player-1')
    @game.next_phase

    scoring = @game.last_round_scoring['player-1']
    assert_equal 2, scoring['votes_received']
    assert_equal 1, scoring['speed_bonus']
    assert_equal true, scoring['is_winner']
    assert_equal 3, scoring['total']
  end

  test 'last_round_scoring and last_round_winner_id round-trip through serialization' do
    setup_three_player_voting_round
    @game.handle_player_vote('player-2', 'player-1')
    @game.next_phase

    json = JSON.generate(@game.to_hash)
    restored = GameState.from_hash(JSON.parse(json))

    assert_equal 'player-1', restored.last_round_winner_id
    assert_equal 1, restored.last_round_scoring.dig('player-1', 'votes_received')
    assert_equal 1, restored.last_round_scoring.dig('player-1', 'speed_bonus')
    assert_equal true, restored.last_round_scoring.dig('player-1', 'is_winner')
  end

  test 'cumulative_times accumulate across rounds for submitters' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::FIXED_ROUNDS, 10)

    # Round 1: player-1 submits at 3s, player-2 submits at 7s
    @game.start_round
    3.times { @game.round_second_elapsed }
    @game.handle_player_submission('player-1', 'submission' => 'A A A', 'user_data' => {})
    4.times { @game.round_second_elapsed } # total 7 elapsed
    @game.handle_player_submission('player-2', 'submission' => 'B B B', 'user_data' => {})
    @game.next_phase # -> voting
    @game.next_phase # -> results

    # Round 2: player-1 submits at 5s, player-2 submits at 2s
    @game.start_round
    2.times { @game.round_second_elapsed }
    @game.handle_player_submission('player-2', 'submission' => 'B B B', 'user_data' => {})
    3.times { @game.round_second_elapsed } # total 5
    @game.handle_player_submission('player-1', 'submission' => 'A A A', 'user_data' => {})

    assert_equal 8, @game.cumulative_times['player-1'] # 3 + 5
    assert_equal 9, @game.cumulative_times['player-2'] # 7 + 2
  end

  test 'non-submitter gets submission_timer added to cumulative_times' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::FIXED_ROUNDS, 10)
    @game.start_round
    5.times { @game.round_second_elapsed }
    @game.handle_player_submission('player-1', 'submission' => 'A A A', 'user_data' => {})
    @game.next_phase # -> voting; player-2 did not submit

    assert_equal 5, @game.cumulative_times['player-1']
    assert_equal 60, @game.cumulative_times['player-2'] # full timer as penalty
  end

  test 'award_final_bonuses awards all players tied for lowest cumulative time' do
    @game.add_player_to_game('player-2')
    @game.add_player_to_game('player-3')
    @game.configure_game(GameModes::FIXED_ROUNDS, 1)
    @game.start_round

    # Force cumulative_times to a known state
    @game.instance_variable_set(:@cumulative_times,
                                  { 'player-1' => 4, 'player-2' => 4, 'player-3' => 10 })
    @game.instance_variable_set(:@game_phase, GamePhases::RESULTS)

    @game.end_game

    assert_includes @game.overall_fastest_player_ids, 'player-1'
    assert_includes @game.overall_fastest_player_ids, 'player-2'
    assert_equal 2, @game.overall_fastest_player_ids.size
    assert_equal 1, @game.scores['player-1']
    assert_equal 1, @game.scores['player-2']
    assert_nil @game.scores['player-3']
  end

  test 'cumulative_times and overall_fastest_player_ids round-trip through serialization' do
    @game.add_player_to_game('player-2')
    @game.configure_game(GameModes::FIXED_ROUNDS, 1)
    @game.start_round
    @game.handle_player_submission('player-1', 'submission' => 'A A A', 'user_data' => {})
    @game.next_phase # -> voting; also penalizes player-2
    @game.next_phase # -> results
    @game.instance_variable_set(:@game_phase, GamePhases::RESULTS)
    @game.end_game

    json = JSON.generate(@game.to_hash)
    restored = GameState.from_hash(JSON.parse(json))

    assert_equal @game.cumulative_times, restored.cumulative_times
    assert_equal @game.overall_fastest_player_ids, restored.overall_fastest_player_ids
  end
end
