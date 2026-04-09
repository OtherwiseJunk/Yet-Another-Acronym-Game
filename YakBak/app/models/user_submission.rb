class UserSubmission
  attr_accessor :submission, :answer_time, :user_data

  def initialize(submission, answer_time, user_data)
    @submission = submission
    @answer_time = answer_time
    @user_data = user_data
  end

  def to_hash
    {
      "submission" => @submission,
      "answer_time" => @answer_time,
      "user_data" => @user_data
    }
  end

  def self.from_hash(hash)
    new(hash["submission"], hash["answer_time"], hash["user_data"])
  end
end
