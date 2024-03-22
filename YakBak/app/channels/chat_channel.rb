class ChatChannel < ApplicationCable::Channel  
  def subscribed
    # stream_from "some_channel"
    puts 'Got a subscription! that\'s neat.'
    stream_from "chat_#{params[:instance]}"
  end

  def recieve(data)
    puts 'In the receive(data) function'
    puts data
    ActionCable.server.broadcast("chat_#{params[:instance]}", data)
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
