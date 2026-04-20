class GameState
  include GamePhases
  include GameModes
  DEADLINE_TIMER_SCHEDULE = [60, 45, 30, 20, 15].freeze

  attr_reader :round_number, :current_acronym, :scores, :submissions, :game_phase, :players,
              :round_time_remaining, :votes, :game_mode, :max_rounds, :host_player_id,
              :deadline_decay_level, :last_round_scoring, :last_round_winner_id,
              :cumulative_times, :overall_fastest_player_ids

  # Word-start frequency weights based on English dictionary analysis.
  # Each value represents the relative likelihood of a word starting with that letter.
  LETTER_WEIGHTS = {
    'a' => 793, 'b' => 386, 'c' => 850, 'd' => 413, 'e' => 409,
    'f' => 281, 'g' => 295, 'h' => 375, 'i' => 338, 'j' => 98,
    'k' => 132, 'l' => 330, 'm' => 590, 'n' => 228, 'o' => 338,
    'p' => 1153, 'q' => 156, 'r' => 343, 's' => 1045, 't' => 614,
    'u' => 121, 'v' => 266, 'w' => 193, 'x' => 61, 'y' => 48,
    'z' => 143
  }.freeze

  WEIGHTED_ALPHABET = LETTER_WEIGHTS.flat_map { |letter, weight| [letter] * weight }.freeze

  def initialize(player)
    @players = [player]
    @scores = {}
    @game_phase = UNSTARTED
    @round_number = 0
    @host_player_id = player
    @game_mode = nil
    @max_rounds = nil
    @deadline_decay_level = 0
    @last_round_scoring = {}
    @last_round_winner_id = nil
    @cumulative_times = {}
    @overall_fastest_player_ids = []
  end

  def generate_new_acronym(round)
    acronym_length = acronym_length_by_round round
    Array.new(acronym_length) { WEIGHTED_ALPHABET.sample }.join
  end

  def configure_game(mode, max_rounds = nil)
    @game_mode = mode
    @max_rounds = max_rounds
    @deadline_decay_level = 0
    @cumulative_times = {}
    @overall_fastest_player_ids = []
    @last_round_scoring = {}
    @last_round_winner_id = nil
  end

  def submission_timer
    DEADLINE_TIMER_SCHEDULE[[@deadline_decay_level, DEADLINE_TIMER_SCHEDULE.length - 1].min]
  end

  def start_round
    @round_number += 1
    @current_acronym = generate_new_acronym(@round_number)
    @game_phase = SUBMITTING
    @round_time_remaining = submission_timer
    @submissions = {}
    @last_round_scoring = {}
    @last_round_winner_id = nil
  end

  def add_player_to_game(player)
    @players << player
  end

  def remove_player_from_game(player)
    @players.delete player
  end

  def next_phase
    case @game_phase
    when SUBMITTING
      if @game_mode == DEADLINE && @submissions.empty?
        @game_phase = GAME_OVER
        @round_time_remaining = 0
      else
        @deadline_decay_level = [@deadline_decay_level + 1, DEADLINE_TIMER_SCHEDULE.length - 1].min if @game_mode == DEADLINE && @submissions.count < @players.count
        penalty = submission_timer
        @players.each do |player_id|
          next if @submissions.key?(player_id)

          @cumulative_times[player_id] = (@cumulative_times[player_id] || 0) + penalty
        end
        @round_time_remaining = 20
        @game_phase = VOTING
        @votes = {}
      end
    when VOTING
      score_round
      @game_phase = RESULTS
      @round_time_remaining = 0
    else
      Rails.logger.debug 'Unexpected next_phase call'
    end
  end

  def should_end_game?
    return false unless @game_phase == RESULTS
    return false unless @game_mode == FIXED_ROUNDS

    @round_number >= @max_rounds
  end

  def end_game
    award_final_bonuses
    @game_phase = GAME_OVER
  end

  def handle_player_vote(voter_id, voted_for_id)
    return if voter_id == voted_for_id
    return if @votes.key?(voter_id)

    @votes[voter_id] = voted_for_id
  end

  def round_second_elapsed
    @round_time_remaining -= 1
  end

  def handle_player_submission(discord_id, submission_data)
    submission_text = submission_data['submission']
    invalid_words = validate_word_lengths(submission_text)
    return { error: 'invalid_words', words: invalid_words } if invalid_words.any?

    answer_time = submission_timer - @round_time_remaining
    @submissions[discord_id] =
      UserSubmission.new(submission_text, answer_time, submission_data['user_data'])
    @cumulative_times[discord_id] = (@cumulative_times[discord_id] || 0) + answer_time
    nil
  end

  def to_hash
    {
      "round_number" => @round_number,
      "current_acronym" => @current_acronym,
      "scores" => @scores,
      "submissions" => (@submissions || {}).transform_values(&:to_hash),
      "game_phase" => @game_phase,
      "players" => @players,
      "round_time_remaining" => @round_time_remaining,
      "votes" => @votes,
      "game_mode" => @game_mode,
      "max_rounds" => @max_rounds,
      "host_player_id" => @host_player_id,
      "deadline_decay_level" => @deadline_decay_level,
      "last_round_scoring" => @last_round_scoring,
      "last_round_winner_id" => @last_round_winner_id,
      "cumulative_times" => @cumulative_times,
      "overall_fastest_player_ids" => @overall_fastest_player_ids
    }
  end

  def self.from_hash(hash)
    game = allocate
    game.instance_variable_set(:@round_number, hash["round_number"])
    game.instance_variable_set(:@current_acronym, hash["current_acronym"])
    game.instance_variable_set(:@scores, hash["scores"] || {})
    game.instance_variable_set(:@game_phase, hash["game_phase"])
    game.instance_variable_set(:@players, hash["players"])
    game.instance_variable_set(:@round_time_remaining, hash["round_time_remaining"])
    game.instance_variable_set(:@votes, hash["votes"] || {})
    game.instance_variable_set(:@game_mode, hash["game_mode"])
    game.instance_variable_set(:@max_rounds, hash["max_rounds"])
    game.instance_variable_set(:@host_player_id, hash["host_player_id"])
    game.instance_variable_set(:@deadline_decay_level, hash["deadline_decay_level"] || 0)
    game.instance_variable_set(:@last_round_scoring, hash["last_round_scoring"] || {})
    game.instance_variable_set(:@last_round_winner_id, hash["last_round_winner_id"])
    game.instance_variable_set(:@cumulative_times, hash["cumulative_times"] || {})
    game.instance_variable_set(:@overall_fastest_player_ids, hash["overall_fastest_player_ids"] || [])

    submissions = (hash["submissions"] || {}).transform_values { |s| UserSubmission.from_hash(s) }
    game.instance_variable_set(:@submissions, submissions)

    game
  end

  private

  attr_writer :round_number, :current_acronym, :scores, :submissions, :game_phase, :players,
              :round_time_remaining, :votes, :game_mode, :max_rounds, :host_player_id,
              :deadline_decay_level

  def score_round
    @last_round_scoring = {}
    @last_round_winner_id = nil

    votes_received = Hash.new(0)
    @votes.each_value do |voted_for_id|
      votes_received[voted_for_id] += 1
      @scores[voted_for_id] = (@scores[voted_for_id] || 0) + 1
    end

    if votes_received.any?
      max_votes = votes_received.values.max
      top_candidates = votes_received.select { |_, v| v == max_votes }.keys
      @last_round_winner_id = top_candidates.min_by do |id|
        @submissions[id]&.answer_time || Float::INFINITY
      end

      @votes.each do |voter_id, voted_for_id|
        next unless voted_for_id == @last_round_winner_id

        @scores[voter_id] = (@scores[voter_id] || 0) + 1
      end
    end

    fastest_with_votes = nil
    eligible_for_speed = votes_received.keys.select { |id| @submissions.key?(id) }
    unless eligible_for_speed.empty?
      fastest_with_votes = eligible_for_speed.min_by { |id| @submissions[id].answer_time }
      @scores[fastest_with_votes] = (@scores[fastest_with_votes] || 0) + 1
    end

    @submissions.each_key do |user_id|
      voted_for_id = @votes[user_id]
      voted_for_winner_bonus = (@last_round_winner_id && voted_for_id == @last_round_winner_id) ? 1 : 0
      speed_bonus = user_id == fastest_with_votes ? 1 : 0
      votes_for_user = votes_received[user_id]
      is_winner = user_id == @last_round_winner_id
      total = votes_for_user + voted_for_winner_bonus + speed_bonus
      @last_round_scoring[user_id] = {
        "votes_received" => votes_for_user,
        "voted_for_winner" => voted_for_winner_bonus,
        "speed_bonus" => speed_bonus,
        "total" => total,
        "is_winner" => is_winner
      }
    end
  end

  def award_final_bonuses
    return if @cumulative_times.empty?

    min_time = @cumulative_times.values.min
    fastest_ids = @cumulative_times.select { |_, v| v == min_time }.keys
    @overall_fastest_player_ids = fastest_ids
    fastest_ids.each do |user_id|
      @scores[user_id] = (@scores[user_id] || 0) + 1
    end
  end

  def validate_word_lengths(submission_text)
    return [] if submission_text.nil?

    submission_text.split.each_with_index.filter_map do |word, index|
      index unless ShortWords.valid_word_length?(word)
    end
  end

  def acronym_length_by_round(round)
    case round
    when 1..3
      rand(3..5)
    when 4..7
      rand(5..8)
    else
      rand(9..12)
    end
  end
end
