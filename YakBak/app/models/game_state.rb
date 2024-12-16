module GamePhases
  UNSTARTED = 0
  SUBMITTING = 1
  VOTING = 2
  RESULTS = 3
end

class GameState
  include GamePhases
  attr_reader :round_number, :current_acronym, :scores, :submissions, :game_phase, :players, :round_time_remaining,
              :votes

  def initialize(player)
    @players = [player]
    @scores = {}
    @game_phase = UNSTARTED
    @round_number = 0
    @alphabet = ('a'..'z').to_a
  end

  def generate_new_acronym(round)
    acronym = ''
    acronym_length = acronym_length_by_round round

    (1..acronym_length).each do |_|
      acronym << @alphabet.sample
    end

    acronym
  end

  def start_game
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
    # based on current phased, a little counter-intuitively
    case @game_phase
    when SUBMITTING
      @round_time_remaining = 20
      @game_phase = VOTING
      @votes = {}
    when VOTING
      @game_phase = RESULTS
      @round_time_remaining = 0
    else
      Rails.logger.debug 'oh fuck.'
    end
  end

  def handle_player_vote; end

  def round_second_elapsed
    @round_time_remaining -= 1
  end

  def handle_player_submission(discord_id, submission_data)
    @submissions[discord_id] =
      UserSubmission.new(submission_data['submission'], 60 - @round_time_remaining, submission_data['user_data'])
  end

  private

  attr_writer :round_number, :current_acronym, :scores, :submissions, :game_phase, :players, :round_time_remaining,
              :votes

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
