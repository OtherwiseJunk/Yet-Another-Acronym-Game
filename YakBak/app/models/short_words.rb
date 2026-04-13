# frozen_string_literal: true

require 'json'

# Valid English words that are 1-2 characters long.
# Words shorter than 3 characters must appear in this set to be accepted in submissions.
# Sourced from shared/short_words.json (single source of truth for frontend + backend).
module ShortWords
  SHARED_PATH = File.expand_path('../../shared/short_words.json', __dir__)

  VALID = Set.new(JSON.parse(File.read(SHARED_PATH))).freeze

  def self.valid_word_length?(word)
    return true if word.length >= 3

    VALID.include?(word.downcase)
  end
end
