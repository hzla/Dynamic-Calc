require 'json'

rr = File.read("rr.txt").split("\n")

sets = {}
pok = nil
sub_index = 0
trname = nil
last_trainer = nil
moves = []

rr.each_with_index do |line, i|
	if line and line[/\(.*?\)/] 
		level = 1
		nature = ""
		item = ""
		moves = []

		pok = line[/\(.*?\)/][1..-2]
		trname = line.split(" (")[0]
		item = line.split("@ ")[-1].strip

		level_found = false
		n = 0
		
		until level_found
			if rr[i + n].include?("Level:")
				level = rr[i + n].split("Level: ")[-1].strip
				trname = "Lvl #{level} #{trname}"
				level_found = true
			end
			n += 1
		end

		if trname == last_trainer
			sub_index += 1 
		else
			sub_index = 0
			last_trainer = trname
		end

		
		if !sets[pok] 
			sets[pok] = {}
		end 

		if !sets[pok][trname] 
			sets[pok][trname] = {}
		end

		sets[pok][trname]["item"] = item
		sets[pok][trname]["sub_index"] = sub_index
		sets[pok][trname]["level"] = level 
	end

	# if line.include?("Level:")
	# 	level = line.split("Level: ")[-1].to_i
	# 	sets[pok][trname]["level"] = level 
	# end

	if line.include?("Ability:")
		ability = line.split("Ability: ")[-1].strip
		sets[pok][trname]["ability"] = ability 
	end

	if line.include?(" Nature")
		nature = line.split(" Nature")[0].strip
		sets[pok][trname]["nature"] = nature 
	end

	if line.include?("- ") && !line.include?("(")
		moves << line.split("- ").last.strip
		sets[pok][trname]["moves"] = moves
	end
end


File.write("sets.json", sets.to_json)

# "Lvl 30 Lass Persephone ":{"level":30,"ai":0,"noCh":false,"tr_id":47,"ivs":{"hp":0,"at":0,"df":0,"sa":0,"sd":0,"sp":0},"battle_type":"Singles","reward_item":"None","item":"-","nature":"Brave","moves":["","","",""],"sub_index":2,"ability":"Unnerve","sprite":"trainer_sprites/lass.png","form":0,"evs":{"df":0}}









