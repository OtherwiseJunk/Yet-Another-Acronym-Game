module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :discord_user_id

    def connect
      self.discord_user_id = get_validated_user_discord_id
    end

    private

    def extract_token_from_url(url)
      url.split('=')[1]
    end

    def extract_validated_user_discord_id
      token = extract_token_from_url request.original_fullpath
      profile = JSON.parse(Discordrb::API::User.profile("Bearer #{token}"))

      profile['id']
    end
  end
end
