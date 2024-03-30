module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :discord_user_id

    def connect
      self.discord_user_id = get_validated_user_discord_id
    end

    private
    def get_validated_user_discord_id
      token = request.original_fullpath.split('=')[1]
      profile = JSON.parse( Discordrb::API::User.profile( "Bearer #{token}" ) )

      profile["id"]
    end
  end
end
