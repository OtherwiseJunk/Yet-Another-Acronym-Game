module ApplicationCable
  class Connection < ActionCable::Connection::Base
    # identified by :discord_user

    def connect
      puts 'in channel connection!'
      puts params
    end
  end
end
