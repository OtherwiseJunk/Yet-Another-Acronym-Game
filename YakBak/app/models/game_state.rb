module GamePhases
  UNSTARTED = 0
  SUBMITTING = 1
  VOTING = 2
  RESULTS = 3
  GAME_OVER = 4
end

module GameModes
  FIXED_ROUNDS = 'fixed_rounds'
  DEADLINE = 'deadline'
end

class GameState
  include GamePhases
  include GameModes
  attr_reader :round_number, :current_acronym, :scores, :submissions, :game_phase, :players,
              :round_time_remaining, :votes, :game_mode, :max_rounds, :host_player_id

  def initialize(player)
    @players = [player]
    @scores = {}
    @game_phase = UNSTARTED
    @round_number = 0
    @alphabet = ('a'..'z').to_a
    @host_player_id = player
    @game_mode = nil
    @max_rounds = nil
  end

  def generate_new_acronym(round)
    acronym_length = acronym_length_by_round round
    Array.new(acronym_length) { @alphabet.sample }.join
  end

  def configure_game(mode, max_rounds = nil)
    @game_mode = mode
    @max_rounds = max_rounds
  end

  def start_round
    @round_number += 1
    @current_acronym = generate_new_acronym(@round_number)
    @game_phase = SUBMITTING
    @round_time_remaining = 60
    @submissions = {}
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
        @round_time_remaining = 20
        @game_phase = VOTING
        @votes = {}
      end
    when VOTING
      tally_votes
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
    @submissions[discord_id] =
      UserSubmission.new(submission_data['submission'], 60 - @round_time_remaining, submission_data['user_data'])
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
      "host_player_id" => @host_player_id
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
    game.instance_variable_set(:@alphabet, ("a".."z").to_a)
    game.instance_variable_set(:@game_mode, hash["game_mode"])
    game.instance_variable_set(:@max_rounds, hash["max_rounds"])
    game.instance_variable_set(:@host_player_id, hash["host_player_id"])

    submissions = (hash["submissions"] || {}).transform_values { |s| UserSubmission.from_hash(s) }
    game.instance_variable_set(:@submissions, submissions)

    game
  end

  private

  attr_writer :round_number, :current_acronym, :scores, :submissions, :game_phase, :players,
              :round_time_remaining, :votes, :game_mode, :max_rounds, :host_player_id

  def tally_votes
    @votes.each_value do |voted_for_id|
      @scores[voted_for_id] = (@scores[voted_for_id] || 0) + 1
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
