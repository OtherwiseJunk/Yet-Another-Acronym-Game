class ChatChannel < ApplicationCable::Channel  
  @@messagesByInstance = {}

  def subscribed

    # stream_from "some_channel"
    stream_from "chat_#{params[:instance]}"

    if not @@messagesByInstance.key?(params[:instance])
      @@messagesByInstance[params[:instance]] = Array.new
    end

    transmit(@@messagesByInstance[params[:instance]])
  end

  def receive(data)
    @@messagesByInstance[params[:instance]] << data
    ActionCable.server.broadcast("chat_#{params[:instance]}", data)
  end

  def unsubscribed
    puts 'Unsubscribed :dAmn:'
    puts params
  end
end
