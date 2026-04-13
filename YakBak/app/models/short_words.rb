# frozen_string_literal: true

# Valid English words that are 1-2 characters long.
# Words shorter than 3 characters must appear in this set to be accepted in submissions.
# This is the single source of truth — the frontend receives this list on connect.
module ShortWords
  VALID = Set.new(%w[
    a i
    ah am an as at aw ax ba be by do eh em ew gi go
    ha he hi hm ho id if in is it ki lo ma me my no
    of oh oi ok on or ow ox pa pi qi sh so ta to uh
    um up us we ya ye
  ]).freeze

  def self.valid_word_length?(word)
    return true if word.length >= 3

    VALID.include?(word.downcase)
  end
end
