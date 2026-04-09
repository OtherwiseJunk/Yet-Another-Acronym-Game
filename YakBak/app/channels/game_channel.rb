class GameChannel < ApplicationCable::Channel
  @@game_state_by_instance = {}
  @@subscription_count_by_instance = {}
  @@timers_by_instance = {}

  def subscribed
    stream_from "game_#{params[:instance]}"

    increment_subscription_count params[:instance]
    add_player_to_game params[:discordUserId]

    broadcast_game_state
  end

  def unsubscribed
    @@subscription_count_by_instance[params[:instance]] -= 1
    @@game_state_by_instance[params[:instance]].remove_player_from_game params[:discordUserId]

    return unless @@subscription_count_by_instance[params[:instance]].zero?

    Rails.logger.debug { "Last user has disconnected from instance #{params[:instance]}. Cleaning up..." }

    cancel_timer params[:instance]
    @@subscription_count_by_instance.delete(params[:instance])
    @@game_state_by_instance.delete(params[:instance])
  end

  def receive(command)
    game_state = @@game_state_by_instance[params[:instance]]
    case command['type']
    when 0
      Rails.logger.debug 'received game start request'
      if game_state.game_phase.zero? || (game_state.game_phase == 3)
        Rails.logger.debug 'starting game...'
        game_state.start_game
        broadcast_game_state
        Concurrent::ScheduledTask.execute(3) do
          start_countdown params[:instance], game_state
        end
      end
    when 1
      Rails.logger.debug 'received submission from '
      game_state.handle_player_submission params[:discordUserId], command['data']
      broadcast_game_state
      if game_state.submissions.count == game_state.players.count
        Rails.logger.debug 'All players have submitted answers, ending countdown early.'
        cancel_timer params[:instance]
        on_countdown_complete params[:instance], game_state
      end
    when 2
      Rails.logger.debug 'received vote'
      game_state.handle_player_vote params[:discordUserId], command['data']
      broadcast_game_state
    end
  end

  def increment_subscription_count(_instance)
    if @@subscription_count_by_instance.key?(params[:instance])
      @@subscription_count_by_instance[params[:instance]] += 1
    else
      @@subscription_count_by_instance[params[:instance]] = 1
    end
  end

  def add_player_to_game(player)
    if @@game_state_by_instance.key?(params[:instance])
      @@game_state_by_instance[params[:instance]].add_player_to_game player
    else
      @@game_state_by_instance[params[:instance]] = GameState.new player
    end
  end

  def broadcast_game_state
    ActionCable.server.broadcast("game_#{params[:instance]}", @@game_state_by_instance[params[:instance]])
  end

  private

  def start_countdown(instance, game_state)
    cancel_timer(instance)

    timer = Concurrent::TimerTask.new(execution_interval: 1, run_now: true) do
      if !@@game_state_by_instance.key?(instance)
        Rails.logger.debug 'Game has ended, bailing on countdown.'
        cancel_timer(instance)
      elsif game_state.round_time_remaining <= 0
        cancel_timer(instance)
        on_countdown_complete(instance, game_state)
      else
        game_state.round_second_elapsed
        ActionCable.server.broadcast("game_#{instance}", game_state)
      end
    end

    @@timers_by_instance[instance] = timer
    timer.execute
  end

  def on_countdown_complete(instance, game_state)
    game_state.next_phase
    ActionCable.server.broadcast("game_#{instance}", game_state)

    if game_state.game_phase == GamePhases::VOTING
      if game_state.players.count < 3
        Rails.logger.debug 'Less than 3 total players, skipping voting'
        game_state.next_phase
        ActionCable.server.broadcast("game_#{instance}", game_state)
      else
        start_countdown(instance, game_state)
      end
    end
  end

  def cancel_timer(instance)
    timer = @@timers_by_instance.delete(instance)
    timer&.shutdown
  end
end
