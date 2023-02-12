 function load_js()
   {
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


function get_box() {
    var names = get_trainer_names()

    var box = []

    var box_html = ""

    for (i in names) {
        if (names[i].includes("My Box")) {
            box.push(names[i].split("[")[0])

            var pok_name = names[i].split(" (")[0].toLowerCase().replace(" ","-")
            var pok = `<img class="trainer-pok left-side" src="./img/pokesprite/${pok_name}.png" data-id="${names[i].split("[")[0]}">`

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

    if (og_trainer_name) {
        og_trainer_name = og_trainer_name.replace(/.?\)/, "")
    }
    for (i in TR_NAMES) {

        if (TR_NAMES[i].includes(og_trainer_name)) {
            console.log(og_trainer_name.split(" "))
            console.log(TR_NAMES[i].split(" "))
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               matches.push(TR_NAMES[i])
            }    
        }
    }
    return matches
}

function get_next_in() {


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
        ranked_trainer_poks.push([trainer_poks[i], strongest_move_bp, strongest_move, sub_index])
    }
    console.log(ranked_trainer_poks.sort(sort_trpoks))
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

    var type1 = type_name.indexOf(pok_types[0])
    var type2 = type_name.indexOf(pok_types[1])

    for (i in types) {
        result[type_name[i]] = (types[i][type1] * types[i][type2])
    }

    return result
}

$(document).ready(function() {
   const params = new URLSearchParams(window.location.search)
   SETDEX_BW = null
   TR_NAMES = null


   npoint = `https://api.npoint.io/${params.get('data')}`

   if (params.get('data').includes("Pokeweb")) {
    npoint = `http://fishbowlweb.cloud:3000/${params.get('data').split("Pokeweb-")[1]}_calc.json`
   }


   $.get(npoint, function(data){
        // data = JSON.parse(data)
        npoint_data = data

        SETDEX_BW = data["formatted_sets"]
        SETDEX_ADV = data["formatted_sets"]
        SETDEX_DPP = data["formatted_sets"]
        SETDEX_SM = data["formatted_sets"]
        SETDEX_SS = data["formatted_sets"]
        SETDEX_XY = data["formatted_sets"]
        TR_NAMES = get_trainer_names()
        var jsonMoves = data["moves"]
        var jsonMove 
        for (move in moves) {

            if (jsonMoves[move]) {
                jsonMove = jsonMoves[move]
            } else {
                continue //skip unsupported moves like hidden power
            }

            moves[move]["bp"] = jsonMove["basePower"]
            moves[move]["type"] = jsonMove["type"]
            moves[move]["category"] = jsonMove["category"]

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
        // var first_set = TR_NAMES[100].split("[")[0]
        // $(".set-selector").val(first_set);
        // $(".set-selector").change();      
   })

   $(document).on('click', '.trainer-pok.right-side', function() {
        var set = $(this).attr('data-id')
        $('.opposing').val(set)


        $('.opposing').change()
        $('.opposing .select2-chosen').text(set)
   })

   $(document).on('click', '#show-mid', function() {
        $('.panel-mid').toggle()
   })

   $(document).on('click', '.trainer-pok.left-side', function() {
        var set = $(this).attr('data-id')
        $('.player').val(set)



        $('.player').change()
        $('.player .select2-chosen').text(set)
        get_box()
   })
})
