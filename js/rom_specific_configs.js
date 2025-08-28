// configurations for specific roms


function initHGE() {
    includes = npoint_data["includes"]
    ac_encs = npoint_data["encs"]
    sav_pok_names = includes["poks"]
    sav_move_names = includes["moves"] 
    sav_item_names = includes["items"]
    sav_pok_growths = includes["growths"]
    sav_abilities = includes["abilities"]
    $('label[for="hail"]').hide()
    $('label[for="snow"]').show()
}

function initColors() {
    jsonMoves["Bulldoze"]["target"] = "allAdjacentFoes"
    jsonMoves["Dragon Rage"]["category"] = "Physical"
    jsonMoves["Egg Bomb"]["category"] = "Special"
    jsonMoves["Self-Destruct"]["category"] = "Special"
    setTimeout(function(){
    	$('.badge-boost').hide()   
 	}, 100)
}

function initPlatinum() {
	var rotom_info = [["Heat", "Fire"],["Wash", "Water"],["Mow", "Grass"],["Frost", "Ice"],["Fan", "Flying"]]
    var deoxys_info = ['Attack', 'Defense','Speed']
    var wormadam_info = ['Sandy', 'Trash']
    
    if (jsonPoks['Rotom']) {
       for (let i = 0; i < rotom_info.length; i++) {
            pokedex[`Rotom-${rotom_info[i][0]}-Glitched`] = {
                "types": [
                    "Electric",
                    rotom_info[i][1]
                ],
                "bs": jsonPoks['Rotom']['bs'],
                "weightkg": 0.3,
                "abilities": {
                    "0": "Levitate"
                },
                "gender": "N"
            }
        } 
    }
    
    if (jsonPoks['Deoxys']) {
        for (let i = 0; i < deoxys_info.length; i++) {
            pokedex[`Deoxys-${deoxys_info[i]}-Glitched`] = {
                "types": [
                    "Psychic"
                ],
                "bs": jsonPoks['Deoxys']['bs'],
                "weightkg": 60.8,
                "abilities": {
                    "0": "Pressure"
                },
                "gender": "N",
            }
        }
    }

    if (jsonPoks['Shaymin']) {
        pokedex['Shaymin-Sky-Glitched'] = {
            "types": [
                "Grass",
                "Flying"
            ],
            "bs": jsonPoks['Shaymin']['bs'],
            "weightkg": 2.1,
            "abilities": {
                "0": "Natural Cure"
            },
            "gender": "N",
            "otherFormes": [
                "Shaymin-Sky"
            ]
        }
    }

    if (jsonPoks['Wormadam']) {
        pokedex['Wormadam-Trash-Glitched'] = {
            "types": [
                "Bug",
                "Steel"
            ],
            "bs": jsonPoks['Wormadam']['bs'],
            "weightkg": 6.5,
            "abilities": {
                "0": "Anticipation"
            },
            "otherFormes": [
                "Wormadam-Sandy",
                "Wormadam-Trash"
            ]
        }

        pokedex['Wormadam-Sandy-Glitched'] = {
            "types": [
                "Bug",
                "Ground"
            ],
            "bs": jsonPoks['Wormadam']['bs'],
            "weightkg": 6.5,
            "abilities": {
                "0": "Anticipation"
            },
            "otherFormes": [
                "Wormadam-Sandy",
                "Wormadam-Trash"
            ]
        }
    }  
}