module GamePhases
    UNSTARTED = 0
    SUBMITTING = 1
    VOTING = 2
    RESULTS = 3
end

class GameState
    include GamePhases
    attr_reader :round_number, :current_acronym, :scores, :game_phase, :players
    @@alphabet = ('a'..'z').to_a

    def initialize(player)
        @players = [player]
        @scores = Hash.new
        @game_phase = UNSTARTED
    end

    def generate_new_acronym(round)
        acronym = ''
        acronym_length = acronym_length_by_round round

        for i in (1..acronym_length)
            acronym << @@alphabet.sample
        end

        acronym
    end

    def start_game
        @round_number = 1
        @current_acronym = generate_new_acronym(@round_number)
        @game_phase = SUBMITTING
    end

    def add_player_to_game(player)
        @players << player
    end

    def remove_player_from_game(player)
        @players.delete player
    end

    private
    attr_writer :round_number, :current_acronym, :scores, :game_phase, :players

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