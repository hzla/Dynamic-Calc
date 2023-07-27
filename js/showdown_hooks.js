function load_js() {

  var head= document.getElementsByTagName('head')[0];
  var script= document.createElement('script');
  script.src= './js/shared_controls.js?0b3ea005';
  head.appendChild(script);
}

function get_trainer_names() {
    var all_poks = SETDEX_BW
    var trainer_names = [] 

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]
           trainer_names.push(`${pok_name} (${trainer_name})[${sub_index}]`) 
        }      
    }
    return trainer_names
}

function get_custom_trainer_names() {
    var all_poks = setdex
    var trainer_names = [] 

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]

           if (poks[trainer_name]['ivs'] && poks[trainer_name]['ivs']['at'] > 0 && sub_index == 0) {
                trainer_names.push([poks[trainer_name]["level"], `${pok_name} (${trainer_name})[${sub_index}]`]) 
           }     
        }      
    }

    return trainer_names.sort(function (a,b) {
        if (a[0] < b[0]) {
            return -1
        }
        if (a[0] > b[0]) {
            return 1
        }
        return 0
    })
}

function get_similar_trainers() {
     if (typeof customLeads === "undefined") {
        return
    }

    var level = parseInt($("#levelR1").val())
    var similar = []
    for (n in customLeads) {
        if (customLeads[n][0] >= level && customLeads[n][0] <= level + 3) {
            var tr_info = customLeads[n][1].slice(0,-3)

            var tr_name = tr_info.split("(")[1].slice(0, -1)
            similar.push([tr_name, tr_info])
        }
    }
    return similar
}

function get_box() {
    var names = get_trainer_names()

    var box = []

    var box_html = ""

    for (i in names) {
        if (names[i].includes("My Box")) {
            box.push(names[i].split("[")[0])

            var pok_name = names[i].split(" (")[0].toLowerCase().replace(" ","-").replace(".","").replace(".","").replace("’","")
            var pok = `<img class="trainer-pok left-side" src="./img/newhd/${pok_name}.png" data-id="${names[i].split("[")[0]}">`

            box_html += pok
        }   
    }

    $('.player-poks').html(box_html)
    return box
}

function get_trainer_poks(trainer_name)
{
    var all_poks = SETDEX_BW
    var matches = []

    var og_trainer_name = trainer_name.split(/Lvl \d+ /)[1]

    console.log(trainer_name)

    if (og_trainer_name) {
        og_trainer_name = og_trainer_name.replace(/.?\)/, "")
    }

    console.log(og_trainer_name)
    for (i in TR_NAMES) {

        if (TR_NAMES[i].includes(og_trainer_name + " ")) {
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               matches.push(TR_NAMES[i])
            }    
        }
    }
    return matches
}





// only phase 1
function get_next_in_g3() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var type_names = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
             "Fighting", "Poison", "Ground", "Flying", "Psychic",
             "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","None"]

    var type_chart = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1,1],
            [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1,1],
            [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1,1],
            [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1,1],
            [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1,1],
            [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1,1],
            [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5,1],
            [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2,1],
            [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1,1],
            [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1,1],
            [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1,1],
            [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5,1],
            [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1,1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 0.5, 1,1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0,1],
            [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 0.5, 0.5,1],
            [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2,1],
            [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1,1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

    var ranked_trainer_poks = []
    

    var trainer_poks = CURRENT_TRAINER_POKS

    var trainer_poks_copy = JSON.parse(JSON.stringify(trainer_poks))
    var player_type1 = $('.type1').first().val()
    var player_type1_index = type_names.indexOf(player_type1)
    var player_type2 = $('.type2').first().val() 
    

    var player_pok = $('.set-selector.player')[1].value.substring(0, $('.set-selector.player')[1].value.indexOf(" ("))


    if (player_type2 == ""){
        player_type2 = player_type1
    }
    var player_type2_index = type_names.indexOf(player_type2)


    var dead_mon_type1 = $('.type1').last().val()
    var dead_mon_type2 = $('.type2').last().val()
    if (dead_mon_type2 == "") {
        dead_mon_type2 = dead_mon_type1
    }

    // get type chart
    var type_info = get_type_info([player_type1, player_type2])

    // get mons with SE moves and sort by type matchup and trainer order
    var se_mons = []
    var se_status_mons = []
    var stab_mons = []
    var se_indexes = []


    // check for se non status moves
    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var type1 = pokedex[pok_name]["types"][0]
        var type1_index = type_names.indexOf(type1)


        var type2 = pokedex[pok_name]["types"][1] || type1
        var type2_index = type_names.indexOf(type2)

        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        var effectiveness = 10

        effectiveness = Math.floor(effectiveness * type_chart[player_type1_index][type1_index])
        effectiveness = Math.floor(effectiveness * type_chart[player_type1_index][type2_index])
        effectiveness = Math.floor(effectiveness * type_chart[player_type2_index][type1_index])
        effectiveness = Math.floor(effectiveness * type_chart[player_type2_index][type2_index])


        // check moves for SE
        var isSE = false
        var isSEStatus = false
        var isStab = false
        var statusPushed = false
        var stabPushed = false


        // if has SE move, add to list of SE mons and break, if has SE status move, add to list of SE status mons and keep searching
        for (j in pok_data["moves"]) {

            var mov_data = moves[pok_data["moves"][j]]

            if (!mov_data) {
                continue
            }

            if (type_info[mov_data["type"]] >= 2) {
                if (mov_data['category'] == "Status") {
                    isSEStatus = true
                } else {
                    isSE = true
                }
            }

            if (mov_data["type"] == dead_mon_type1 || mov_data["type"] == dead_mon_type2 ) {
                isStab = true
            }

            if (isSE) {  
                se_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"]], effectiveness)
                se_indexes.push(sub_index)

                // remove from se_status if found se move after already pushing to se_status
                if (statusPushed) {
                    se_status_mons.pop()
                }
                if (stabPushed) {
                    stab_mons.pop()
                }
                break
            } else if (isSEStatus && !statusPushed) {
                se_status_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"]], effectiveness)
                statusPushed = true

                if (stabPushed) {
                    stab_mons.pop()
                }
               
            } else if (isStab) {
                stab_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"]], effectiveness)
                stabPushed = true
            }  else {

            }     
        }
    }
    return [se_mons, se_status_mons, stab_mons]
}

function get_next_in_g4() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var ranked_trainer_poks = []
    

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

    // get mons with SE moves and sort by type matchup and trainer order
    var se_mons = []
    var se_indexes = []

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var type1 = pokedex[pok_name]["types"][0]
        var type2 = pokedex[pok_name]["types"][1] || type1
        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        var effectiveness = type_info[type1] + type_info[type2]
        if (effectiveness == 8) {
            effectiveness = 1.75
        }
        // check moves for SE
        var isSE = false
        for (j in pok_data["moves"]) {
            var mov_data = moves[pok_data["moves"][j]]

            if (!mov_data) {
                continue
            }

            if (mov_data["type"] == "Ground" && "Skarmory,Aerodactyl,Zapdos,Crobat,Moltres".includes(player_pok)){
                isSE = true
            }

            if (mov_data["type"] == "Electric" && "Gastrodon,Swampert,Whishcash,Quagsire,Marshtomp".includes(player_pok)){
                isSE = true
            }

            if (player_pok == "Altaria" && mov_data["type"] == "Dragon") {
                isSE = true
            }

            if (player_pok == "Mawile" && mov_data["type"] == "Poison") {
                isSE = true
            }

            if (player_pok == "Girafarig" && mov_data["type"] == "Ghost") {
                isSE = true
            }

            if (type_info[mov_data["type"]] >= 2) {
                isSE = true
            }

            if ($("#abilityL1").val() == 'Levitate' && mov_data["type"] == "Ground") {
                isSE = false
            }

            if (isSE) {   
                se_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], effectiveness])
                se_indexes.push(sub_index)
                break
            }           
        }
    }

    // sort rest of mons by using other mons moves with current mon stats
    var other_mons = []

    var currentHp = parseInt($('.current-hp').first().val())

    var p1info = $("#p1");
    var p2info = $("#p2");
    var p1 = createPokemon(p1info);
    var p2 = createPokemon(p2info);
    var p1field = createField();
    var p2field = p1field.clone().swap();

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var type1 = pokedex[pok_name]["types"][0]
        var type2 = pokedex[pok_name]["types"][1] || type1
        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        if (se_indexes.includes(sub_index)) {
            continue
        }

        p2 = createPokemon(p2info, pok_data["moves"])
        var results = calculateAllMoves(4, p1, p1field, p2, p2field, false)[1];

        var highestDamage = 0
        for (n in results) {
            var dmg = 0
            if (typeof results[n].damage === 'number') {
                dmg = results[n].damage
            } else {
                dmg = results[n].damage[0]
            }
            // console.log(dmg)

            if (dmg > highestDamage) {
                highestDamage = dmg
            }
            if (highestDamage >= currentHp) {
                highestDamage = 1000
            }   
        }
        other_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], highestDamage])
    }
    console.log(se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4)))
    return(se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4)))
}

// check if ai mon has >= 50% chance kills player
function can_kill(damages, hp) {
    kill_count = 0
    for (n in damages) {
        if (damages[n] >= hp) {
            kill_count += 1
        }
    }
    return (kill_count >= 8)
}

// check if ai mon highest roll kills player
function can_topkill(damages, hp) {
    kill_count = 0
    for (n in damages) {
        if (damages[n] >= hp) {
            kill_count += 1
        }
    }
    return (kill_count > 0)
}

// check if player deals 50% or more to ai
function can_chunk(damages, hp) {
    var threshold = hp / 2
    var chunk_count = 0

    for (n in damages) {
        if (damages[n] >= threshold) {
            chunk_count += 1
        }
    }
    return (chunk_count >= 8)
}


function get_next_in_pkem() {

    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var ranked_trainer_poks = []

    var scores = []
    var trainer_poks = CURRENT_TRAINER_POKS
    var trainer_poks_copy = JSON.parse(JSON.stringify(trainer_poks))
    
    var currentHp = parseInt($('.current-hp').first().val())

    var p1info = $("#p1");
    var p2info = $("#p2");
    var p1 = createPokemon(p1info);
    var p1speed = parseInt(p1info.find(".totalMod").text())

    var p1field = createField();
    var p2field = p1field.clone().swap();


     for (i in trainer_poks) {
        var score = 0
        var set_name = (' ' + trainer_poks[i]).slice(1)
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))
        var kills = false
        var faster = false
        var reasoning = ""
        var gets_ohkod = false
        var highest_dmg_dealt = 0
        var highest_dmg_taken = 0
        var skip_player_calcs = false
        var skip_dmg_calcs = false


        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var pok_data = SETDEX_BW[pok_name][tr_name]

        
        console.log("%%%%%%%%%%")
        console.log(trainer_poks[i].slice(0,-3))
        p2 = createPokemon(trainer_poks[i].slice(0,-3))
        
        var all_results = calculateAllMoves(4, p1, p1field, p2, p2field, false);
        var results = all_results[1]
        var player_results = all_results[0]


        var p2speed = p2.rawStats.spe

        if ($('#tailwindR').is(':checked')) {
            p2speed = p2speed * 1.5
        }

        if (p2.rawStats.spe >= p1speed ) {
            faster = true
            score += 1
            reasoning += "Faster +1, "
        }

        // check rolls against trainer poks
        
        for (let n = 0; n < 4; n++) {
            var dmg = 0

            if (["Explosion", "Self-Destruct", "Final Gambit"].includes(player_results[n].move.name)) {
                continue
            }

            if (typeof player_results[n].damage === 'number') {
                dmg = [player_results[n].damage]
                
            } else {
                dmg = player_results[n].damage
                if (dmg[15] >= highest_dmg_taken) {
                    highest_dmg_taken = dmg[15]
                }
            }

            var tr_hp = p2.maxHP()
            // add 4 if kills, add +2 if revenge kill
            

            console.log([dmg, tr_hp])
            console.log(player_results[n])
            if (can_topkill(dmg, tr_hp) && !p2.hasItem('Focus Sash') && p2.ability != "Sturdy") {
                gets_ohkod = true
                score -= 3
                skip_player_calcs = true
                reasoning += `killed by ${player_results[n].move.name} -3, ` 
                break
                                    
            } 
        } 

        if (["Ditto", "Wynaut", "Wobbuffet"].includes(p2.species.name) && !skip_player_calcs) {
            score += 2
            reasoning = "Special Pok +2, "
            skip_player_calcs = true
        }


        //  check rolls against player pok        
        if (!skip_player_calcs) {
            for (let n = 0; n < 4; n++) {
                var dmg = 0

                if (["Explosion", "Self-Destruct", "Final Gambit"].includes(player_results[n].move.name)) {
                    continue
                }


                if (typeof results[n].damage === 'number') {
                    dmg = [results[n].damage]                    
                } else {
                    dmg = results[n].damage

                    if (dmg[15] >= highest_dmg_dealt) {
                        highest_dmg_dealt = dmg[15]
                    }
                }

                // add 4 if kills, add +2 if revenge kill
                if (can_topkill(dmg, currentHp)) {
                    var kills = true
                    score += 4
                    skip_dmg_calcs = true
                    reasoning += `${results[n].move.name} kills +4, `
                    break       
                } 
            }
        }
        
        highest_dmg_taken = highest_dmg_taken / p2.maxHP()
        highest_dmg_dealt = highest_dmg_dealt / p1.maxHP()

        if (highest_dmg_taken < highest_dmg_dealt && !skip_player_calcs && !skip_dmg_calcs) {
            score += 2
            reasoning += 'deals more dmg than taken +2, '
        }


        score -= (sub_index / 100) 
        reasoning += `Final Score: ${score}`
        ranked_trainer_poks.push([set_name, score, "", 0, pok_data.moves, 0, reasoning])
    }
    console.log(ranked_trainer_poks)
    RR_SORTED = ranked_trainer_poks.sort(sort_trpoks)
    return RR_SORTED
}



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
        var all_results = calculateAllMoves(4, p1, p1field, p2, p2field, false);
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
                    reasoning += `+4 killing with ${results[n].move.name}, `
                }
                
                kill_found = true

                if (["Moxie", "Soul Heart","Beast Boost", "Shadow Tag"].includes(p2.ability) ) {
                    var revenge_kills = true
                    reasoning += `+2 from boosting ability, `
                }

                if (p1.ability != "Levitate" && !p1.types.includes("Flying") && (p2.ability == "Arena Trap")) {
                     var revenge_kills = true
                    reasoning += `+2 from trapping ability, `
                }

                if (p2.ability == "Magnet Pull" && p1.types.includes("Steel")) {
                    var revenge_kills = true
                    reasoning += `+2 from Magnet Pull trap, `
                }

                if (results[n].move.priority >= 1) {
                    var revenge_kills = true
                    reasoning += `+2 from priority kill with ${results[n].move.name}, `
                }
            } else { // add +1 if non kill and super effective
                if ( (results[n].move.category != "Status") && type_info[results[n].move.type] > 1 && !kills ) {
                    is_se = true
                    reasoning += `+1 from non kill super effective ${results[n].move.name}, `
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
            reasoning += "+4 from full resist, "
        }

        if (is_weak) {
            reasoning += "-1 from being weak to move, "
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
               reasoning += "+2 from walling" 
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

        reasoning += `, Final Score: ${score}`

        ranked_trainer_poks.push([set_name, score, "", 0, pok_data.moves, 0, reasoning])
    }

    console.log(ranked_trainer_poks)
    RR_SORTED = ranked_trainer_poks.sort(sort_trpoks)

    return RR_SORTED



}

function get_current_in() {
    var setInfo = $('.set-selector')[3].value
    var pok_name = setInfo.split(" (")[0]
    var tr_name = setInfo.split(" (")[1].replace(")", "").split("[")[0]

    return SETDEX_BW[pok_name][tr_name]
}

function get_next_in() {
    console.log("refreshing switch ins")
    if (switchIn == 4) {
        return get_next_in_g4()
    }

    if (switchIn == 10) {
        return get_next_in_cfru()
    }

    if (switchIn == 11) {
        return get_next_in_pkem()
    }

    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var trainer_poks = CURRENT_TRAINER_POKS
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 

    if (player_type2 == ""){
        player_type2 = player_type1
    }

    var type_info = get_type_info([player_type1, player_type2])

    var ranked_trainer_poks = []

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var strongest_move_bp = 0
        var strongest_move = "None"
        var sub_index = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", "")



        var pok_data = SETDEX_BW[pok_name][tr_name]

        for (j in pok_data["moves"]) {
            var mov_data = moves[pok_data["moves"][j]]

            if (!mov_data) {
                continue
            }

            var bp = mov_data["bp"] * type_info[mov_data["type"]]
            
            if (bp > strongest_move_bp) {
                strongest_move_bp = bp
                strongest_move = pok_data["moves"][j]
            }
            else if (bp == strongest_move_bp) {
                strongest_move += (", " + pok_data["moves"][j])
            } else {

            }
        }
        ranked_trainer_poks.push([trainer_poks[i], strongest_move_bp, strongest_move, sub_index, pok_data["moves"]])
    }
    console.log(ranked_trainer_poks)
    return ranked_trainer_poks.sort(sort_trpoks)
}

function sort_trpoks(a, b) {
    if (a[1] === b[1]) {
        return (b[3] > a[3]) ? -1 : 1;
    }
    else {
        return (b[1] < a[1]) ? -1 : 1;
    }
}

function sort_trpoks_g4(a, b) {
    if (a[5] === b[5]) {
        return (b[3] > a[3]) ? -1 : 1;
    }
    else {
        return (b[5] < a[5]) ? -1 : 1;
    }
}

function get_type_info(pok_types) {
    if (pok_types[1] == pok_types[0]) {
        pok_types[1] = "None"
    }

    var type_name = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
             "Fighting", "Poison", "Ground", "Flying", "Psychic",
             "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","None"]

    var result = {}

    var types = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1,1],
            [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1,1],
            [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1,1],
            [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1,1],
            [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1,1],
            [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1,1],
            [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5,1],
            [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2,1],
            [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1,1],
            [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1,1],
            [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1,1],
            [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5,1],
            [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1,1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 1,1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0,1],
            [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 0.5,1],
            [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2,1],
            [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1,1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

    if (type_chart != 6) {
        types[13][16] = 1
        types[15][16] = 1
    }

    var type1 = type_name.indexOf(pok_types[0])
    var type2 = type_name.indexOf(pok_types[1])

    for (i in types) {
        result[type_name[i]] = (types[i][type1] * types[i][type2])
    }

    return result
}

$(document).ready(function() {
   params = new URLSearchParams(window.location.search)
   SETDEX_BW = null
   TR_NAMES = null

   SOURCES = {"9aa37533b7c000992d92": "Blaze Black/Volt White",
   "11c4eeca5a94f8edf413": "Blaze Black 2/Volt White 2 Redux",
   "945a33720dbd6bc04488": "Blaze Black 2/Volt White 2 Redux 1.4",
   "da1eedc0e39ea07b75bf": "Vintage White",
   "26138cc1d500b0cf7334": "Renegade Platinum",
   "6eaddfad52c62f0d869b": "Sacred Gold/Storm Silver",
   "9e7113f0ee22dad116e1": "Platinum Redux 5.2 TC6",
   "b6e2693147e215f10f4a": "Radical Red 3.02",
   "7a1ed35468b22ea01103": "Ancestral X",
   "8c3ca30ba346734d5e4f": "Run & Bun"
    }

    if (SOURCES[params.get('data')]) {
        TITLE = SOURCES[params.get('data')]
        $('.genSelection').hide()
        $('#rom-title').text(TITLE).show()
    }

    $(document).on('change', '.calc-select', function() {
        location.href = $('.calc-select option:selected').attr('data-source')
    })

    if (!params.get('data')) {return}

   npoint = `https://api.npoint.io/${params.get('data')}`

   if (params.get('data').includes("Pokeweb")) {
    npoint = `http://fishbowlweb.cloud:3000/${params.get('data').split("Pokeweb-")[1]}_calc.json`
   }
   jsonMoves = moves

   var g =  parseInt(params.get('gen'));
   $.get(npoint, function(data){
        npoint_data = data

        SETDEX_BW = data["formatted_sets"]
        SETDEX_ADV = data["formatted_sets"]
        SETDEX_DPP = data["formatted_sets"]
        SETDEX_SM = data["formatted_sets"]
        SETDEX_SS = data["formatted_sets"]
        SETDEX_XY = data["formatted_sets"]
        TR_NAMES = get_trainer_names()
        
        jsonMoves = data["moves"]
        var jsonMove

        if (!jsonMoves["Explosion"]["e_id"]){
            $("#show-ai").hide()
        }



        for (move in moves) {

            if (jsonMoves[move]) {
                jsonMove = jsonMoves[move]
            } else {
                continue //skip unsupported moves like hidden power
            }

            var move_id = move.replace(/-|,|'| /g, "").toLowerCase()

            if (move == '(No Move)') {
                continue
            }
            moves[move]["bp"] = jsonMove["basePower"]
            
            MOVES_BY_ID[g][move_id].basePower = jsonMove["basePower"]



            moves[move]["type"] = jsonMove["type"]
            MOVES_BY_ID[g][move_id].type = jsonMove["type"]

            moves[move]["category"] = jsonMove["category"]
            MOVES_BY_ID[g][move_id].category = jsonMove["category"]

            if (moves[move]["e_id"]) {
                moves[move]["e_id"] = jsonMove["e_id"]
            } 

            

            if (moves[move]["multihit"]) {
                moves[move]["multihit"] = jsonMove["multihit"]
            }
        }

        var jsonPoks = data["poks"]
        var jsonPok 
      
        for (pok in pokedex) {

            if (jsonPoks[pok]) {
                jsonPok = jsonPoks[pok]
            } else {
                continue //skip weird smogon pokemon and arceus forms
            }
            pokedex[pok]["bs"] = jsonPok["bs"]
            pokedex[pok]["types"] = jsonPok["types"]
        }
        load_js() 
        customSets = JSON.parse(localStorage.customsets);
        updateDex(customSets)   
        get_box()
        customLeads = get_custom_trainer_names()    
   })

   $(document).on('click', '.trainer-pok.right-side, .sim-trainer', function() {
        var set = $(this).attr('data-id')
        $('.opposing').val(set)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(set)
   })

   $(document).on('click', '.nav-tag', function() {
        var set = $(this).attr('data-next')
        $('.opposing').val(set)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(set)
   })




   $(document).on('click', '#show-mid', function() {
        $('.panel-mid').toggle()
        $('.panel:not(.panel-mid)').toggleClass('third')
   })

   $(document).on('click', '#show-ai', function() {
        $("#ai-container").toggle()

   })

   $(document).on('click', '.results-right label', function() {
        
        var move = $(".results-right .visually-hidden:checked + .btn").text()
        if (move == "") {
            return
        }

        var effect_code = parseInt(jsonMoves[move]["e_id"])
        console.log(effect_code)

        var ai_content = expertAI[effect_code]

        ai_html = ""
        
        ai_html += `<h2>${move} AI</h2><br>`

        for (n in ai_content) {
            ai_html += ai_content[n].replace("\t", "&ensp;")
            ai_html += "<br>"
        }
        $("#ai-container").html(ai_html)
   })

   $(document).on('click', '#img-toggle', function() {
        $('#battle-bg,.poke-sprite, #trainer-sprite').toggle()
   })




   $(document).on('keyup', '.current-hp, .percent-hp', function() {
        console.log("hp changed")
        refresh_next_in()
   })

   // $(document).click(function() {
   //      console.log("move selected")
   //      setTimeout(function(){$($('.set-selector')[1]).change()},100);   
   // })

   $(window).click(function(event) {

        if ($('.select2-drop:visible').length == 0) {
            console.log("changing")
           refresh_next_in()

        }
        
        
    });

   



   $(document).on('click', '.trainer-pok.left-side', function() {
        var set = $(this).attr('data-id')
        $('.player').val(set)

        $('.player').change()
        $('.player .select2-chosen').text(set)
        get_box()
   })

   
})