# frozen_string_literal: true

module ApplicationCable
  # ApplicationCable base class

  class Connection < ActionCable::Connection::Base
    identified_by :discord_user_id

    def connect
      self.discord_user_id = validate_user_discord_id
      Rails.logger.debug "User connected. Discord ID: #{discord_user_id}".freeze
    end

    private

    def validate_user_discord_id
      token = request.original_fullpath.split('=')[1]
      profile = JSON.parse(Discordrb::API::User.profile("Bearer #{token}"))

      profile['id']
    end
  end
end
