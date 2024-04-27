class UserSubmission
  attr_accessor :submission, :answer_time

  def initialize(submission, answer_time)
    @submission = submission
    @answer_time = answer_time
  end
end
