module ApplicationCable
  class Connection < ActionCable::Connection::Base
    # identified by :discord_user

    def connect
      puts 'in channel connection!'
    end
  end
end
