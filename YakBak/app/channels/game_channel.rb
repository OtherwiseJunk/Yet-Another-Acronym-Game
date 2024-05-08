class GameChannel < ApplicationCable::Channel
  @redis = Redis.new(host: ENV['REDIS_URL'] || "redis://redis:6379/1")
  @subscription_count_template = "subscription_count_#{instance_id}}"
  @game_state_template = "game_state_#{instance_id}"

  def subscribed
    puts "Subscription request. Instance ID: #{params[:instance]}"
    stream_from "game_#{params[:instance]}"

    increment_subcription_count params[:instance]
    add_player_to_game params[:discordUserId]

    broadcast_game_state
  end

  def unsubscribed
    instance_id = {instance_id: params[:instance]}
    subscription_count_key = @subscription_count_template % instance_id
    game_state_key = @game_state_template % instance_id

    puts "Unsucribe request. Instance ID: #{params[:instance]}"
    @redis.decr(subscription_count_key)
    game_state = @redis.get(game_state_key)
    game_state.remove_player_from_game params[:discordUserId]
    @redis.set(game_state_key, game_state)

    if @redis.get(subscription_count_key) == 0
      puts 'Last user has disconnected from instance #{params[:instance]}. Cleaning up...'

      @redis.del(subscription_count_key)
      @redis.del(game_state_key)
    end
  end

  def receive(command)
    key = @game_state_template % {instance_id: params[:instance]}
    game_state = @redis.get(key)
    case command['type']
    when 0
      puts 'received game start request'
      if(game_state.game_phase == 0 or game_state.game_phase == 3)
        puts 'starting game...'
        game_state.start_game
        @redis.set(key, game_state)
        broadcast_game_state
        sleep(3)
        broadcast_round_countdown game_state
        if game_state.players.count < 3
          puts 'Less than 3 total players, skipping voting'
          game_state.next_phase
          @redis.set(key, game_state)
          broadcast_game_state
        else
          broadcast_round_countdown key
        end

      end
    when 1
      puts 'received submission from '
      game_state.handle_player_submission params[:discordUserId], command['data'], params[:instance]
    end
  end

  def increment_subcription_count(instance)
    key = @subscription_count_template % {instance_id: params[:instance]}

    unless @redis.exists(key)
      @redis.set(key, 1)
    else
      @redis.incr(key)
    end
  end

  def add_player_to_game(player)
    key = @game_state_template % {instance_id: params[:instance]}
    puts "Got a request to add player #{player} to game. Checking instance dictionary."
    puts "dictionary: #{@@gameStateByInstance}"
    puts "params: #{params}."

    unless @redis.exists(key)
      puts("Creating new game")
      @redis.set(key, GameState.new(player))
    else
      puts("Adding player to existing game")
      game_state = @redis.get(key)
      game_state.add_player_to_game player
      @redis.set(key, game_state)
    end
  end

  def broadcast_game_state
    key = @game_state_template % {instance_id: params[:instance]}
    ActionCable.server.broadcast "game_#{params[:instance]}", @redis.get(key)
  end

  def broadcast_round_countdown(game_state_key)

      while game_state.round_time_remaining > 0
        game_state = @redis.get(game_state_key)
        game_state.round_second_elapsed
        @redis.set(game_state_key, game_state)
        sleep 1

        if game_state.game_phase == 1 and game_state.submissions.count == game_state.players.count
          puts 'All players have submitted answers, bailing on countdown.'
          break
        end

        unless @redis.exists(game_state_key)
          puts 'Game has ended, bailing on countdown.'
          break
        end
        broadcast_game_state
      end

      unless @redis.exists(game_state_key)
        puts 'Game has ended, bailing on countdown.'
        return
      end
      game_state = @redis.get(game_state_key)
      game_state.next_phase
      @redis.set(game_state_key, game_state)
      broadcast_game_state
  end

end
