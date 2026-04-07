require 'test_helper'

class ChatChannelTest < ActionCable::Channel::TestCase
  test "chat channel should use consistent variable naming" do
    source = File.read(Rails.root.join('app', 'channels', 'chat_channel.rb'))

    has_snake_case_messages = source.include?('@@messages_by_instance')
    has_camel_case_messages = source.include?('@@messagesByInstance')
    has_snake_case_subs = source.include?('@@subscription_count_by_instance')
    has_camel_case_subs = source.include?('@@subscriptionCountByInstance')

    assert_not(has_snake_case_messages && has_camel_case_messages,
               'chat_channel.rb mixes @@messages_by_instance and @@messagesByInstance — pick one')
    assert_not(has_snake_case_subs && has_camel_case_subs,
               'chat_channel.rb mixes @@subscription_count_by_instance and @@subscriptionCountByInstance — pick one')
  end
end
