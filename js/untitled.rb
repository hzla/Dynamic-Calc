def rename_files(folder_path)
  # Get a list of all files in the folder
  files = Dir.entries(folder_path).select {|f| !File.directory? f}

  # Regular expression to match the pattern "32px-Bag_..._SV_Sprite.png"
  pattern = /24px-Dream_(\w+)_Sprite.png/

  # Iterate over each file and rename it
  files.each do |file|
    if match = pattern.match(file)
      new_filename = "#{match[1].downcase}.png"
      File.rename(File.join(folder_path, file), File.join(folder_path, new_filename))
      puts "Renamed #{file} to #{new_filename}"
    end
  end
end

# Example usage:
folder_path = "../img/items"
rename_files(folder_path)