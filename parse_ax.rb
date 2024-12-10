require 'json'

trdata = JSON.parse(File.read('trdata.json'))

route_names = [
    "Aquacorde Town",
    "Route 2",
    "Santalune Forest",
    "Route 3",
    "Route 22",
    "Santalune City",
    "Santalune Gym",
    "Route 4",
    "Lumiose City",
    "Route 5",
    "Route 6 - Pathway",
    "Route 6 - West",
    "Route 6 - East",
    "Route 7",
    "Connecting Cave",
    "Route 8 - Upper",
    "Glittering Cave",
    "Route 8 - Lower",
    "Cyllage Gym",
    "Route 10",
    "Geosenge Town",
    "Route 11",
    "Reflection Cave - 1F",
    "Reflection Cave - B1F",
    "Tower of Mastery",
    "Shalour Gym",
    "Route 12",
    "Azure Bay",
    "Coumarine City",
    "Coumarine Gym",
    "Route 13",
    "Kalos Power Plant",
    "Lumiose Gym",
    "Route 14",
    "Laverre Gym",
    "Poke Ball Factory",
    "Route 15",
    "Route 16",
    "Lost Hotel - Route 15 Side",
    "Lost Hotel - Route 16 Side",
    "Frost Cavern - Outside",
    "Frost Cavern - 1F",
    "Frost Cavern - 2F",
    "Frost Cavern - 3F",
    "Anistar City",
    "Anistar Gym",
    "Lysandre Cafe",
    "Lysandre Labs - B1",
    "Lysandre Labs - B3",
    "Geosenge Town - Part 2",
    "Team Flare Secret HQ - 1F",
    "Team Flare Secret HQ - Walkway",
    "Route 18",
    "Terminus Cave - B1F",
    "Terminus Cave - B2F",
    "Couriway Town",
    "Route 19",
    "Route 20",
    "Snowbelle Gym",
    "Route 21",
    "Route 22 - Part 2",
    "Victory Road - Entrance",
    "Victory Road - Inside 1",
    "Victory Road - Outside 2",
    "Victory Road - Inside 2",
    "Victory Road - Outside 3",
    "Victory Road - Inside 3",
    "Victory Road - Outside 4",
    "Victory Road - Inside 4",
    "Elite Four",
    "Kalos League Champion",
    "Lumiose Parade"
]

tr_ids = []

route_names.each do |route|
    trdata[route]["Trainers"].each do |tr|
        tr_ids << tr["TrainerID"]
    end
end

File.open('tr_ids.txt', 'w') do |file|
  tr_ids.each do |id|
    file.puts(id)
  end
end