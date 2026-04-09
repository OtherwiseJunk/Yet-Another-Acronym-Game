class GameChannel < ApplicationCable::Channel
  @@timers_by_instance = {}
  STARTABLE_GAME_PHASES = [GamePhases::UNSTARTED, GamePhases::RESULTS, GamePhases::GAME_OVER].freeze
  UNSTARTED_OR_FINISHED_GAME_PHASES = [GamePhases::UNSTARTED, GamePhases::GAME_OVER].freeze

  def subscribed
    stream_from "game_#{params[:instance]}"

    RedisGameStore.increment_subscriptions(params[:instance])
    add_player_to_game params[:discordUserId]

    broadcast_game_state
  end

  def unsubscribed
    instance = params[:instance]
    RedisGameStore.decrement_subscriptions(instance)

    game_state = RedisGameStore.get(instance)
    if game_state
      game_state.remove_player_from_game params[:discordUserId]
      RedisGameStore.set(instance, game_state)
    end

    return unless RedisGameStore.subscription_count(instance) <= 0

    Rails.logger.debug { "Last user has disconnected from instance #{instance}. Cleaning up..." }

    cancel_timer instance
    RedisGameStore.delete(instance)
    RedisGameStore.delete_subscriptions(instance)
  end

  def receive(command)
    instance = params[:instance]
    game_state = RedisGameStore.get(instance)
    return unless game_state

    case command['type']
    when 0
      handle_start_game(instance, game_state, command['data'])
    when 1
      handle_submission(instance, game_state, command['data'])
    when 2
      handle_vote(instance, game_state, command['data'])
    end
  end

  def add_player_to_game(player)
    instance = params[:instance]
    game_state = RedisGameStore.get(instance)

    if game_state
      game_state.add_player_to_game player
    else
      game_state = GameState.new player
    end

    RedisGameStore.set(instance, game_state)
  end

  def broadcast_game_state
    game_state = RedisGameStore.get(params[:instance])
    ActionCable.server.broadcast("game_#{params[:instance]}", game_state)
  end

  private

  def handle_start_game(instance, game_state, data)
    return unless STARTABLE_GAME_PHASES.include?(game_state.game_phase)

    if UNSTARTED_OR_FINISHED_GAME_PHASES.include?(game_state.game_phase)
      mode = data&.fetch('mode', GameModes::FIXED_ROUNDS)
      max_rounds = data&.fetch('max_rounds', nil) || 10
      game_state.configure_game(mode, max_rounds.to_i)

      # Reset for new game if coming from GAME_OVER
      if game_state.game_phase == GamePhases::GAME_OVER
        game_state.instance_variable_set(:@scores, {})
        game_state.instance_variable_set(:@round_number, 0)
      end
    end

    game_state.start_round
    RedisGameStore.set(instance, game_state)
    broadcast_game_state

    Concurrent::ScheduledTask.execute(3) do
      start_countdown instance
    end
  end

  def handle_submission(instance, game_state, data)
    game_state.handle_player_submission params[:discordUserId], data
    RedisGameStore.set(instance, game_state)
    broadcast_game_state

    return unless game_state.submissions.count == game_state.players.count

    Rails.logger.debug 'All players have submitted answers, ending countdown early.'
    cancel_timer instance
    on_countdown_complete instance
  end

  def handle_vote(instance, game_state, data)
    game_state.handle_player_vote params[:discordUserId], data
    RedisGameStore.set(instance, game_state)
    broadcast_game_state
  end

  def start_countdown(instance)
    cancel_timer(instance)

    timer = Concurrent::TimerTask.new(execution_interval: 1, run_now: true) do
      game_state = RedisGameStore.get(instance)

      if game_state.nil?
        Rails.logger.debug 'Game has ended, bailing on countdown.'
        cancel_timer(instance)
      elsif game_state.round_time_remaining <= 0
        cancel_timer(instance)
        on_countdown_complete(instance)
      else
        game_state.round_second_elapsed
        RedisGameStore.set(instance, game_state)
        ActionCable.server.broadcast("game_#{instance}", game_state)
      end
    end

    @@timers_by_instance[instance] = timer
    timer.execute
  end

  def on_countdown_complete(instance)
    game_state = RedisGameStore.get(instance)
    return unless game_state

    game_state.next_phase
    RedisGameStore.set(instance, game_state)
    ActionCable.server.broadcast("game_#{instance}", game_state)

    # If deadline mode ended the game during next_phase (no submissions), we're done
    return if game_state.game_phase == GamePhases::GAME_OVER

    if game_state.game_phase == GamePhases::RESULTS
      check_game_end(instance, game_state)
    elsif game_state.game_phase == GamePhases::VOTING
      if game_state.players.count < 3
        Rails.logger.debug 'Less than 3 total players, skipping voting'
        game_state.next_phase
        RedisGameStore.set(instance, game_state)
        ActionCable.server.broadcast("game_#{instance}", game_state)
        check_game_end(instance, game_state)
      else
        start_countdown(instance)
      end
    end
  end

  def check_game_end(instance, game_state)
    return unless game_state.should_end_game?

    game_state.end_game
    RedisGameStore.set(instance, game_state)
    ActionCable.server.broadcast("game_#{instance}", game_state)
  end

  def cancel_timer(instance)
    timer = @@timers_by_instance.delete(instance)
    timer&.shutdown
  end
end
