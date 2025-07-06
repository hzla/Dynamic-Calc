# Converts a line separated list of trainer ids into json for creating next/prev buttons in dynamic calc

require 'json'

tr_ids = File.readlines('./tr_ids.txt')


orders = {}

current = nil
prev = nil

tr_ids.each_with_index do |line, i|
	id = line.split(" (")[0].strip
	orders[id] = {"id" => id.to_i}

	if i == 0
		orders[id]["prev"] = nil
	else
		orders[id]["prev"] = tr_ids[i - 1].split(" (")[0].strip.to_i
	end

	if i < tr_ids.length - 1
		orders[id]["next"] = tr_ids[i + 1].split(" (")[0].strip.to_i
	end
end

File.write('./orders.json', orders.to_json)