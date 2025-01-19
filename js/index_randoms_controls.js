

$("#p2 .ability").bind("keyup change", function () {
	// autosetWeather($(this).val(), 1);
	// autosetTerrain($(this).val(), 1);
});

$("#p2 .item").bind("keyup change", function () {
	autosetStatus("#p2", $(this).val());
});

lastManualStatus["#p2"] = "Healthy";
lastAutoStatus["#p1"] = "Healthy";

var resultLocations = [[], []];
for (var i = 0; i < 4; i++) {
	resultLocations[0].push({
		"move": "#resultMoveL" + (i + 1),
		"damage": "#resultDamageL" + (i + 1)
	});
	resultLocations[1].push({
		"move": "#resultMoveR" + (i + 1),
		"damage": "#resultDamageR" + (i + 1)
	});
}

var damageResults;
function performCalculations() {
	var p1info = $("#p1");
	var p2info = $("#p2");
	var p1 = createPokemon(p1info);
	var p2 = createPokemon(p2info);
	var p1field = createField();
	var p2field = p1field.clone().swap();







	
	damageResults = calculateAllMoves(damageGen, p1, p1field, p2, p2field);
	p1 = damageResults[0][0].attacker;
	p2 = damageResults[1][0].attacker;
	var battling = [p1, p2];
	p1.maxDamages = [];
	p2.maxDamages = [];
	

	if ($('#SpeL').prop('checked')) {
		p1.stats.spe = Math.floor(p1.stats.spe * 1.1)
		p1info.find(".sp .totalMod").css('color', '#bd93f9')
	} else {
		p1info.find(".sp .totalMod").attr('style', '')	
	}

	p1info.find(".sp .totalMod").text(p1.stats.spe);

	p2info.find(".sp .totalMod").text(p2.stats.spe);
	var fastestSide = p1.stats.spe > p2.stats.spe ? 0 : p1.stats.spe === p2.stats.spe ? "tie" : 1;

	var result, maxDamage;
	var bestResult;
	var zProtectAlerted = false;
	var is100 = false
	
	for (var i = 0; i < 4; i++) {
		// P1
		result = damageResults[0][i];
		maxDamage = result.range()[1] * p1.moves[i].hits;
		if (!zProtectAlerted && maxDamage > 0 && p1.item.indexOf(" Z") === -1 && p1field.defenderSide.isProtected && p1.moves[i].isZ) {
			alert('Although only possible while hacking, Z-Moves fully damage through protect without a Z-Crystal');
			zProtectAlerted = true;
		}
		p1.maxDamages.push({moveOrder: i, maxDamage: maxDamage});
		p1.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		$(resultLocations[0][i].move + " + label").text(p1.moves[i].name.replace("Hidden Power", "HP"));
		

		$(resultLocations[0][i].damage).text(result.moveDesc(notation));

		if (["Avalanche", "Payback", "Assurance", "Revenge", "Retaliate", "Stomping Tantrum"].indexOf(p1.moves[i].name) != -1) {
			$(resultLocations[0][i].damage).text(result.moveDesc(notation) + " (can double power)");
		}

		// P2
		result = damageResults[1][i];
		maxDamage = result.range()[1] * p2.moves[i].hits;
		if (!zProtectAlerted && maxDamage > 0 && p2.item.indexOf(" Z") === -1 && p2field.defenderSide.isProtected && p2.moves[i].isZ) {
			alert('Although only possible while hacking, Z-Moves fully damage through protect without a Z-Crystal');
			zProtectAlerted = true;
		}
		p2.maxDamages.push({moveOrder: i, maxDamage: maxDamage});
		p2.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		$(resultLocations[1][i].move + " + label").text(p2.moves[i].name.replace("Hidden Power", "HP"));
		$(resultLocations[1][i].damage).text(result.moveDesc(notation));

		var dmgInfo = $(resultLocations[1][i].damage).text()

		
		if (moveProbabilities[i] != 0 && damageGen >= 8) {
			
			if (!is100) {
				var probability = `  (${(Math.round(moveProbabilities[i] * 1000) / 10).toString()}% top roll)` 
				if (moveProbabilities[i] == 1) {
					is100 = true
				}
				$(resultLocations[1][i].damage).text(dmgInfo + probability)
			}	
		}

		if (["Avalanche", "Payback", "Assurance", "Revenge", "Retaliate", "Stomping Tantrum"].indexOf(p2.moves[i].name) != -1) {
			$(resultLocations[1][i].damage).text($(resultLocations[1][i].damage).text()+ " (can double power)");
		}


		

		// BOTH
		var bestMove;
		if (fastestSide === "tie") {
			// Technically the order should be random in a speed tie, but this non-determinism makes manual testing more difficult.
			// battling.sort(function () { return 0.5 - Math.random(); });
			bestMove = battling[0].maxDamages[0].moveOrder;
			var chosenPokemon = battling[0] === p1 ? "0" : "1";
			bestResult = $(resultLocations[chosenPokemon][bestMove].move);
		} else {
			bestMove = battling[fastestSide].maxDamages[0].moveOrder;
			bestResult = $(resultLocations[fastestSide][bestMove].move);
		}
	}
	if ($('.locked-move').length) {
		bestResult = $('.locked-move');
	} else {
		stickyMoves.setSelectedMove(bestResult.prop("id"));
	}
	bestResult.prop("checked", true);
	bestResult.change();
	$("#resultHeaderL").text(p1.name + "'s Moves (select one to show detailed results)");
	$("#resultHeaderR").text(p2.name + "'s Moves (select one to show detailed results)");
}

$(".result-move").change(function () {
	if (damageResults) {
		var result = findDamageResult($(this));
		if (result) {
			var desc = result.fullDesc(notation, false);
			if (desc.indexOf('--') === -1) desc += ' -- possibly the worst move ever';
			$("#mainResult").text(desc);
			$("#damageValues").text("Possible damage amounts: (" + displayDamageHits(result.damage) + ")");
		}
	}

	var move = $(".results-right .visually-hidden:checked + .btn").text()
    if (move != "" && jsonMoves[move]) {

	    var effect_code = parseInt(jsonMoves[move]["e_id"])


	    var ai_content = expertAI[effect_code]

	    ai_html = ""
	    
	    ai_html += `<h2>${move} AI</h2><br>`

	    for (n in ai_content) {
	        ai_html += ai_content[n].replace("\t", "&ensp;")
	        ai_html += "<br>"
	    }
	    $("#ai-container").html(ai_html)
    }

    
});

function displayDamageHits(damage) {
	// Fixed Damage
	if (typeof damage === 'number') return damage;
	// Standard Damage
	if (damage.length > 2) return damage.join(', ');
	// Fixed Parental Bond Damage
	if (typeof damage[0] === 'number' && typeof damage[1] === 'number') {
		return '1st Hit: ' + damage[0] + '; 2nd Hit: ' + damage[1];
	}
	// Parental Bond Damage
	return '1st Hit: ' + damage[0].join(', ') + '; 2nd Hit: ' + damage[1].join(', ');
}

function findDamageResult(resultMoveObj) {
	var selector = "#" + resultMoveObj.attr("id");
	for (var i = 0; i < resultLocations.length; i++) {
		for (var j = 0; j < resultLocations[i].length; j++) {
			if (resultLocations[i][j].move === selector) {
				return damageResults[i][j];
			}
		}
	}
}

function checkStatBoost(p1, p2) {
	if ($('#StatBoostL').prop("checked")) {
		for (var stat in p1.boosts) {
			if (stat === 'hp') continue;
			p1.boosts[stat] = Math.min(6, p1.boosts[stat] + 1);
		}
	}
	if ($('#StatBoostR').prop("checked")) {
		for (var stat in p2.boosts) {
			if (stat === 'hp') continue;
			p2.boosts[stat] = Math.min(6, p2.boosts[stat] + 1);
		}
	}
}


function rolls_less_than(rolls, k, winsTie) {

	if (k == 0) {
		return 0
	}

	if (rolls == 0) {
		return 16
	}

	for (n in rolls) {
		
		if (winsTie) {
			if (rolls[n] > k) {
				return parseInt(n)
			} 
		} else {
			if (rolls[n] >= k) {
				return parseInt(n)
			} 
		}
		
	}

	return 16
}

function calculate_probabilities(results) {
	// for each move's damage range
	var probabilities = []

	for (let i = 0; i < 4; i++) {
		var probability = 0
		// for each damage roll

		for (let n = 0; n < 16; n++) {
			// get number of rolls in other moves that are less than current roll

			if (results[i].damage == 0) {
				break
			}

			m1_roll_count = rolls_less_than(results[(i + 1) % 4].damage, results[i].damage[n], (i < 3))
			if (m1_roll_count == 0) {
				continue
			}
			m2_roll_count = rolls_less_than(results[(i + 2) % 4].damage, results[i].damage[n], (i < 2))
			if (m2_roll_count == 0) {
				continue
			}
			m3_roll_count = rolls_less_than(results[(i + 3) % 4].damage, results[i].damage[n], (i < 1))
			if (m3_roll_count == 0) {
				continue
			}
			probability += (1/16) * (m1_roll_count / 16) * (m2_roll_count / 16) * (m3_roll_count / 16)
		}
		probabilities.push(probability)
	}
	return probabilities
}



function calculateAllMoves(gen, p1, p1field, p2, p2field, displayProbabilities=true) {

	checkStatBoost(p1, p2);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		if (p2.moves[i] == "(No Move)" || p2.moves[i].name == "Smokescreen") {
			p2.moves[i].name = "Growl"
			p2.moves[i].category = "Status"
		} else {
			p2.moves[i].category = moves[p2.moves[i].originalName]["category"]
		}
		
		p2.moves[i].overrides = {}


		results[0][i] = calc.calculate(gen, p1, p2, p1.moves[i], p1field);
		results[1][i] = calc.calculate(gen, p2, p1, p2.moves[i], p2field);
	}
	if (displayProbabilities) {

		moveProbabilities = calculate_probabilities(results[1])
	}
	return results;
}

$(".mode").change(function () {
	var params = new URLSearchParams(window.location.search);
	params.set('mode', $(this).attr("id"));
	var mode = params.get('mode');
	if (mode === 'randoms') {
		window.location.replace('randoms' + linkExtension + '?' + params);
	} else if (mode === 'one-vs-one') {
		window.location.replace('index' + linkExtension + '?' + params);
	} else {
		window.location.replace('honkalculate' + linkExtension + '?' + params);
	}
});

$(".notation").change(function () {
	performCalculations();
});

$(document).ready(function () {
	var params = new URLSearchParams(window.location.search);
	var m = params.get('mode');
	if (m) {
		if (m !== 'one-vs-one' && m !== 'randoms') {
			window.location.replace('honkalculate' + linkExtension + '?' + params);
		} else {
			if ($('#randoms').prop('checked')) {
				if (m === 'one-vs-one') {
					window.location.replace('index' + linkExtension + '?' + params);
				}
			} else {
				if (m === 'randoms') {
					window.location.replace('randoms' + linkExtension + '?' + params);
				}
			}
		}
	}
	$(".calc-trigger").bind("change keyup", function () {
		setTimeout(performCalculations, 0);
		if (switchIn == 10) {
			setTimeout(refresh_next_in(), 0);
		}
	});
	performCalculations();
});
