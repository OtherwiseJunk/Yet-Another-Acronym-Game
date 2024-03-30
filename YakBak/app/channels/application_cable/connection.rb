module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :discord_user_id

    def connect
      self.discord_user_id = get_validated_user_discord_id
    end

    private
    def get_validated_user_discord_id
      profile = Discordrb::API::User.profile params[:token]
      puts 'Got the profile probably'
      puts 'idk did I?'
      puts profile
      SecureRandom.uuid
    end
  end
end
