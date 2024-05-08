# frozen_string_literal: true

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

  SUBMISSION_ROUND_TIME = 60
  VOTING_ROUND_TIME = 20
  ALPHABET = ('a'..'z').to_a.freeze

  def initialize(hash_object = { players: [], scores: {}, game_phase: UNSTARTED, round_number: 0 })
    hash_object.each do |k, v|
      instance_variable_set("@#{k}", v) unless v.nil?
    end
  end

  def generate_new_acronym(round)
    acronym = ''
    acronym_length = acronym_length_by_round round

    (1..acronym_length).each do |_|
      acronym << ALPHABET.sample
    end

    acronym
  end

  def start_game
    # test_string = "Some Test Text That Is Exactly Twelve Words, Because I wanna see!"
    # test_user_data ={"avatarUrl"=>"https://1219391019515121716.discordsays.com/assets/yak.png", "decorationUrl"=>"", "displayName"=>"Test Idiot"}
    @round_number += 1
    @current_acronym = generate_new_acronym @round_number
    @game_phase = SUBMITTING
    @round_time_remaining = SUBMISSION_ROUND_TIME
    @submissions = {}
    create_acronym_if_new @current_acronym
    Rails.logger.debug "Starting Game. Round Time Remianing: #{@round_time_remaining}. Current Acronym #{@current_acronym}."
  end

  def add_player_to_game(player)
    @players << player
    Rails.logger.debug "Added player to game. New player array: #{@players}"
  end

  def remove_player_from_game(player)
    @players.delete player
    Rails.logger.debug "Removed player from game. New player array: #{@players}"
  end

  def next_phase
    # based on current phased, a little counter-intuitively
    case @game_phase
    when SUBMITTING
      @round_time_remaining = VOTING_ROUND_TIME
      @game_phase = VOTING
      @votes = {}
    when VOTING
      @game_phase = RESULTS
      @round_time_remaining = 0
    else
      Rails.logger.debug 'oh fuck.'
    end
  end

  def handle_player_submission(discord_id, submission_data, instance_id, guess_seconds)
    Rails.logger.debug "Received player submission. Discord ID: #{discord_id}. Submission Text: #{submission_data['submission']}. Remaining Time: #{@round_time_remaining}. Submission Round Time #{@@SUBMISSION_ROUND_TIME}."
    submission_text = submission_data['submission']
    user_data = submission_data['user_data']

    @submissions[discord_id] = UserSubmission.new submission_text, guess_seconds, user_data
    create_submission instance_id, discord_id, submission_text, guess_seconds
  end

  def handle_player_vote; end

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

  def create_submission(instance_id, discord_id, submission_text, guess_seconds)
    acronym = Acronym.find_by(acronym: @current_acronym)
    return if acronym.nil?

    Submission.create game_id: instance_id, discord_user: discord_id, submission: submission_text,
                      guess_seconds:, acronym:
  end

  def create_acronym_if_new(acronym)
    existing_acronym = Acronym.find_by(acronym:)
    return unless existing_acronym.nil?

    Acronym.create acronym:
  end
end
