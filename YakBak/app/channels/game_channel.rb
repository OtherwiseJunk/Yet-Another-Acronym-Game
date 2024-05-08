# frozen_string_literal: true

class GameChannel < ApplicationCable::Channel
  REDIS = Redis.new(host: ENV['REDIS_URL'] || 'redis', password: ENV['REDIS_PASSWORD'] || 'password')
  SUBSCRIPTION_KEY_TEMPLATE = 'subscription_count_%<instance_id>s'
  GAME_KEY_TEMPLATE = 'game_state_%<instance_id>s'
  ROUND_TIME_KEY_TEMPLATE = 'round_time_%<instance_id>s'

  def subscribed
    stream_from "game_#{params[:instance]}"

    increment_subcription_count params[:instance]
    add_player_to_game params[:discordUserId]

    broadcast_game_state
  end

  def unsubscribed
    decrement_subscription_count params[:instance]

    remove_player_from_game params[:discordUserId]

    run_cleanup params[:instnace]
  end

  def retrieve_game_state
    key = format(GAME_KEY_TEMPLATE, instance_id)
    REDIS.get(key)
  end

  def remove_player_from_game(discord_id)
    game_state = retrieve_game_state
    return if game_state.nil?

    game_state.remove_player_from_game discord_id
    REDIS.set(game_state_key, game_state.to_json)
  end

  def run_cleanup(instance)
    instance_id = { instance_id: instance }
    game_state_key = format(GAME_KEY_TEMPLATE, instance_id)
    subscription_count_key = format(SUBSCRIPTION_KEY_TEMPLATE, instance_id)
    return unless REDIS.get(subscription_count_key) == '0'

    Rails.logger.debug "Last user has disconnected from instance #{params[:instance]}. Cleaning up..."

    REDIS.del(subscription_count_key)
    REDIS.del(game_state_key)
  end

  def handle_start_game_request(game_state, game_state_key)
    return unless game_state.game_phase.zero? || (game_state.game_phase == 3)

    game_state.start_game
    REDIS.set(key, game_state.to_json)
    broadcast_game_state
    sleep(3)
    broadcast_round_countdown key, GameStaet::SUBMISSION_ROUND_TIME
    if game_state.players.count < 3
      Rails.logger.debug 'Less than 3 total players, skipping voting'
      game_state.next_phase
      REDIS.set(game_state_key, game_state.to_json)
      broadcast_game_state
    else
      broadcast_round_countdown game_state_key
    end
  end

  def receive(command)
    key = format(GAME_KEY_TEMPLATE, instance_id: params[:instance])
    game_state = GameState.new ActiveSupport::JSON.decode(REDIS.get(key))
    case command['type']
    when 0
      handle_start_game_request game_state, key
    when 1
      handle_submissions
    end
  end

  def retrieve_round_time
    round_time_key = format(ROUND_TIME_KEY_TEMPLATE, instance_id: params[:instance])
    REDIS.get(round_time_key).to_i
  end

  def handle_submissions
    guess_seconds = GameState::SUBMISSION_ROUND_TIME - retrieve_round_time
    game_state.handle_player_submission params[:discordUserId], command['data'], params[:instance], guess_seconds
    game_state_json = game_state.to_json
    REDIS.set(key, game_state_json)
  end

  def increment_subcription_count(instance)
    key = format(SUBSCRIPTION_KEY_TEMPLATE, instance_id: instance)

    if REDIS.exists(key) != 0
      REDIS.incr(key)
    else
      REDIS.set(key, 1)
    end
  end

  def decrement_subscription_count(instance)
    key = format(SUBSCRIPTION_KEY_TEMPLATE, instance_id: instance)
    REDIS.decr(key)
  end

  def add_player_to_game(player)
    key = format(GAME_KEY_TEMPLATE, instance_id: params[:instance])

    game_state = if REDIS.exists(key) != 0
                   GameState.new ActiveSupport::JSON.decode(REDIS.get(key))
                 else
                   GameState.new
                 end
    game_state.add_player_to_game player
    REDIS.set(key, game_state.to_json)
  end

  def broadcast_game_state
    instance = { instance_id: params[:instance] }
    round_time_key = ROUND_TIME_KEY_TEMPLATE % instance

    return unless REDIS.exists(key) != 0

    game_state = GameState.new ActiveSupport::JSON.decode(REDIS.get(key))
    game_state.round_time_remaining = REDIS.get(round_time_key)
    ActionCable.server.broadcast "game_#{params[:instance]}", game_state
  end

  def broadcast_round_countdown(game_state_key, initial_time)
    round_time_key = format(ROUND_TIME_KEY_TEMPLATE, instance_id: params[:instance])
    countdown = initial_time
    REDIS.set(round_time_key, initial_time)
    while countdown.positive?
      countdown -= 1
      game_state = GameState.new ActiveSupport::JSON.decode(REDIS.get(game_state_key))
      REDIS.set(round_time_key, countdown)
      sleep 1

      break if (game_state.game_phase == 1) && (game_state.submissions.count == game_state.players.count)

      break unless REDIS.exists(game_state_key)

      broadcast_game_state
    end

    return unless REDIS.exists(game_state_key)

    game_state = GameState.new ActiveSupport::JSON.decode(REDIS.get(game_state_key))
    game_state.next_phase
    REDIS.set(game_state_key, game_state.to_json)
    broadcast_game_state
  end
end
