class GameChannel < ApplicationCable::Channel
  @@gameStateByInstance = {}
  @@subscriptionCountByInstance = {}

  def subscribed
    stream_from "game_#{params[:instance]}"

    increment_subcription_count params[:instance]
    add_player_to_game params[:discordUserId]

    broadcast_game_state
  end

  def unsubscribed
    @@subscriptionCountByInstance[params[:instance]] -= 1
    @@gameStateByInstance[params[:instance]].remove_player_from_game params[:discordUserId]

    if @@subscriptionCountByInstance[params[:instance]] == 0
      puts 'Last user has disconnected from instance #{params[:instance]}. Cleaning up...'

      @@subscriptionCountByInstance = @@subscriptionCountByInstance.delete([params[:instance]]) || Hash.new
      @@gameStateByInstance = @@gameStateByInstance.delete([params[:instance]]) || Hash.new
    end
  end

  def receive(data)
    game_state = @@gameStateByInstance[params[:instance]]
    case data['type']
    when 0
      puts 'received game start request'
      if(game_state.game_phase == 0)
        puts 'starting game...'
        game_state.start_game
        broadcast_game_state
        sleep(3)
        broadcast_round_countdown game_state
      end
    when 1
      puts 'received submission from '
      game_state.handle_player_submission params[:instance], data
    end
  end

  def increment_subcription_count(instance)
    if not @@subscriptionCountByInstance.key?(params[:instance])
      @@subscriptionCountByInstance[params[:instance]] = 1
    else
      @@subscriptionCountByInstance[params[:instance]] += 1
    end
  end

  def add_player_to_game(player)
    if not @@gameStateByInstance.key?(params[:instance])
      @@gameStateByInstance[params[:instance]] = GameState.new player
    else
      @@gameStateByInstance[params[:instance]].add_player_to_game player
    end
  end

  def broadcast_game_state
    ActionCable.server.broadcast("game_#{params[:instance]}", @@gameStateByInstance[params[:instance]])
  end

  def broadcast_round_countdown(game_state)
      while game_state.round_time_remaining > 0
        game_state.round_second_elapsed
        sleep(1)
        unless @@gameStateByInstance.key?(params[:instance])
          puts 'Game has ended, bailing on countdown.'
          return
        end
        broadcast_game_state
      end

      unless @@gameStateByInstance.key?(params[:instance])
        puts 'Game has ended, bailing on countdown.'
        return
      end
      game_state.next_phase
      broadcast_game_state
  end

end
