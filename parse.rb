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

prev_mons = nil
prev_sets = nil

# "Lvl 23 Leader Roxanne ":{"level":23,"ability":"Aura Break","moves":["Thousand Arrows","Dragon Claw","Extreme Speed","Skitter Smack"],"nature":"Jolly","item":"Soft Sand"}

while i < csv.length do 
	line = csv[i]

	if line[0..3] == "Name" && !line.include?("&")


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
		curr_sets = []
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

			curr_sets << set_name
			
			if prev_mons and prev_sets
				p prev_sets
				data["prev"] = "#{prev_mons[0]} (#{prev_sets[0]})"
			end

			if prev_mons && j == 0

				prev_mons.each_with_index do |mn, idx|
					break if mn == "" or mn == "\r"
					mn = mn.strip
					p idx
					nf[mn][prev_sets[idx]]["next"] = "#{mon} (#{set_name})"
					
				end
				prev_mons = mons
			else
				prev_mons = mons
			end



			prev_set = set_name
			nf[mon][set_name] = data
		end
		prev_sets = curr_sets
	end

	if line[0..3] == "Name" && line.include?("&")

		p "#{line} doubles"
		battle_type = "Doubles"
		trainers = line.split(",")[1]

		trainer1 = trainers.split(" & ")[0]
		trainer2 = trainers.split(" & ")[1].split(" [")[0]



		if tr_counts[trainer1]
			tr_counts[trainer1] += 1
			trainer1 += tr_counts[trainer1].to_s

		else
			begin
				tr_counts[trainer1] = 1
			rescue
				binding.pry
			end
		end

		if tr_counts[trainer2]
			tr_counts[trainer2] += 1
			trainer2 += tr_counts[trainer2].to_s

		else
			begin
				tr_counts[trainer2] = 1
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

		mons1 = mons[0..2]
		mons2 = mons[3..5]

		t1 = nil
		t2 = nil

		curr_sets = []

		all_mons = [mons1, mons2]
		[trainer1, trainer2].each_with_index do |tr, n|
			all_mons[n].each_with_index do |mon, k|
				break if mon == "" or mon == "\r"
				data = {}
				moves = []
				mon = mon.strip
				lvl = levels[k + (3 * n)].strip.to_i
				item = items[k + (3 * n)].strip
				ability = abilities[k + (3 * n)].strip
				nature = natures[k + (3 * n)].strip

				moves << move_1s[k + (3 * n)].strip if move_1s[k + (3 * n)] != ""
				moves << move_2s[k + (3 * n)].strip if move_2s[k + (3 * n)] != ""
				moves << move_3s[k + (3 * n)].strip if move_3s[k + (3 * n)] != ""
				moves << move_4s[k + (3 * n)].strip if move_4s[k + (3 * n)] != ""

				data["level"] = lvl
				data["ability"] = ability
				data["nature"] = nature
				data["moves"] = moves
				data["item"] = item
				data["sub_index"] = k
				data["battle_type"] = battle_type


				nf[mon] ||= {}
				set_name = "Lvl #{lvl} #{tr} "

				curr_sets << set_name

				if n == 0
					t1 = "#{mon} (#{set_name})"
				else
					t2 = "#{mon} (#{set_name})"
				end
				
				
				offset = 0
				

				if prev_mons
					data["prev"] = "#{prev_mons[0]} (#{prev_sets[0]})"
				end

				if prev_mons && k == 0 && n == 0
					prev_mons.each_with_index do |mn, idx|
						if mn == "" or mn == "\r"
							offset += 1
							next 				
						end
						mn = mn.strip
						nf[mn][prev_sets[idx - offset]]["next"] = "#{mon} (#{set_name})"
					end
					prev_mons = mons
				else
					prev_mons = mons
				end

				prev_set = set_name


				nf[mon][set_name] = data
			end
		end
		prev_sets = curr_sets

		[trainer1, trainer2].each_with_index do |tr, n|
			all_mons[n].each_with_index do |mon, k|
				break if mon == "" or mon == "\r"
				data = {}
				mon = mon.strip
				lvl = levels[k + (3 * n)].strip.to_i

				set_name = "Lvl #{lvl} #{tr} "
				nf[mon][set_name]["partner"] = n == 0 ? t2 : t1
			end
		end

	end

	
	i += 1
end

rb = JSON.parse(File.read('rb.json'))
rb["formatted_sets"] = nf

File.write('rb3.json', rb.to_json)



