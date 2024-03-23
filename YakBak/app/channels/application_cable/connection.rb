module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :discord_user_id

    def connect
      self.discord_user_id = get_validated_user_discord_id
    end

    private
    def get_validated_user_discord_id
      # let user = Api::User::profile(token)
      # puts user
      9
    end
  end
end
