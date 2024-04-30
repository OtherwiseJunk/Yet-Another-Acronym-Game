module GamePhases
    UNSTARTED = 0
    SUBMITTING = 1
    VOTING = 2
    RESULTS = 3
end

class GameState
    include GamePhases
    attr_reader :round_number, :current_acronym, :scores, :submissions, :game_phase, :players, :round_time_remaining, :votes
    @@alphabet = ('a'..'z').to_a

    def initialize(player)
        @players = [player]
        @scores = Hash.new
        @game_phase = UNSTARTED
        @round_number = 0
    end

    def generate_new_acronym(round)
        acronym = ''
        acronym_length = acronym_length_by_round round

        for _ in (1..acronym_length)
            acronym << @@alphabet.sample
        end

        acronym
    end

    def start_game
        # test_string = "Some Test Text That Is Exactly Twelve Words, Because I wanna see!"
        # test_user_data ={"avatarUrl"=>"https://1219391019515121716.discordsays.com/assets/yak.png", "decorationUrl"=>"", "displayName"=>"Test Idiot"}
        @round_number += 1
        @current_acronym = generate_new_acronym(@round_number)
        @game_phase = SUBMITTING
        @round_time_remaining = 60
        @submissions = Hash.new
    end

    def add_player_to_game(player)
        @players << player
    end

    def remove_player_from_game(player)
        @players.delete player
    end

    def next_phase()
        # based on current phased, a little counter-intuitively
        case @game_phase
        when SUBMITTING
            @round_time_remaining = 20
            @game_phase = VOTING
            @votes = Hash.new
        when VOTING
            @game_phase = RESULTS
            @round_time_remaining = 0
        else
            puts "oh fuck."
        end
    end

    def handle_player_vote()
    end

    def round_second_elapsed
        @round_time_remaining -= 1
    end

    def handle_player_submission(discordId, submissionData)
        @submissions[discordId] = UserSubmission.new(submissionData['submission'], 60-@round_time_remaining, submissionData['user_data'])
    end

    private
    attr_writer :round_number, :current_acronym, :scores, :submissions, :game_phase, :players, :round_time_remaining, :votes

    def acronym_length_by_round(round)
        acronym_length = 0

        case round
        when 1..3
            acronym_length = rand(3..5)
        when 4..7
            acronym_length = rand(5..8)
        else
            acronym_length = rand(9..12)
        end

        acronym_length
    end
end
