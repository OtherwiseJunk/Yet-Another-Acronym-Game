require 'test_helper'

class TokensControllerTest < ActionDispatch::IntegrationTest
  test "create action should not log sensitive environment variables" do
    source = File.read(Rails.root.join('app', 'controllers', 'tokens_controller.rb'))

    refute source.include?('puts'), 'TokensController should not use puts to log anything'
    refute source.include?('DISCORD_CLIENT_SECRET'),
           'TokensController should not reference DISCORD_CLIENT_SECRET in log output'
    refute source.match?(/ENV\.each/),
           'TokensController should not iterate over all ENV variables'
  end
end
