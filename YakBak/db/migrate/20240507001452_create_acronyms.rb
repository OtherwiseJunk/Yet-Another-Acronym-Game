class CreateAcronyms < ActiveRecord::Migration[7.1]
  def change
    create_table :acronyms do |t|
      t.string :acronym

      t.timestamps
    end
  end
end
