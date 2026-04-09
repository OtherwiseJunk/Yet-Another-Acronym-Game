class ChatChannel < ApplicationCable::Channel
  @@messages_by_instance = {}
  @@subscription_count_by_instance = {}

  def subscribed
    instance_id = params[:instance]

    if instance_id.blank?
      reject
      return
    end

    @@messages_by_instance[instance_id] ||= []
    @@subscription_count_by_instance[instance_id] ||= 0
    @@subscription_count_by_instance[instance_id] += 1

    stream_from "chat_#{instance_id}"

    transmit(@@messages_by_instance[instance_id])
  end

  def receive(data)
    return unless data.present? && data.is_a?(Hash) && data[:message].present?

    instance_id = params[:instance]

    @@messages_by_instance[instance_id] << data
    ActionCable.server.broadcast("chat_#{instance_id}", data)
  end

  def unsubscribed
    instance_id = params[:instance]
    @@subscription_count_by_instance[instance_id] -= 1 if @@subscription_count_by_instance[instance_id].present?

    return unless @@subscription_count_by_instance[instance_id]&.zero?

    @@subscription_count_by_instance.delete(instance_id)
    @@messages_by_instance.delete(instance_id)
  end
end
