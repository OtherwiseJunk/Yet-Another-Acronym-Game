class UserSubmission
  attr_accessor :submission, :answer_time

  def initialize(submission, answer_time, user_data)
    @submission = submission
    @answer_time = answer_time
    @user_data = user_data
  end
end
