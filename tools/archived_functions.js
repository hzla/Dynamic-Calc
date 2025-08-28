
function get_next_in_cfru() {
    // AI mon can kill = +4
    // AI mon does resist/immune to all moves = +4
    // AI mon can revenge kill = +2 (All of them added gives the highest score of +10)

    // AI mon hits super effective on player mon (Only counts if AI doesn't OH-KO) = +1
    // AI mon weak to one of your moves aka player got Super Effective move on AI mon = -1

    // Notes:
    // *AI mon can kill: The AI rolls, in this instance, between 93% and 100% of the maximum damage a move can do to you. 
    //  So over 50% chance to OHKO will be enough for the AI to always "see" a KO on you. 
    // *It’s either “resists/immune to all player’s moves” +4 or nothing, it’s not that each resisted move gives a +1! 
    // *A resisted move doing more than 50% to the AI isnt treated as such (no +4).
    // *It's -1 regardless of how many moves you have that are Super Effective to the AI's mon!
    // *If you OHKO with a neutral move, that’s not even a negative! (just a "0")
    // *Getting OHKO’d doesn’t matter to AI, only super effective moves do!
    // *Getting OHKO’d does play more of a role for AI Switching BEFORE they even lose a mon! 

    // A few (niche) additions to the SwitchInList:

    // AI mon Walls you = +2
    // This is a weaker statement than AI resists all moves. It applies when you hit the AI for neutral damage. 
    // The AIs defense also needs to be greater than your offense (If you are a special attacker, the AIs SpD > Your SpA, If you are a physical attacker, AIs Def > Your Att)
    // "revenge kill" where ai gives a mon a +2 score when a pokemon has an ability that boosts it's stats, has a trapping ability, and has a priority move that can kill your mon. 


    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var ranked_trainer_poks = []

    var scores = []
    var trainer_poks = CURRENT_TRAINER_POKS
    var trainer_poks_copy = JSON.parse(JSON.stringify(trainer_poks))
    
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 
    var player_pok = $('.set-selector.player')[1].value.substring(0, $('.set-selector.player')[1].value.indexOf(" ("))

    if (player_type2 == ""){
        player_type2 = player_type1
    }

    // get type chart
    var type_info = get_type_info([player_type1, player_type2])


    var currentHp = parseInt($('.current-hp').first().val())

    var p1info = $("#p1");
    var p2info = $("#p2");
    var p1 = createPokemon(p1info);

    var p1field = createField();
    var p2field = p1field.clone().swap();

    // Check for kills, revenge kills, and SE
    for (i in trainer_poks) {
        var score = 0
        var set_name = (' ' + trainer_poks[i]).slice(1)
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))
        var kills = false
        var revenge_kills = false
        var is_se = false
        var full_resist = true
        var is_weak = false
        var reasoning = ""
        var all_neutral = true
        var is_wall = false
        var kill_found = false


        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var pok_data = SETDEX_BW[pok_name][tr_name]

        p2 = createPokemon(trainer_poks[i].slice(0,-3))

        var all_results = calculateAllMoves(damageGen, p1, p1field, p2, p2field, false);
        var results = all_results[1]
        var player_results = all_results[0]


        for (let n = 0; n < 4; n++) {
            var dmg = 0

            if (typeof results[n].damage === 'number') {
                dmg = [results[n].damage]
            } else {
                dmg = results[n].damage
            }

            // add 4 if kills, add +2 if revenge kill
            if (can_kill(dmg, currentHp)) {
                var kills = true
                
                if (kill_found) {
                    reasoning += `killing with ${results[n].move.name}, `
                } else {
                    reasoning += `kills with ${results[n].move.name}, `
                }
                
                kill_found = true

                // if (["Moxie", "Soul Heart","Beast Boost", "Shadow Tag"].includes(p2.ability) ) {
                //     var revenge_kills = true
                //     reasoning += `+2 from boosting ability, `
                // }

                // if (p1.ability != "Levitate" && !p1.types.includes("Flying") && (p2.ability == "Arena Trap")) {
                //      var revenge_kills = true
                //     reasoning += `+2 from trapping ability, `
                // }

                // if (p2.ability == "Magnet Pull" && p1.types.includes("Steel")) {
                //     var revenge_kills = true
                //     reasoning += `+2 from Magnet Pull trap, `
                // }

                if (results[n].move.priority >= 1) {
                    var revenge_kills = true
                    reasoning += `priority kill with ${results[n].move.name}, `
                }
            } else { // add +1 if non kill and super effective
                if ( (results[n].move.category != "Status") && type_info[results[n].move.type] > 1 && !kills ) {
                    is_se = true
                    reasoning += `non kill super effective ${results[n].move.name}, `
                }
            }
        }

        var tr_types = p2.types
        if (tr_types.length == 1) {
            tr_types.push(p2.types[0])
        }

        // Check if trainer mon resists/immune all of player mon moves
        for (let n = 0; n < 4; n++) {
            if (p1.moves[0].category == "Status") {
                continue
            }

            if (tr_types[1] == "None") {
                tr_types[1] = tr_types[0]
            }
            
            var damages = player_results[n].damages
            var hp = player_results[n].originalCurHP

            if (can_chunk(damages, hp)) {
                full_resist = false
            }
            var trainer_type_info = get_type_info(tr_types)       
            var move_type = p1.moves[n].type
            if (trainer_type_info[move_type] >= 1) {              
                full_resist = false
                all_neutral = false
            }

            if (trainer_type_info[move_type] >= 2) {              
                is_weak = true
            }
        }

        if (full_resist) {
            reasoning += "full resist, "
        }

        if (is_weak) {
            reasoning += "weak to move, "
        }

        // check if trainer def > player highest offensive stat
        if (all_neutral) {
            var player_offense = 0
            var trainer_def = 0

            if (p1.rawStats.atk >= p1.rawStats.spa) {
                player_offense = p1.rawStats.atk 
                trainer_def = p2.rawStats.def
            } else {
                player_offense = p1.rawStats.spa
                trainer_def = p2.rawStats.spd
            }
            is_wall = (trainer_def > player_offense)
            if (is_wall) {
               reasoning += "walls you" 
            }         
        }

        
        // calculate final scores
        var pok_scores = {"kills": kills, "revenge_kills": revenge_kills, "is_se": is_se, "full_resist": full_resist, "is_weak": is_weak, "is_wall": is_wall}
        var score_mods = {"kills": 4, "revenge_kills": 2, "is_se": 1, "full_resist": 4, "is_weak": -1, "is_wall": 2}

        for (mod in score_mods) {
            if (pok_scores[mod]) {
               score += score_mods[mod]
            }
        }
        score -= (sub_index / 100) 

        // reasoning += `, Final Score: ${score}`

        ranked_trainer_poks.push([set_name, score, "", 0, pok_data.moves, 0, reasoning])
    }


    RR_SORTED = ranked_trainer_poks.sort(sort_trpoks)

    return RR_SORTED



}