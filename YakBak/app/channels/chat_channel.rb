class ChatChannel < ApplicationCable::Channel  
  @@messagesByInstance = {}
  @@subscriptionCountByInstance = {}

  def subscribed

    # stream_from "some_channel"
    stream_from "chat_#{params[:instance]}"

    if not @@messagesByInstance.key?(params[:instance])
      @@messagesByInstance[params[:instance]] = Array.new
    end

    if not @@subscriptionCountByInstance.key?(params[:instance])
      @@subscriptionCountByInstance[params[:instance]] = 1
    else
      @@subscriptionCountByInstance[params[:instance]] += 1
    end

    transmit(@@messagesByInstance[params[:instance]])
  end

  def receive(data)
    @@messagesByInstance[params[:instance]] << data
    ActionCable.server.broadcast("chat_#{params[:instance]}", data)
  end

  def unsubscribed
    @@subscriptionCountByInstance[params[:instance]] -= 1

    if @@subscriptionCountByInstance[params[:instance]] == 0
      puts "Last user has disconnected from instance #{params[:instance]}. Cleaning up..."
      
      @@subscriptionCountByInstance.delete([params[:instance]])
      @@messagesByInstance.delete([params[:instance]])
    end
  end
end
