class CreateSubmissions < ActiveRecord::Migration[7.1]
  def change
    create_table :submissions do |t|
      t.string :game_id
      t.integer :discord_user, :limit => 8
      t.string :submission
      t.integer :guess_seconds
      t.references :acronym, null: false, foreign_key: true

      t.timestamps
    end
  end
end
