class GameChannel < ApplicationCable::Channel
  @@gameStateByInstance = {}
  @@subscriptionCountByInstance = {}

  def subscribed
    stream_from "game_#{params[:instance]}"

    increment_subcription_count params[:instance]
    add_player_to_game params[:discordUserId]

    ActionCable.server.broadcast("game_#{params[:instance]}", @@gameStateByInstance[params[:instance]])

    puts params
  end

  def unsubscribed
    @@subscriptionCountByInstance[params[:instance]] -= 1
    @@gameStateByInstance[params[:instance]].remove_player_from_game params[:discordUserId]

    if @@subscriptionCountByInstance[params[:instance]] == 0
      puts "Last user has disconnected from instance #{params[:instance]}. Cleaning up..."
      
      @@subscriptionCountByInstance.delete([params[:instance]])
      @@gameStateByInstance.delete([params[:instance]])
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
end
