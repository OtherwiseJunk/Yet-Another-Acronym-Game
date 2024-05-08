# frozen_string_literal: true

class TokensController < ApplicationController
  def create
    uri = URI('https://discord.com/api/oauth2/token')
    body = {
      client_id: ENV['VITE_DISCORD_CLIENT_ID'],
      client_secret: ENV['DISCORD_CLIENT_SECRET'],
      grant_type: 'authorization_code',
      code: params[:code]
    }

    response = HTTParty.post(uri, body:)
    Rails.logger.debug response

    if response.code == 200
      render json: JSON.parse(response.body)
    else
      render json: { error: 'Error obtaining access token' }, status: :bad_request
    end
  end
end
