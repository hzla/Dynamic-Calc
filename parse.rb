require 'json'
require 'pry'

# sets = JSON.parse(File.read('rbsets.json'))


# formatted = {}


# sets.each do |pok, trainer|
# 	formatted[pok] ||= {}

# 	sets[pok].each do |tr, data|
# 		level = sets[pok][tr]["level"]
# 		set_name = "Lvl #{level} #{tr} "
# 		formatted[pok][set_name] = data
# 	end
# end

# File.write("formatted.json", formatted.to_json)


csv = File.read('rb.csv').split("\n")

sets = JSON.parse(File.read('formatted.json'))

tr_counts = {}

nf = {}

current_trainer = nil


i = 0



# "Lvl 23 Leader Roxanne ":{"level":23,"ability":"Aura Break","moves":["Thousand Arrows","Dragon Claw","Extreme Speed","Skitter Smack"],"nature":"Jolly","item":"Soft Sand"}

while i < csv.length do 
	line = csv[i]

	if line[0..3] == "Name" && !line.include?("&")




		p line
		battle_type = "Singles"

		current_trainer = line.split(",")[1].strip.split("[")[0].strip

		if tr_counts[current_trainer]
			tr_counts[current_trainer] += 1
			current_trainer += tr_counts[current_trainer].to_s

		else
			begin
				tr_counts[current_trainer] = 1
			rescue
				binding.pry
			end
		end

		mons = csv[i + 2][1..-1].split(",").compact
		levels = csv[i + 3][6..-1].split(",").compact
		items = csv[i + 4][10..-1].split(",").compact
		abilities = csv[i + 5][8..-1].split(",").compact
		natures = csv[i + 6][7..-1].split(",").compact


		move_1s = csv[i + 7][6..-1].split(",").compact
		move_2s = csv[i + 8][1..-1].split(",").compact
		move_3s = csv[i + 9][1..-1].split(",").compact
		move_4s = csv[i + 10][1..-1].split(",").compact

		if line.include?("Double")
			battle_type = "Doubles"
		end

		mons.each_with_index do |mon, j|
			break if mon == "" or mon == "\r"
			data = {}

			mon = mon.strip
			lvl = levels[j].strip.to_i

			item = items[j].strip
			ability = abilities[j].strip
			nature = natures[j].strip
			moves = []

			moves << move_1s[j].strip if move_1s[j] != ""
			moves << move_2s[j].strip if move_2s[j] != ""
			moves << move_3s[j].strip if move_3s[j] != ""
			moves << move_4s[j].strip if move_4s[j] != ""

			data["level"] = lvl
			data["ability"] = ability
			data["nature"] = nature
			data["moves"] = moves
			data["item"] = item
			data["sub_index"] = j
			data["battle_type"] = battle_type


			nf[mon] ||= {}
			set_name = "Lvl #{lvl} #{current_trainer} "
			nf[mon][set_name] = data
		end
	end

	if line[0..3] == "Name" && line.include?("&")

		p "#{line} doubles"
		battle_type = "Doubles"
		trainers = line.split(",")[1]

		trainer1 = trainers.split(" & ")[0]
		trainer2 = trainers.split(" & ")[1].split(" [")[0]

		mons = csv[i + 2][1..-1].split(",").compact
		levels = csv[i + 3][6..-1].split(",").compact
		items = csv[i + 4][10..-1].split(",").compact
		abilities = csv[i + 5][8..-1].split(",").compact
		natures = csv[i + 6][7..-1].split(",").compact


		move_1s = csv[i + 7][6..-1].split(",").compact
		move_2s = csv[i + 8][1..-1].split(",").compact
		move_3s = csv[i + 9][1..-1].split(",").compact
		move_4s = csv[i + 10][1..-1].split(",").compact

		mons1 = mons[0..2]
		mons2 = mons[3..5]
		all_mons = [mons1, mons2]
		[trainer1, trainer2].each_with_index do |tr, n|
			all_mons[n].each_with_index do |mon, k|
				break if mon == "" or mon == "\r"
				data = {}
				moves = []
				mon = mon.strip
				lvl = levels[k].strip.to_i
				item = items[k].strip
				ability = abilities[k].strip
				nature = natures[k].strip

				moves << move_1s[k].strip if move_1s[k] != ""
				moves << move_2s[k].strip if move_2s[k] != ""
				moves << move_3s[k].strip if move_3s[k] != ""
				moves << move_4s[k].strip if move_4s[k] != ""

				data["level"] = lvl
				data["ability"] = ability
				data["nature"] = nature
				data["moves"] = moves
				data["item"] = item
				data["sub_index"] = k
				data["battle_type"] = battle_type


				nf[mon] ||= {}
				set_name = "Lvl #{lvl} #{tr} "
				nf[mon][set_name] = data
			end
		end

	end




	

	
	i += 1
end

rb = JSON.parse(File.read('rb.json'))
rb["formatted_sets"] = nf

File.write('rb3.json', rb.to_json)



