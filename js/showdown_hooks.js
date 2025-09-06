function init_calc() {

  // reload shared controls now that everything else has loaded
  var head= document.getElementsByTagName('head')[0];
  var script= document.createElement('script');
  script.src= './js/shared_controls.js?0b3ea005';
  head.appendChild(script);

  saveUploaded = false
  boxSprites = ["newhd", "pokesprite"]
  themes = ["old", "new"]
  trueHP = true
  fainted = []
  lastSetName = ""
  pokChanges = {}
  calcing = false
  partner_name = null


  // local storage settings
  if (typeof localStorage.boxspriteindex === 'undefined') {
    localStorage.boxspriteindex = 1
  }
  if (typeof localStorage.themeIndex === 'undefined') {
    localStorage.themeIndex = 1
  }
  localStorage.toDelete = ""

  if (parseInt(localStorage.themeIndex) == 0) {
    $('body, html').addClass('old')
  }
  sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]
  
  if (!parseInt(localStorage.boxrolls)) {
    localStorage.boxrolls = 0
  } else {
    $('#player-poks-filter').show()
  }

  // if first time
  if (typeof localStorage.battlenotes === 'undefined') {
    localStorage.battlenotes = '1'
  } else if (localStorage.battlenotes == '0'){
    $('.poke-import').first().hide()
  } 

  if (localStorage.states && isValidJSON(localStorage.states)) {
    states = JSON.parse(localStorage.states)
  } else {
    states = {}
  }
  
  if (localStorage.notes) {
    $('#battle-notes .notes-text').html(localStorage.notes);
  }
  
}

// Function to check if a local file exists and load it
// Works with file:// protocol by using script loading attempt
function checkAndLoadScript(src, options = {}) {
    const {
        onLoad = null,
        onError = null,
        onNotFound = null,
        timeout = 10000
    } = options;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        
        let timeoutId;
        let resolved = false;

        // Set up timeout
        if (timeout > 0) {
            timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.error(`Timeout loading: ${src}`);
                    if (onError) onError(src, new Error('Timeout'));
                    resolve(false);
                }
            }, timeout);
        }

        script.onload = () => {
            if (!resolved) {
                resolved = true;
                if (timeoutId) clearTimeout(timeoutId);
                console.log(`Successfully loaded: ${src}`);
                
                if (onLoad) onLoad(src);
                resolve(true);

            }
        };
        
        script.onerror = (error) => {
            if (!resolved) {
                resolved = true;
                if (timeoutId) clearTimeout(timeoutId);
                console.log(`File not found or failed to load: ${src}`);
                if (onNotFound) onNotFound(src, error);
                resolve(false);
            }
        };
        
        // Add script to document head
        document.head.appendChild(script);
    });
}


function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function padArray(array, length, fill) { return length > array.length ? array.concat(Array(length - array.length).fill(fill)) : array; }


function setOpposing(id) {

    // if in multi battle mode and user selects pokemon from already set partner, switch partners
    if (partner_name && id.includes(partner_name)) {
        partner_name = $('.set-selector .select2-chosen')[1].innerHTML.split(/Lvl [-+]?\d+ /)[1]
        if (partner_name) {
            partner_name = partner_name.replace(/\s?\)/, "")
        }
    }
    

    currentTrainerSet = id
    localStorage["right"] = currentTrainerSet

    $('.opposing').val(currentTrainerSet)
    $('.opposing').change()
    $('.opposing .select2-chosen').text(currentTrainerSet)
    if ($('.info-group.opp > * > .forme').is(':visible')) {
        $('.info-group.opp > * > .forme').change()
    }
    if ($('#player-poks-filter:visible').length > 0) {
       box_rolls() 
    } 
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
    if (($('.player-party').width() / s.length <= 50)) {
        if (s.split(" ")[1]) {
            return (s.split(" ")[0][0] + " " + s.split(" ")[1]).slice(0,13)
        } else {
            return s.slice(0,13)
        }    
    } else {
        return s
    }
}

function get_custom_trainer_names() {
    var all_poks = setdex
    var trainer_names = {} 

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]

           // If there's a mastersheet
           if (npoint_data["order"]) {
                // If this trainer is listed in the mastersheet
                if (npoint_data["order"][poks[trainer_name]["tr_id"]]) {
                    next = npoint_data["order"][poks[trainer_name]["tr_id"]]["next"]
                    prev = npoint_data["order"][poks[trainer_name]["tr_id"]]["prev"]
                    setdex[pok_name][trainer_name]["next"] = next
                    setdex[pok_name][trainer_name]["prev"] = prev
                }           
           }
           if (sub_index == 0) {
                trainer_names[poks[trainer_name]["tr_id"] || 0] = `${pok_name} (${trainer_name})[${sub_index}]`
           }     
        }      
    }
    return trainer_names
}

function sort_box_by_name(aToZ = true) {
    var box = $('.player-poks'),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id');
        mon1_species = mon1_id.split(" (")[0];

        mon2_id = b.getAttribute('data-id');
        mon2_species = mon2_id.split(" (")[0];

        if(mon1_species > mon2_species) {
            return aToZ ? 1 : -1;
        }
        if(mon1_species < mon2_species) {
            return aToZ ? -1 : 1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function get_box() {
    var names = get_trainer_names()

    var box = []

    var box_html = ""

    for (i in names) {
        if (names[i].includes("My Box")) {
            box.push(names[i].split("[")[0])
            var pok_name = names[i].split(" (")[0].toLowerCase().replace(" ","-").replace(".","").replace(".","").replace("’","").replace(":","-")
            var pok = `<img class="trainer-pok left-side ${sprite_style}" src="./img/${sprite_style}/${pok_name}.png" data-id="${names[i].split("[")[0]}">`
            box_html += pok
        }   
    }
    $('.player-poks').html(box_html)
    sort_box_by_name()

    if ($('.trainer-pok.left-side').length >= 10) {
        $('#search-row').css('display', 'flex')
    }
    filter_box()
    return box
}


function filter_box() {
    let search_string = $('#search-box').val().toLowerCase()
    let container = $('.trainer-pok-list.player-poks')

    if (search_string.length < 2) {
        container.find('.pokesprite').removeClass('active')
        return
    }
 
    container.find('.pokesprite').removeClass('active')

    for (set in customSets) {
        
        let setInfo = JSON.stringify(customSets[set]).toLowerCase()
        let pokedexInfo = {}
        
        try {
            pokedexInfo = JSON.stringify(jsonPoks[set]).toLowerCase() 
        } catch {
            pokedexInfo = JSON.stringify(pokedex[set]).toLowerCase() 
        }
        
        let set_id = `${set} (My Box)`
       
        if (setInfo.includes(search_string) || set.toLowerCase().includes(search_string) || pokedexInfo.includes(search_string)) {
            container.find(`[data-id='${set_id}']`).addClass('active')
        }
    }
}


function haveSameMiddleSubstring(str1, str2="") {
    if (!str2) {return false}
    const parts1 = str1.split('|');
    const parts2 = str2.split('|');
    
    // Check if both strings have exactly 3 parts (2 pipes)
    if (parts1.length !== 3 || parts2.length !== 3) {
        return false;
    }
    
    // Compare the middle parts (index 1)
    return parts1[1] === parts2[1];
}


function get_trainer_poks(trainer_name)
{
    var all_poks = SETDEX_BW
    var matches = []

    var og_trainer_name = trainer_name.split(/Lvl [-+]?\d+ /)[1]


    if (og_trainer_name) {
        og_trainer_name = og_trainer_name.replace(/.?\)/, "")
    }

    let sameLocation = haveSameMiddleSubstring(og_trainer_name, partner_name)

    let og_white_space = " "
    let partner_white_space = " "

    if (og_trainer_name && og_trainer_name.includes(" - ")) {
        og_white_space = ""
    }

    if (partner_name && partner_name.includes(" - ")) {
        partner_white_space = ""
    }


    for (i in TR_NAMES) {

        if (TR_NAMES[i].includes(og_trainer_name + og_white_space) || ((TR_NAMES[i].includes(partner_name + partner_white_space)))) {
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               matches.push(TR_NAMES[i])

            }
            if (partner_name && !sameLocation) {
                if (partner_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (partner_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   matches.push(TR_NAMES[i])
                }  
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
    if (!parseInt(localStorage.boxrolls)) {
        return
    }
    var box = get_box()

    var dealt_min_roll = $("#min-dealt").val()
    var taken_max_roll = $("#max-taken").val()


    if ($("#min-dealt").val() == "") {
        dealt_min_roll=10000
    } 

    if ($("#max-taken").val() == "") {
        taken_max_roll=-1
    }

    $('.killer').removeClass('killer')
    $('.defender').removeClass('defender')

    var p1field = createField();
    var p2field = p1field.clone().swap();

    var p1info = $("#p2");
    var p1 = createPokemon(p1info);
    var p1hp = $('#p2').find('#currentHpL1').val()
    var p1speed = parseInt($('.total.totalMod')[1].innerHTML)

    if (p1.ability == "Intimidate") {
        p1.ability = "Minus"
    }

    var killers = []
    var defenders = []
    var faster = []


    for (m = 0; m < box.length; m++) {
        var mon = createPokemon(box[m])
        var monSpeed = mon.rawStats.spe

        if (mon.ability == "Intimidate") {
            mon.ability = "Minus"
        }

        if (monSpeed > p1speed) {
            faster.push({"set": box[m]})
            $(`.trainer-pok[data-id='${box[m]}']`).addClass('faster')
        }

        var monHp = mon.originalCurHP
        var selected_move_index = $('#filter-move option:selected').index()


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


            if (!can_topkill(opposing_dmg, monHp * taken_max_roll / 100) && (selected_move_index == 0 || j == selected_move_index - 1)) {
                defend_count += 1
                if (defend_count == 4 || selected_move_index > 0) {
                    defenders.push({"set": box[m], "move": opposing_results[j].move.originalName})
                    $(`.trainer-pok[data-id='${box[m]}']`).addClass('defender')
                }         
            }
        }
    }


    return {"killers": killers, "defenders": defenders, "faster": faster}
    
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
    if (hp < 0) {
        return true;
    }
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

function get_current_in(refresh_box_rolls=true) {
    var setInfo = $('.set-selector')[3].value
    var pok_name = setInfo.split(" (")[0]
    var tr_name = setInfo.split(" (")[1].replace(")", "").split("[")[0]

    if (refresh_box_rolls) {
        box_rolls()
    }
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

    if (!current_learnset["learnset"]) {
        lvl_up_data = current_learnset
        current_learnset = {}
        current_learnset["learnset"] = lvl_up_data
    }

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

function exportAll() {
    $('.import-team-text').val(JSON.stringify(localStorage.customsets))
}


function displayParty() {
    var destination = $('.player-party')

    if (currentParty.length > 0) {
        $('.player-party').css('display', 'flex')
        $('#clear-party').css('display', 'inline-block')

        if (saveUploaded) {
            $('#edge').css('display', 'inline-block')
        }

        for (i in currentParty) {
            species_name = currentParty[i]

            var sprite_name = species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
            var set_data = setdex[species_name]["My Box"]
            var data_id = species_name + " (My Box)"


            var pok = `<div class="trainer-pok-container">
                <img class="trainer-pok left-side" src="./img/${sprite_style}/${sprite_name}.png" data-id="${data_id}">
                <div class="bp-info">${abv(set_data['moves'][0].replace("Hidden Power", "HP"))}</div>
                <div class="bp-info">${abv(set_data['moves'][1].replace("Hidden Power", "HP"))}</div>
                <div class="bp-info">${abv(set_data['moves'][2].replace("Hidden Power", "HP"))}</div>
                <div class="bp-info">${abv(set_data['moves'][3].replace("Hidden Power", "HP"))}</div>
            </div>`
            destination.append(pok)
        }
    }
}

function toggleBoxSpriteStyle() {
    var oldStyle = boxSprites[parseInt(localStorage.boxspriteindex)]
    localStorage.boxspriteindex = (parseInt(localStorage.boxspriteindex) + 1) % 2
    sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]

    $('.player-poks').removeClass(oldStyle)
    $('.player-poks').addClass(sprite_style)

    $('.trainer-pok').each(function() {
        $(this).removeClass(oldStyle)
        var newURL = $(this).attr('src').replace(oldStyle, sprite_style)
        $(this).attr('src', newURL)
    })
}

$('#theme-toggle').click(toggleThemes)

function toggleThemes() {
    var oldStyle = themes[parseInt(localStorage.themeIndex)]
    localStorage.themeIndex = (parseInt(localStorage.themeIndex) + 1) % 2
    themeStyle = themes[parseInt(localStorage.themeIndex)]

    $('html, body').removeClass(oldStyle)
    $('html, body').addClass(themeStyle)
}

function toggle_box_rolls() {
    localStorage.boxrolls = (parseInt(localStorage.boxrolls) + 1) % 2   
}

$('#toggle-boxroll').click(function(){
    toggle_box_rolls()
    $('#player-poks-filter').toggle()
    if ($('#player-poks-filter:visible').length > 0) {
        box_rolls()
    }
})

$('#toggle-battle-notes').click(function(){
    localStorage.battlenotes = (parseInt(localStorage.battlenotes) + 1) % 2   
    $('.poke-import').first().toggle()
})

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



function get_type_info(pok_types, move=false) {
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

        if (move == "Corrosion") {
            types[7][16] = 2
        }
        if (move == "Scrappy") {
            types[0][13] = 1
            types[6][13] = 1
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

function removeEvs(sets) {
    for (const species_name in sets) {
        const setdata = sets[species_name];    
        for (const set_name in setdata) {
            const secondLevelValue = setdata[set_name];
            if (Object.prototype.hasOwnProperty.call(secondLevelValue, 'evs')) {
                delete secondLevelValue.evs;
            }
        }
    }
}

function loadDataSource(data) {
    
    if (evsOn == '0') {
        removeEvs(data["formatted_sets"])
    }

    hasPokReplacements = false
    pok_subs = {}

    if (data.poks_replacements) {
        hasPokReplacements = true
        pok_subs = data.poks_replacements
    }


    for (let pok in pok_subs) {
        if (data["formatted_sets"][pok] && typeof data["formatted_sets"][pok_subs[pok]]  == "undefined" ) {
            data["formatted_sets"][pok_subs[pok]] = data["formatted_sets"][pok]
            delete data["formatted_sets"][pok]
        }

        if (data.poks[pok]) {
            data.poks[pok_subs[pok]] = data.poks[pok]
        }
    }

    SETDEX_BW = data["formatted_sets"]
    SETDEX_ADV = data["formatted_sets"]
    SETDEX_DPP = data["formatted_sets"]
    SETDEX_SM = data["formatted_sets"]
    SETDEX_SS = data["formatted_sets"]
    SETDEX_XY = data["formatted_sets"]
    setdex = data["formatted_sets"]

    if (data["title"]) {
        TITLE = data["title"]
        pokChanges = {}
        console.log(`Custom Title ${TITLE}`)
        $('.genSelection').hide()
        $('#rom-title').text(TITLE).show()
        if (data["move_replacements"]) {
            moveChanges[TITLE] = data["move_replacements"]
        }
    }

    if (TITLE.includes("White") || TITLE.includes("Black") ) {
        baseGame = "BW"
        if (TITLE.includes("Black 2")) {
            baseVersion = "BW2"
        }
    } else if (TITLE.includes("Platinum") && !TITLE.includes("Lumi")) {
        baseGame = "Pt"
    } else if (TITLE.includes("Silver") || mechanics == "hge") {
        baseGame = "HGSS"
    }


    if (TITLE == 'Ancestral X') {
        npoint_data["order"] = ax_order
    }

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

    if (!jsonMoves["Fire Blast"] || !jsonMoves["Fire Blast"]["e_id"]){
        $("#show-ai").hide()
    }

    if (TITLE == "Pokemon Colors") initColors();


    for (move in moves) {

        var move_id = move.replace(/-|,|'|’| /g, "").toLowerCase()

        if (jsonMoves[move]) {
            jsonMove = jsonMoves[move]
        } else {
            // moves[move] = jsonMoves[move]
            continue //completely overite if custom move data found
        }

        if (move == '(No Move)') {
            continue
        }
        moves[move]["bp"] = jsonMove["basePower"]


        MOVES_BY_ID[g][move_id].basePower = jsonMove["basePower"]

		var special_case_power_overrides = {
			"Return": 102,
			"Magnitude": 70
		}

		if (move in special_case_power_overrides) {
			moves[move]["bp"] = special_case_power_overrides[move]
	       MOVES_BY_ID[g][move_id].basePower = special_case_power_overrides[move]
		}
        
        var optional_move_params = ["type", "category", "e_id", "multihit", "target", "recoil", "overrideBP", "secondaries", "drain", "priority", "willCrit"]  
        for (n in optional_move_params) {
            var param = optional_move_params[n]
            if (jsonMove[param]) {
              moves[move][param] = jsonMove[param]
              MOVES_BY_ID[g][move_id][param] = jsonMove[param]  
            }
        }

        var optional_flag_params = ["makesContact", "isPunch", "isBite", "isBullet", "isSound", "isPulse", "isKick", "isSword", "isBone", "isWind"]  
        for (n in optional_flag_params) {
            var param = optional_flag_params[n]
            if (jsonMove[param]) {
              moves[move][param] = jsonMove[param]
              MOVES_BY_ID[g][move_id]["flags"][param] = jsonMove[param]  
            }
        }


        if (jsonMove['flags']) {
            if (jsonMove['flags']['punch']) {
                moves[move]['isPunch'] = true
                MOVES_BY_ID[g][move_id]["flags"]["punch"] = 1
            }
            if (jsonMove['flags']['sound']) {
                moves[move]['isSound'] = true
                MOVES_BY_ID[g][move_id]["flags"]["sound"] = 1
            }
        }

        if (!jsonMove['multihit'] && (damageGen == 5)) {
             delete MOVES_BY_ID[g][move_id].multihit 
        }
    }



    for (move in jsonMoves) {
        
        // if defined in showdown move list
        if (moves[move]) {
        } else {
            // custom move
            jsonMoves[move]["flags"] = {}

            moves[move] = jsonMoves[move]
            moves[move]["bp"] = jsonMoves[move]["basePower"]
            MOVES_BY_ID[8][move.replace(/-|,|'|’| /g, "").toLowerCase()] = jsonMoves[move]
        }
    }

    jsonPoks = data["poks"]
    var jsonPok 
    


    if (jsonPoks["Bulbasaur"] && jsonPoks["Bulbasaur"]["learnset_info"] || TITLE == "Mariomon") {
        $('#learnset-show').show()
    }

    if (jsonPoks["Tepig"] && jsonPoks["Tepig"]["learnset_info"]) {
        $('#learnset-show').show()
    }

    $('#save-pok').show()

    if ( TITLE.includes("Platinum") && !TITLE.includes("Lumi") ) {
        initPlatinum()  
    }

    if (TITLE == "Cascade White 2") {
        moves['Pay Day'].willCrit = true;
    }


    const cleanString = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (TITLE.includes("Lumi") || customPoks) {

        for (pok in jsonPoks) {
            var pok_id = cleanString(pok)

            if (typeof SPECIES_BY_ID[gen][pok_id] === "undefined" || SPECIES_BY_ID[gen][pok_id].name != pok ) {

                if (!jsonPoks[pok]) {
                    console.log(pok)
                    continue
                } 

                console.log(`Creating custom pok: ${pok}`)

                jsonPoks[pok]["baseStats"] = jsonPoks[pok]["bs"]
                jsonPoks[pok]["id"] = pok_id
                jsonPoks[pok]["kind"] = "Species"
                SPECIES_BY_ID[gen][pok_id] = jsonPoks[pok]
                pokedex[pok] = jsonPoks[pok]
            }
            
        }
    }

    if (TITLE.includes("Sterling")) {
        delete moves.Barrage["multihit"]
        delete MOVES_BY_ID[g].barrage["multihit"]

        MOVES_BY_ID[g].avalanche.target = 'allAdjacentFoes'
        moves.Avalanche.target = 'allAdjacentFoes'

    }

    for (pok in pokedex) {

        if (pok.includes("Glitched")) {
            continue
        }

		// Allow import of Farfetch'd w/ unicode standard apostrophe
		if (pok == "Farfetch’d" && jsonPoks["Farfetch'd"]) {
			jsonPok = jsonPoks["Farfetch'd"];
		}
        else if (jsonPoks[pok]) {
            jsonPok = jsonPoks[pok]
        } else {
            // override for lumi plat
           
                continue //skip weird smogon pokemon and arceus forms

        }

        // revert fairy typing for sgss
        const pok_id = cleanString(pok)

        if (TITLE == "Sacred Gold/Storm Silver" && !FAIRY ) {

            if (jsonPok["types"].includes('Fairy')) {
                
                // jsonPok["bs"] = pokedex[pok]["bs"]
                jsonPok["types"] = SPECIES_BY_ID[4][pok_id].types
            }
        }

        pokedex[pok]["bs"] = jsonPok["bs"]

        if (jsonPok["types"]) {
            pokedex[pok]["types"] = jsonPok["types"]
        }
        
        if (jsonPok.hasOwnProperty("abilities"))
            pokedex[pok]["abilities"] = jsonPok["abilities"]

        
        SPECIES_BY_ID[gen][pok_id].types = jsonPok["types"]

        SPECIES_BY_ID[gen][pok_id].baseStats = {
            "atk": jsonPok["bs"]["at"],
            "def": jsonPok["bs"]["df"],
            "hp": jsonPok["bs"]["hp"],
            "spa": jsonPok["bs"]["sa"],
            "spd": jsonPok["bs"]["sd"],
            "spe": jsonPok["bs"]["sp"],
        }
    }

    

    if (damageGen > 3 && damageGen < 6) {
        try {
           pokedex['Cherrim-Sunshine']['bs'] = jsonPoks["Cherrim"]["bs"] 
       } catch {
            console.log("using vanilla Cherrim data")
       }
        
    }
    if (damageGen == 4) {
        var gen4Forms = [
            ["Deoxys", ["Attack", "Defense", "Speed"]],
            ["Castform", ["Rainy", "Sunny", "Snowy"]]
            ]

        // if (TITLE.includes("Sterling")) {
        //     gen4Forms.pop()
        // }
      
        for (i in gen4Forms) {
            var base = gen4Forms[i][0]
            var forms = gen4Forms[i][1]

            for (j in forms) {
                pokedex[`${base}-${forms[j]}`]['bs'] = pokedex[base]['bs']
            }
        }
    }

    

    init_calc() 


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
        }
    }
    moves['(No Move)'] = moves['-'] = {
        "bp": 0,
        "category": "Status",
        "type": "Normal"
    }

    
}


params = new URLSearchParams(window.location.search);
devMode = params.get('dev') == '1'
save_expansion = params.get('savExp') == '1'
mechanics = params.get('mechanics') || "default" 
g = params.get('gen');
damageGen = parseInt(params.get('dmgGen'))
customPoks = params.get('customPoks');
evsOn = params.get('evs');
type_chart = parseInt(params.get('types'))
type_mod = params.get('type_mod')
switchIn = parseInt(params.get('switchIn'))
noSwitch = params.get('noSwitch')
hasEvs = params.get('evs') != '0'
challengeMode = params.get('challengeMode')
hideDamage = params.get('hideDmg')
FAIRY = params.get('fairy') == '1'
misc = params.get('misc')
invert = params.get('invert')
DEFAULTS_LOADED = false
analyze = false
limitHits = false
FIELD_EFFECTS = {}


if (params.get('data') == 'bd7fc78f8fa2500dfcca') {
    location.href = 'https://hzla.github.io/Dynamic-Calc/?data=26138cc1d500b0cf7334&gen=7&switchIn=4&types=6'
}

// if (damageGen <= 3) {
//     $('#player-poks-filter').remove()
// }

if (hideDamage) {
    $('.move-result-group span').css('opacity', '0')
}




$('#toggle-analysis').addClass('gone')


$(document).ready(function() {
   SETDEX_BW = null
   TR_NAMES = null
   BACKUP_MODE = params.get('backup')


   params = new URLSearchParams(window.location.search)
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
   "8f199f3f40194ecc4b8e": "Sterling Silver 1.14",
   "7ea3ff9a608c1963a0a5": "Sterling Silver 1.15",
   "b819708dba8f8c0641d5": "Sterling Silver 1.16",
   "5b789b0056c18c5c668b": "Platinum Redux 2.6",
   "de22f896c09fceb0b273": "Maximum Platinum",
   "a0ff5953fbf39bcdddd3": "Cascade White 2",
   "ee9b421600cd6487e4e3": "Photonic Sun/Prismatic Moon",
   "eae4ac1396d4b82d8b87": "Pitch Black 2",
   "d3501821feaa976d581a": "Azure Platinum",
   "9abb79df1e356642c229": "Fire Red Omega",
   "12f82557ed0e08145660": "Fire Red",
   "2487bca2d6c21c388695": "Fire Red Deluxe",
   "aeb373b7631d4afd7a53": "Emerald",
   "006ac04e900ccb3110df": "Luminescent Platinum",
   "4d69b577b07a86fe790c": "Righteous Red",
   "9fd7b1ba4583a9ba7166": "Mariomon",
   "b60bd402cbb993ed3b77": "Parallel Emerald ATO",
    "17af2cc6ec56f8f293bd": "Parallel Emerald Hard",
    "a0e5b4fa06d9e7762210": "Parallel Emerald Normal",
    "0d8b65ba6796bf2b3d4c": "White 2 Kaizo",
    "bb8579a3798fd63b429d": "Royal Saphire",
    "0a37ed78da4e6078ed52": "Garbage Gold Deluxe"
    }

    MASTERSHEETS = {
        "Blaze Black 2/Volt White 2 Redux 1.4": "bb2redux",
        "Sterling Silver 1.14": "sterlingsilver",
        "Renegade Platinum": "renplat",
        "Vintage White": "vw"
    }
    encs = `https://api.npoint.io/c39f79b412a6f19f3c4f`

    INC_EM = false
    if (SOURCES[params.get('data')]) {
        TITLE = SOURCES[params.get('data')] || "NONE"

        // redirect for old ren plat url
        if (params.get('data') == 'bd7fc78f8fa2500dfcca') {
            location.href = 'https://hzla.github.io/Dynamic-Calc/?data=26138cc1d500b0cf7334&gen=7&switchIn=4&types=6'
        }


        baseGame = ""
        baseVersion = ""
        if (TITLE.includes("White") || TITLE.includes("Black") ) {
            baseGame = "BW"
        } else if (TITLE.includes("Platinum") && !TITLE.includes("Lumi")) {
            baseGame = "Pt"
        } else if (TITLE.includes("Silver") || TITLE.includes("Gold")) {
            baseGame = "HGSS"
        }

        if (!baseGame) {
            $('#read-save').hide()
        } else {
            $('.save-editor-guide').show()
        }

        $('.genSelection').hide()
        $('#rom-title').text(TITLE).show()
        if (TITLE == "Inclement Emerald" || TITLE == "Inclement Emerald No EVs") {
            
            $('#save-upload-g45').attr('id', "save-upload")
            $('#read-save').attr('for', "save-upload")

            checkAndLoadScript(`./js/save_constants/inclementemerald.js`, {
                onLoad: (src) => {
                    console.log("Inclement Emerald Save Constants Loaded")
                    $('#read-save').show()

                },
                onNotFound: (src) => console.log(`Not found: ${src}`)
            });
            
            INC_EM = true
            $("#lvl-cap").show()
            $("#harsh-sunshine").next().text("Ability Sun")
            $("#heavy-rain").next().text("Ability Rain")
        }

        if ( TITLE == "Cascade White 2") {
            $('.cascade-effects .btn-small').show()
        }

        if (MASTERSHEETS[TITLE] && !location.href.includes("mastersheet")) {
            mastersheetURL = location.href.replace("index.html","").replace("?data", `/${MASTERSHEETS[TITLE]}_mastersheet.html?data`)
            $("#ms-btn").show()
            $("#ms-btn").click(function() {location.href = mastersheetURL})
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
   TITLE = SOURCES[params.get('data')] || "NONE"
   
   if (backupFiles[TITLE]) {
        checkAndLoadScript(`./backups/${backupFiles[TITLE]}.js`, {
                onLoad: (src) => {
                    npoint_data = backup_data
                    loadDataSource(npoint_data)
                    final_type_chart = construct_type_chart()

                    if (mechanics == "hge") {
                        initHGE()
                    }

                    setTimeout(function() {
                        if (localStorage["left"]) {
                            var set = localStorage["right"]
                            $('.opposing').val(set)
                            $('.opposing').change()
                            $('.opposing .select2-chosen').text(set)
                            if ($('.info-group.opp > * > .forme').is(':visible')) {
                                $('.info-group.opp > * > .forme').change()
                            }
                        }

                        if (mechanics == "hge") {
                            $('.hp-cntrl label, .z-btn').hide()
                        }

                        if (localStorage["right"]) {
                            $(`[data-id='${localStorage["left"]}']`).click()
                        }             
                    }, 20)

                },
                onNotFound: (src) => console.log(`Not found: ${src}`)
        });
        if (TITLE.includes("Photonic")) {
            $('.credits').prepend("Set data compiled by Questionable Specimen")
        }        
   } else {
        $.get(npoint, function(data){
            npoint_data = data
            loadDataSource(data)

            if (mechanics == "hge") {
                initHGE()
            }

            final_type_chart = construct_type_chart()

            setTimeout(function() {
                if (localStorage["left"]) {
                    var set = localStorage["right"]
                    $('.opposing').val(set)
                    $('.opposing').change()
                    $('.opposing .select2-chosen').text(set)
                    if ($('.info-group.opp > * > .forme').is(':visible')) {
                        $('.info-group.opp > * > .forme').change()
                    }
                }

                if (localStorage["right"]) {
                    $(`[data-id='${localStorage["left"]}']`).click()
                }             
            }, 100)
           
        })
   }




   $(document).on('click', '.trainer-name', function() {
        var tr_id = parseInt($(this).parent().parent().attr('data-index'))

        currentTrainerSet = customLeads[tr_id].split("[")[0]

        localStorage["right"] = currentTrainerSet

        $('.opposing').val(currentTrainerSet)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(currentTrainerSet)
        if ($('.info-group.opp > * > .forme').is(':visible')) {
            $('.info-group.opp > * > .forme').change()
        }

        $('.wrapper').show()
        $('#content-container').hide()

   })
  

   $(document).on('click', '.trainer-pok.right-side, .sim-trainer', function() {
        setOpposing($(this).attr('data-id'))
   })

   
   $(document).on('click', '.nav-tag', function() {
        var set = customLeads[$(this).attr('data-next')].split("[")[0]

        $("#weather-bar label").first().click()

        $('.opposing').val(set) 
        $('.opposing .select2-chosen').text(set)
        $('.opposing').change()
   })

   $(document).on('click', '#show-mid', function() {
        $('.panel-mid').toggle()
        $('.panel:not(.panel-mid)').toggleClass('third')
   })

   $(document).on('click', '#open-menu, #settings-menu div', function() {
        $('#settings-menu').toggle()
   })

   $(document).on('keyup', '#search-box', filter_box)


   $(document).on('click', '#learnset-show', function() {
        get_current_learnset()
        $('#learnset-container').toggle()
   })

   $(document).on('click', '#box-remove', function() {
        var species = $('.set-selector')[0].value.split(" (")[0]
        var sets = JSON.parse(localStorage.customsets)
        if (confirm(`Delete ${species} from imported sets?`)) {
            delete sets[species]['My Box']
            delete SETDEX_BW[species]['My Box']
            localStorage.customsets = JSON.stringify(sets)
            $(`[data-id='${$('.set-selector')[0].value}']`).remove()
        }
   })

   $(document).on('click', '#toggle-analysis', function() {
        $('#reasoning').toggleClass('gone')
   })

   $(document).on('click', '#show-ai', function() {
        $("#ai-container").toggle()
   })

   $('body').on('click', function() {
        $("#ai-container").hide()
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

    $(document).on('contextmenu', '.trainer-pok.right-side', function(e) {
        e.preventDefault()
        $(this).toggleClass('fainted')

        var set = $(this).attr('data-id')

        if (fainted.includes(set)) {
            fainted = fainted.filter(function(e) { return e !== set})
        } else {
            fainted.push(set)
        }
    })


    $(document).on('click', '#add-party-pok', function() {
        var currentPok = $('.set-selector')[1].value
        $(`[data-id="${currentPok}"]`).trigger('contextmenu')
    })


   $(document).on('contextmenu', '.trainer-pok.left-side', function(e) {
        e.preventDefault()
        var parentBox = $(this).parent()


        var data_id = $(this).attr('data-id')
        var species_name = data_id.split(" (")[0]
        var sprite_name = species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
        var set_data = customSets[species_name]["My Box"]
        set_data['moves'] = padArray(set_data['moves'], 4, "-")

        var pok = `<div class="trainer-pok-container">
            <img class="trainer-pok left-side" src="./img/${sprite_style}/${sprite_name}.png" data-id="${data_id}">`

        if (set_data['item']) {
            item_name = set_data['item'].toLowerCase().replace(" ", "_").replace("'", "") 
            pok += `<img class="trainer-pok-item" src="./img/items/${item_name}.png">`
        }
            
        pok += `<div class="bp-info">${abv(set_data['moves'][0].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][1].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][2].replace("Hidden Power", "HP"))}</div>
            <div class="bp-info">${abv(set_data['moves'][3].replace("Hidden Power", "HP"))}</div>
        </div>`
            
        if (!parentBox.hasClass('trainer-pok-container')) {
            destination = $('.player-party')
            $('.player-party').css('display', 'flex')
            $('#clear-party').css('display', 'inline-block')

            if (saveUploaded) {
                $('#edge').css('display', 'inline-block')
            }
            destination.append(pok)
        } else {
            $(this).parent().remove()
            if ($('.player-party').children().length == 0) {
                $('.player-party').hide()
                $('#clear-party').hide()
                $('#edge').hide()
            }
        }
   })

    $(document).on('click', '#clear-party', function() {
        $('.player-party').html("")
        $('.player-party').hide()
        $('#clear-party').hide()
        $('#edge').hide()
        currentParty = []
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

    $(document).on('click', '.cascade-effects input', function() {
        var effect = $(this).attr('id')
        FIELD_EFFECTS = {}
        FIELD_EFFECTS[effect] = true
    })

    $(document).keydown(async function (e) {
        if ($('.select2-drop-active:visible').length == 0 && 
            document.activeElement != $('textarea.import-team-text')[0] && 
            $('.pokemon-filter:visible').length === 0 && 
            document.activeElement != $('#battle-notes .notes-text')[0]) {
            

            if ((e.altKey || e.metaKey) && (e.key == "f" || e.key == "ƒ")){ 
                e.preventDefault()
                $('.panel-mid').toggle()
                $('.panel:not(.panel-mid)').toggleClass('third')
            } else if ((e.altKey || e.metaKey) && (e.key == "b" || e.key == "∫") && saveUploaded && (baseGame == "Pt" || baseGame == "HGSS")) {
                e.preventDefault()
                if (confirm("Put full party to sleep?")) {
                    bedtime()
                }
            } else if (e.altKey && e.key == "c" || e.key == "ç") {
                console.log("asdf")
                e.preventDefault()
                $("#critR1")[0].checked = !$("#critR1")[0].checked
                $("#critR2")[0].checked = !$("#critR2")[0].checked
                $("#critR3")[0].checked = !$("#critR3")[0].checked
                $("#critR4")[0].checked = !$("#critR4")[0].checked
                $('#resultDamageR1, #resultDamageR2, #resultDamageR3, #resultDamageR4').toggleClass('crit-text')
                $('.move-crit').last().change()
            } else if (e.altKey && e.key == "s" || e.key == "ß") {
                toggleBoxSpriteStyle()
            }  else if (e.altKey && e.key == "p" || e.key == "π") {
                if (partner_name) {
                    partner_name = null
                    alert("Partner trainer cleared")
                } else {
                    partner_name = $('.set-selector .select2-chosen')[1].innerHTML.split(/Lvl [-+]?\d+ /)[1]
                    if (partner_name) {
                        partner_name = partner_name.replace(/\s?\)/, "")
                    }
                    alert(`${partner_name} set as doubles partner for next trainer selected`)   
                }

                
            }
        }

    })

    $(document).keydown(function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9) {
         if (location.href.includes("mastersheet")) {
            $('.wrapper').toggle();
            $('#content-container').toggle()
         }  
        }   
    });


   $(document).on('click', '#sprite-toggle', function() {
        toggleBoxSpriteStyle()

   })

    $('.set-selector, .move-selector').on("select2-close", function () {
        setTimeout(function() {
            $('.select2-container-active').removeClass('select2-container-active');
            $(':focus').blur();
        }, 1);
    });


   $(document).on('click', '#weather-bar label', function() {
        var weather = $(this).text()
        var sprite = $('#p2 .poke-sprite').attr('src')

        var cast_regx = /castform-?[a-z]*/i
        var cherr_regx = /cherrim-?[a-z]*/i

        if ($('.opposing .forme:visible').length < 1) {
            return
        }
        
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

   function extractPokemonName(str) {
        // Match everything before the opening parenthesis and trim whitespace
        const match = str.match(/^(.+?)\s*\(/);
        return match ? match[1].trim() : null;
    }

    function toTitleCase(str) {
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }


    $(document).on('click', '.trainer-pok.left-side', function() {
        var set = $(this).attr('data-id')
        localStorage["left"] = set 
        $('.player').val(set)

        let speciesName = extractPokemonName(set)

        if (typeof localStorage.encounters != "undefined") {
            let encounters = getEncounters()

            if (encounters[speciesName] && encounters[speciesName].setData && encounters[speciesName].setData["My Box"] && encounters[speciesName].setData["My Box"].met) {
                const met = toTitleCase(encounters[speciesName].setData["My Box"].met)
                const fragCount = encounters[speciesName].fragCount

                $('#met-loc').text(`${met}`).show()
                $('#frag-count').text(`Frags: ${fragCount}`).show()
            } else if (encounters[speciesName] && encounters[speciesName].setData["My Box"]){
                const met = "Unknown Origin"
                const fragCount = encounters[speciesName].fragCount

                $('#met-loc').text(`${met}`).show()
                $('#frag-count').text(`Frags: ${fragCount}`).show()
            }
            else {
                $('#met-loc, #frag-count').hide()
            }            
        } else {
            $('#met-loc, #frag-count').hide()
        }

        $('.player').change()
        $('.set-selector').first().change()

    
        $('.player .select2-chosen').text(set)
        if ($('.info-group:not(.opp) > * > .forme').is(':visible')) {
            $('.info-group:not(.opp) > * > .forme').change()
        }
        get_box()
        box_rolls()

        currentLvl = parseInt($('#levelL1').val())

        var right_max_hp = $("#p1 .max-hp").text()
        $("#p1 .current-hp").val(right_max_hp).change()
    })

    $(document).on('blur', '#max-taken, #min-dealt', function() {
        if ($(this).val() != "") {
           box_rolls() 
        } 
    })


    $(document).on('change', '.set-selector', function() {
        setTimeout(function() {
            let weather = $('#weather-bar input:checked').first().val().toLowerCase()
            $('.field-info').attr('class', 'field-info')
            $('.field-info').addClass(weather)
        }, 1)
        
    })

    $(document).on('click', '#weather-bar input', function() {
        let weather = $('#weather-bar input:checked').first().val().toLowerCase()
        $('.field-info').attr('class', 'field-info')
        $('.field-info').addClass(weather)
    })

    $(document).on('change', '#filter-move', box_rolls)


    $(document).on('click', '#clear-filters', function(){
        $('#max-taken').val("")
        $('#min-dealt').val("")
        var poks = $('#p1').find(".trainer-pok")

        poks.removeClass('defender')
        poks.removeClass('killer')
    })
})
