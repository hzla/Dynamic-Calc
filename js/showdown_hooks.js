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

function abv(s) {
    if (s.length >= 10 && $('.player-party').width() <= 800 ) {
        if (s.split(" ")[1]) {
            return (s.split(" ")[0][0] + " " + s.split(" ")[1])
        } else {
            return s.slice(0,9)
        }
        
    } else {
        return s
    }
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

    var og_trainer_name = trainer_name.split(/Lvl [-+]?\d+ /)[1]



    if (og_trainer_name) {
        og_trainer_name = og_trainer_name.replace(/.?\)/, "")
    }

    console.log(trainer_name)
    console.log(og_trainer_name)

    for (i in TR_NAMES) {

        if (TR_NAMES[i].includes(og_trainer_name + " ")) {
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               matches.push(TR_NAMES[i])
            }    
        }
    }

    if (matches.length == 0) {
        for (i in TR_NAMES) {

            if (TR_NAMES[i].includes(og_trainer_name)) {
                
                if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   matches.push(TR_NAMES[i])
                }    
            }
        }
    }
    return matches
}

function box_rolls() {
    var box = get_box()

    var dealt_min_roll = $("#min-dealt").val()
    var taken_max_roll = $("#max-taken").val()

    if ($("#min-dealt").val() == "" && $("#max-taken").val() == "") {
        return
    }


    if ($("#min-dealt").val() == "") {
        $("#min-dealt").val(100)
        dealt_min_roll=100
    } 

    if ($("#max-taken").val() == "") {
        $("#max-taken").val(0)
        taken_max_roll=0
    }

    

    $('.killer').removeClass('killer')
    $('.defender').removeClass('defender')

    var p1field = createField();
    var p2field = p1field.clone().swap();

    var p1info = $("#p2");
    var p1 = createPokemon(p1info);
    var p1hp = $('#p2').find('#currentHpL1').val()
    var p1speed = parseInt($('.total.totalMod')[1].innerHTML)



    var killers = []
    var defenders = []
    var faster = []



    for (m = 0; m < box.length; m++) {
        var mon = createPokemon(box[m])
        var monSpeed = mon.rawStats.spe

        if (monSpeed > p1speed) {
            faster.push({"set": box[m]})
            $(`.trainer-pok[data-id='${box[m]}']`).addClass('faster')
        }

        var monHp = mon.originalCurHP

        var all_results = calculateAllMoves(damageGen, p1, p1field, mon, p2field, false);
        var opposing_results = all_results[0]
        var player_results = all_results[1]

        var defend_count = 0



        

        for (j = 0; j < 4; j++) {
            player_dmg = player_results[j].damage

            if (can_kill(player_dmg, p1hp * dealt_min_roll / 100)) {
                killers.push({"set": box[m], "move": player_results[j].move.originalName})
                $(`.trainer-pok[data-id='${box[m]}']`).addClass('killer')
            }

            opposing_dmg = opposing_results[j].damage

            if (!can_kill(opposing_dmg, monHp * taken_max_roll / 100)) {
                defend_count += 1
                if (defend_count == 4) {
                    defenders.push({"set": box[m], "move": opposing_results[j].move.originalName})
                    $(`.trainer-pok[data-id='${box[m]}']`).addClass('defender')
                }         
            }
        }
    }


    return {"killers": killers, "defenders": defenders, "faster": faster}
    
}





// only phase 1
function get_next_in_g3() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var type_names = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
             "Fighting", "Poison", "Ground", "Flying", "Psychic",
             "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","???"]

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

    return se_mons.concat(se_status_mons).concat(stab_mons)
    // [se_mons, se_status_mons, stab_mons]
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
    // console.log(type_info)

    // get mons with SE moves and sort by type matchup and trainer order
    var se_mons = []
    var se_indexes = []

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        if (!pokedex[pok_name]) {
            continue
        }
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

            if (!invert) {
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
        var results = calculateAllMoves(damageGen, p1, p1field, p2, p2field, false)[1];


        var highestDamage = 0
        for (n in results) {
            var dmg = 0
            if (typeof results[n].damage === 'number') {
                dmg = results[n].damage
            } else {
                dmg = results[n].damage[0]
            }


            if (dmg > highestDamage && results[n].move.name != "Sonic Boom" && results[n].move.name != "Dragon Rage" && results[n].move.name != "Night Shade" && results[n].move.name != "Seismic Toss" ) {
                highestDamage = dmg
            }
            if (highestDamage >= currentHp) {
                highestDamage = 1000
            }   
        }
        other_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], highestDamage])
    }

    // console.log(se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4)))

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
    return (kill_count >= 16)
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
        
        var gets_ohkod = false
        var highest_dmg_dealt = 0
        var highest_dmg_taken = 0
        var skip_player_calcs = false
        var skip_dmg_calcs = false


        var pok_name = trainer_poks[i].split(" (")[0]
        var reasoning = `${pok_name}: `
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var pok_data = SETDEX_BW[pok_name][tr_name]

        

        p2 = createPokemon(trainer_poks[i].slice(0,-3))

        
        var all_results = calculateAllMoves(damageGen, p1, p1field, p2, p2field, false);
        var results = all_results[1]
        var player_results = all_results[0]


        var p2speed = p2.rawStats.spe

        if ($('#tailwindR').is(':checked')) {
            p2speed = p2speed * 1.5
        }

        if (p2.rawStats.spe >= p1speed ) {
            faster = true
            score += 1
            reasoning += "Faster, "
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
            


            if (can_topkill(dmg, tr_hp) && !p2.hasItem('Focus Sash') && p2.ability != "Sturdy") {
                gets_ohkod = true
                score -= 3
                // skip_player_calcs = true
                reasoning += `killed by ${player_results[n].move.name}, ` 
                // break
                                    
            } 
        } 

        if (["Ditto", "Wynaut", "Wobbuffet"].includes(p2.species.name) && !skip_player_calcs) {
            score += 2
            // reasoning = "Special Pok +2, "
            skip_player_calcs = true
        }


        //  check rolls against player pok        
        if (true) {
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
                    reasoning += `${results[n].move.name} kills, `
                    // break       
                } 
            }
        }
        
        highest_dmg_taken = highest_dmg_taken / p2.maxHP()
        highest_dmg_dealt = highest_dmg_dealt / p1.maxHP()

        if (highest_dmg_taken < highest_dmg_dealt && !skip_player_calcs && !skip_dmg_calcs) {
            score += 2
            // reasoning += 'deals more dmg than taken, '
        }


        score -= (sub_index / 100) 
        // reasoning += `Final Score: ${score}`
        ranked_trainer_poks.push([set_name, score, "", 0, pok_data.moves, 0, reasoning])
    }

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

function get_current_in() {
    var setInfo = $('.set-selector')[3].value
    var pok_name = setInfo.split(" (")[0]
    var tr_name = setInfo.split(" (")[1].replace(")", "").split("[")[0]

    // box_rolls()
    return SETDEX_BW[pok_name][tr_name]
}

function get_current_learnset() {
    var pok_name = createPokemon($("#p1")).name
    if (pok_name.includes("-Mega")) {
        pok_name = pok_name.split("-Mega")[0]
    } 
    current_learnset = npoint_data['poks'][pok_name]["learnset_info"]
    


    if (!current_learnset) {
        $("#learnset-show").hide()
        return
    }

    var ls_html = ""

    for (let i = 0; i < current_learnset["learnset"].length; i++) {
        var lvl = current_learnset["learnset"][i][0]
        var mv_name = current_learnset["learnset"][i][1]
        ls_html += `<div class='ls-row'><div class='ls-level'>${lvl}</div><div class='ls-name'>${mv_name}</div></div>`
    }
    $(".lvl-up-moves").html(ls_html)

    var tm_html = ""

    if (current_learnset["tms"]) {
        for (let i = 0; i < current_learnset["tms"].length; i++) {
            var mv_name = current_learnset["tms"][i]
            tm_html += `<div class='ls-row'><div class='ls-name'>${mv_name}</div></div>`
        }

    }
    
    $(".tms").html(tm_html)

    return current_learnset    
}



function get_next_in() {

    if (switchIn == 4) {
        return get_next_in_g4()
    }

    if (switchIn == 10) {
        return get_next_in_cfru()
    }

    if (switchIn == 11) {
        return get_next_in_pkem()
    }

    if (switchIn == 3) {
        return get_next_in_g3()
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

    ranked_trainer_poks.sort(sort_trpoks)
    
    // Auto-sorts Megas to come out last - this should only run on switchIn=5
    var endSwap = null
    var foundMega = false
    for (var i = 0; i < ranked_trainer_poks.length; i++) {
        if (foundMega) {
            if (i == ranked_trainer_poks.length - 1)
                ranked_trainer_poks[i - 1] = endSwap
            else
                ranked_trainer_poks[i - 1] = ranked_trainer_poks[i]
        }
      
        if (ranked_trainer_poks[i][0].includes("-Mega")) {
            endSwap = ranked_trainer_poks[ranked_trainer_poks.length - 1]
            ranked_trainer_poks[ranked_trainer_poks.length - 1] = ranked_trainer_poks[i]
            foundMega = true
        }
    }
    
    // console.log(ranked_trainer_poks)
    return ranked_trainer_poks
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


function construct_type_chart() {
    var type_names = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
             "Fighting", "Poison", "Ground", "Flying", "Psychic",
             "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","???"]

    var types = TYPES_BY_ID[type_chart]
    var chart = []

    for (i = 0; i < type_names.length; i++) {
        var effectiveness = []

        for (j = 0; j < type_names.length; j++) {
            effectiveness.push(types[type_names[i].toLowerCase().replace("???", "")].effectiveness[type_names[j]])
        }
        chart.push(effectiveness)
    }

    return chart

}

function get_type_info(pok_types) {
    if (pok_types[1] == pok_types[0]) {
        pok_types[1] = "None"
    }

    var type_name = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
                 "Fighting", "Poison", "Ground", "Flying", "Psychic",
                 "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","None"]

    var result = {}

    if (typeof final_type_chart !== 'undefined') {
        var types = final_type_chart

    } else {

        

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

        if (type_chart < 6) {
            types[13][16] = 0.5
            types[15][16] = 0.5
        } else {
           types[13][16] = 1
            types[15][16] = 1 
        }
    }
   
    var type1 = type_name.indexOf(pok_types[0])
    var type2 = type_name.indexOf(pok_types[1])


    for (i in types) {
        if (invert) {
            if (type1 == -1) {
                return result
            }
            
            var matchup1 = types[i][type1]
            var matchup2 = types[i][type2]

            if (matchup1 == 0) {
                matchup1 = 0.5
            }

            if (matchup2 == 0) {
                matchup2 = 0.5
            }
            result[type_name[i]] = (1 / (matchup1 * matchup2))
        } else {
          
          result[type_name[i]] = (types[i][type1] * types[i][type2])  
        }
        
    }

    return result
}

function loadDataSource(data) {
    SETDEX_BW = data["formatted_sets"]
    SETDEX_ADV = data["formatted_sets"]
    SETDEX_DPP = data["formatted_sets"]
    SETDEX_SM = data["formatted_sets"]
    SETDEX_SS = data["formatted_sets"]
    SETDEX_XY = data["formatted_sets"]
    setdex = data["formatted_sets"]

    TR_NAMES = get_trainer_names()
    if ('move_replacements' in data) {
        CHANGES = data['move_replacements']
    } else {
        CHANGES = {}
    }

    moveChanges["NONE"] = CHANGES

    
    jsonMoves = data["moves"]
    customMoves = data["custom_moves"]
    var jsonMove

    if (!jsonMoves["Fire Blast"]["e_id"]){
        $("#show-ai").hide()
    }


    // moves = data["moves"]
    // pokedex = data["poks"]
    console.log("loaded custom poks data")


    

    for (move in moves) {

        var move_id = move.replace(/-|,|'|’| /g, "").toLowerCase()

        if (jsonMoves[move]) {
            jsonMove = jsonMoves[move]
        } else {
            moves[move] = jsonMoves[move]
            continue //skip unsupported moves like hidden power
        }

        
        

        if (move == '(No Move)') {
            continue
        }
        moves[move]["bp"] = jsonMove["basePower"]
        
        // console.log(move_id)
        MOVES_BY_ID[g][move_id].basePower = jsonMove["basePower"]



        moves[move]["type"] = jsonMove["type"]
        MOVES_BY_ID[g][move_id].type = jsonMove["type"]

        
        if (jsonMove["category"]) {
           moves[move]["category"] = jsonMove["category"]
            MOVES_BY_ID[g][move_id].category = jsonMove["category"] 
        }
        

        if (moves[move]["e_id"]) {
            moves[move]["e_id"] = jsonMove["e_id"]
        } 

        

        if (moves[move]["multihit"]) {
            moves[move]["multihit"] = jsonMove["multihit"]
        }
    }

    for (move in jsonMoves) {
        
        // if defined in showdown move lis
        if (moves[move]) {
        } else {
            // custom move
            jsonMoves[move]["flags"] = {}

            moves[move] = jsonMoves[move]
            moves[move]["bp"] = jsonMoves[move]["basePower"]

            MOVES_BY_ID[8][move.replace(/-|,|'|’| /g, "").toLowerCase()] = jsonMoves[move]
        }
    }

    var jsonPoks = data["poks"]
    var jsonPok 
    


    if (jsonPoks["Bulbasaur"]["learnset_info"]) {
        $('#learnset-show').show()
    }

    if ( TITLE.includes("Platinum") ) {
        var rotom_info = [["Heat", "Fire"],["Wash", "Water"],["Mow", "Grass"],["Frost", "Ice"],["Fan", "Flying"]]
        
        for (let i = 0; i < rotom_info.length; i++) {
            pokedex[`Rotom-${rotom_info[i][0]}-Glitched`] = {
                "types": [
                    "Electric",
                    rotom_info[i][1]
                ],
                "bs": {
                    "at": 50,
                    "df": 77,
                    "hp": 50,
                    "sa": 95,
                    "sd": 77,
                    "sp": 101
                },
                "weightkg": 0.3,
                "abilities": {
                    "0": "Levitate"
                },
                "gender": "N"
            }
        }
        


    }

    for (pok in pokedex) {

        if (pok.includes("Glitched")) {
            continue
        }
        if (jsonPoks[pok]) {
            jsonPok = jsonPoks[pok]
            // console.log(jsonPok)
        } else {
            console.log("skipping")
            continue //skip weird smogon pokemon and arceus forms
        }
        pokedex[pok]["bs"] = jsonPok["bs"]
        pokedex[pok]["types"] = jsonPok["types"]
        if (jsonPok.hasOwnProperty("abilities"))
            pokedex[pok]["abilities"] = jsonPok["abilities"]

    }
// TITLE.includes("Platinum")
    
    load_js() 

    if (localStorage.customsets) {
        console.log("loading box")
        customSets = JSON.parse(localStorage.customsets);
        updateDex(customSets)   
        get_box()
    }
    
    customLeads = get_custom_trainer_names()
    if (customMoves) {
        for (move in customMoves) {
            moves[move] = customMoves[move]
            moves[move]["bp"] = customMoves[move]["basePower"]

            MOVES_BY_ID[8][move.replace(/-|,|'|’| /g, "").toLowerCase()] = customMoves[move]
            console.log(moves[move])
        }
    }
    moves['(No Move)'] = {
        "bp": 0,
        "category": "Status",
        "type": "Normal"
    }

    
}


params = new URLSearchParams(window.location.search);
g = params.get('gen');
damageGen = parseInt(params.get('dmgGen'))
type_chart = parseInt(params.get('types'))
type_mod = params.get('type_mod')
switchIn = parseInt(params.get('switchIn'))
challengeMode = params.get('challengeMode')
misc = params.get('misc')
invert = params.get('invert')
DEFAULTS_LOADED = false
analyze = false


if (switchIn != 11) {
    $('#toggle-analysis').addClass('gone')
}  

$(document).ready(function() {
   params = new URLSearchParams(window.location.search)
   SETDEX_BW = null
   TR_NAMES = null
   BACKUP_MODE = params.get('backup')

   SOURCES = {"9aa37533b7c000992d92": "Blaze Black/Volt White",
   "04770c9a89687b02a9f5": "Blaze Black 2/Volt White 2 Original",
   "945a33720dbd6bc04488": "Blaze Black 2/Volt White 2 Redux 1.4",
   "da1eedc0e39ea07b75bf": "Vintage White",
   "26138cc1d500b0cf7334": "Renegade Platinum",
   "03e577af7cc9856a1f42": "Sacred Gold/Storm Silver",
   "9e7113f0ee22dad116e1": "Platinum Redux 5.2 TC6",
   "b6e2693147e215f10f4a": "Radical Red 3.02",
   "7a1ed35468b22ea01103": "Ancestral X",
   "8c3ca30ba346734d5e4f": "Run & Bun",
   "f109940e5639c3702e6d": "Rising Ruby/Sinking Saphire",
   "00734d33040067eb7e9f": "Grand Colloseum 2.0",
   "24bbfc0e69ff4a5c006b": "Emerald Kaizo",
   "13fc25a3b19071978dd6": "Platinum",
   "be0a4fedbe0ff31e47b0": "Heart Gold/Soul Silver",
   "78381c312866ee2e6ff9": "Black/White",
   "83c196dce6759252b3f4": "Black 2/White 2",
   "8d1ab90a3b3c494d8485": "Eternal X/Wilting Y Insanity Rebalanced",
   "68bfb2ccba14b7f6b1f0": "Inclement Emerald",
   "e9030beba9c1ba8804e8": "Kaizo Colloseum",
   "6875151cfa5eea00eafa": "Inclement Emerald No EVs",
   "d6364c8b89ad50905e6a": "Sterling Silver",
   "8f199f3f40194ecc4b8e": "Sterling Silver",
   "5b789b0056c18c5c668b": "Platinum Redux 2.6"
    }



   
    INC_EM = false
    if (SOURCES[params.get('data')]) {
        TITLE = SOURCES[params.get('data')] || "NONE"
        $('.genSelection').hide()
        $('#rom-title').text(TITLE).show()
        if (TITLE == "Inclement Emerald" || TITLE == "Inclement Emerald No EVs") {
            INC_EM = true
            $("#lvl-cap").show()
        }
    } else {
        TITLE = "NONE"
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
   

   

   if (BACKUP_MODE) {
        setTimeout(function() {
            console.log("loading backups")
            if (SOURCES[params.get('data')]) {
                TITLE = SOURCES[params.get('data')] || "NONE"
                $('.genSelection').hide()
                $('#rom-title').text(TITLE).show()
                console.log(TITLE)
                backup_data = {}
                if (TITLE == "Blaze Black/Volt White") {
                    backup_data = bb_backup
                } else if (TITLE == "Blaze Black 2/Volt White 2 Redux") {
                    backup_data = bb2redux_backup
                } else if (TITLE == "Blaze Black 2/Volt White 2 Redux 1.4") {
                    backup_data = bb2redux_backup
                } else if (TITLE == "Vintage White") {
                    backup_data = vw_backup
                } else if (TITLE == "Renegade Platinum") {
                    backup_data = rp_backup
                } else if (TITLE == "Sacred Gold/Storm Silver") {
                    backup_data = sgss_backup
                } else if (TITLE == "Ancestral X") {
                    backup_data = ax_backup
                } else if (TITLE == "Rising Ruby/Sinking Saphire") {
                    console.log("loading rrss")
                    backup_data = rrss_backup
                } else if (TITLE == "Grand Colloseum 2.0") {
                    backup_data = gcol_backup
                } else if (TITLE == "Emerald Kaizo") {
                    backup_data = ek_backup
                } else {
                    "nothing"
                }
            } else {
                TITLE = "NONE"
            }
            loadDataSource(backup_data)

        },500)
            
        
        
   } else {
        $.get(npoint, function(data){
            npoint_data = data
            loadDataSource(data)
            final_type_chart = construct_type_chart()
        })
   }



  

   $(document).on('click', '.trainer-pok.right-side, .sim-trainer', function() {
        var set = $(this).attr('data-id')
        $('.opposing').val(set)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(set)
        if ($('.info-group.opp > * > .forme').is(':visible')) {
            $('.info-group.opp > * > .forme').change()
        }
        // box_rolls()
   })

   $(document).on('click', '.nav-tag', function() {
        var set = $(this).attr('data-next')
        $('.opposing').val(set)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(set)
   })

   // $(document).on('click', '.select2-result-label', function() {
   //      setTimeout(1, box_rolls())
   // })




   $(document).on('click', '#show-mid', function() {
        $('.panel-mid').toggle()
        $('.panel:not(.panel-mid)').toggleClass('third')
   })


   $(document).on('click', '#learnset-show', function() {
        get_current_learnset()
        $('#learnset-container').toggle()
   })

   $(document).on('click', '#toggle-analysis', function() {
        $('#reasoning').toggleClass('gone')
   })

   $(document).on('click', '#show-ai', function() {
        $("#ai-container").toggle()

   })

   $(document).on('focusout', '.filter-row input', function() {
        
        

        // box_rolls($("#min-dealt").val(), $("#max-taken").val())
   })

   $(document).on('click', '.results-right label', function() {
        
        var move = $(".results-right .visually-hidden:checked + .btn").text()
        if (move == "") {
            return
        }

        var effect_code = parseInt(jsonMoves[move]["e_id"])


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
        let url = window.location.href;    
        if (url.indexOf('?') > -1){
           url += '&backup=true'
        } else {
           url += '?backup=true'
        }
        window.location.href = url;
   })

   $(document).on('contextmenu', '.trainer-pok.left-side', function(e) {
        e.preventDefault()
        console.log("dbl click")
        var parentBox = $(this).parent()


        var data_id = $(this).attr('data-id')
        var species_name = data_id.split(" (")[0]
        var sprite_name = species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","")
        var set_data = customSets[species_name]["My Box"]

        var pok = `<div class="trainer-pok-container">
            <img class="trainer-pok left-side" src="./img/newhd/${sprite_name}.png" data-id="${data_id}">
            <div class="bp-info">${abv(set_data['moves'][0].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][1].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][2].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][3].replace("Hidden Power", "HP"))}</div>
        </div>`

        


        if (!parentBox.hasClass('trainer-pok-container')) {
            destination = $('.player-party')
            $('.player-party').css('display', 'flex')
            $('#clear-party').show()
            destination.append(pok)
        } else {
            $(this).parent().remove()
            if ($('.player-party').children().length == 0) {
                $('.player-party').hide()
                $('#clear-party').hide()
            }
        }



        
        // $(this).remove()
   })

   $(document).on('click', '#clear-party', function() {
        $('.player-party').html("")
        $('.player-party').hide()
        $('#clear-party').hide()
   })



   $(document).on('click', '#img-toggle', function() {
        let url = window.location.href;    
        if (url.indexOf('?') > -1){
           url += '&backup=true'
        } else {
           url += '?backup=true'
        }
        window.location.href = url;
   })



  


   $(document).on('click', '#invert-types', function() {
        let url = window.location.href;    
        if (url.indexOf('?') > -1){
           url += '&invert=true'
        } else {
           url += '?invert=true'
        }
        window.location.href = url;
   })




   $(document).on('keyup', '.current-hp, .percent-hp', function() {

        refresh_next_in()
   })

   // $(document).click(function() {

   //      setTimeout(function(){$($('.set-selector')[1]).change()},100);   
   // })

   $(window).click(function(event) {

        if ($('.select2-drop:visible').length == 0) {

           refresh_next_in()

        }
        
        
    });


   $(document).on('click', '#weather-bar label', function() {
        var weather = $(this).text()
        var sprite = $('#p2 .poke-sprite').attr('src')

        var cast_regx = /castform-?[a-z]*/i
        var cherr_regx = /cherrim-?[a-z]*/i

        
        if (weather == "Rain" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Rainy").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-rainy"))
        } else if (weather == "Sun" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Sunny").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-sunny"))
        } else if (weather == "Hail" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Snowy").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-snowy"))
        } else if (weather == "Sun" && $('.forme').last().val().includes("Cherrim")){
            $('.forme').last().val("Cherrim-Sunshine").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cherr_regx, "cherrim-sunshine"))
        } else if (weather == "None"  && $('.forme').last().val().includes("Cherrim")) {
            $('.forme').last().val("Cherrim").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cherr_regx, "cherrim"))
        } else if (weather == "None"  && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform"))
        }     
   })

   



    $(document).on('click', '.trainer-pok.left-side', function() {
        var set = $(this).attr('data-id')
        $('.player').val(set)


        console.log("switching")
        $('.player').change()

        $('.set-selector').first().change()

    
        $('.player .select2-chosen').text(set)
        if ($('.info-group:not(.opp) > * > .forme').is(':visible')) {
            $('.info-group:not(.opp) > * > .forme').change()
        }
        get_box()
        // box_rolls()

        var right_max_hp = $("#p1 .max-hp").text()
        $("#p1 .current-hp").val(right_max_hp).change()
    })

    $(document).on('change', '#p2 .poke-sprite', function() {
        $('.killer').removeClass('killer')
        $('.defender').removeClass('defender')

    })


})