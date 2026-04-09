class RedisGameStore
  KEY_PREFIX = "yaag:game:"
  SUB_PREFIX = "yaag:subs:"

  def self.get(instance_id)
    data = REDIS.get("#{KEY_PREFIX}#{instance_id}")
    return nil unless data

    GameState.from_hash(JSON.parse(data))
  end

  def self.set(instance_id, game_state)
    REDIS.set("#{KEY_PREFIX}#{instance_id}", JSON.generate(game_state.to_hash))
  end

  def self.delete(instance_id)
    REDIS.del("#{KEY_PREFIX}#{instance_id}")
  end

  def self.exists?(instance_id)
    REDIS.exists?("#{KEY_PREFIX}#{instance_id}")
  end

  def self.increment_subscriptions(instance_id)
    REDIS.incr("#{SUB_PREFIX}#{instance_id}")
  end

  def self.decrement_subscriptions(instance_id)
    REDIS.decr("#{SUB_PREFIX}#{instance_id}")
  end

  def self.subscription_count(instance_id)
    REDIS.get("#{SUB_PREFIX}#{instance_id}").to_i
  end

  def self.delete_subscriptions(instance_id)
    REDIS.del("#{SUB_PREFIX}#{instance_id}")
  end
end
