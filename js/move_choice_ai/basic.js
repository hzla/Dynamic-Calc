
function getBasicFlagScores(move) {

    let isStatus = move.category == "Status"
    let results = mostRecentDisplayedResults[1]
    let player = results[0].defender
    let ai = results[0].attacker

    scores = []
    for (result of results) {
    	let score = 0
    	let move = result.move
    	let importedMoveData = moves[move.name]
    	let isStatus = move.category == "Status"
    	let effectID = importedMoveData.e_id

    	// -10 if defender is immune to a the damaging move 
    	// BUG: dry skin still sees it's original damage
    	if (!isStatus && result.damage == 0) {
    		score -= 10
    	}

    	if (effectID == 1 || effectID == 187) {
    		score = handleSleepEffect(player, ai, score)
    	}




    	scores.push(score)


    }






    console.log(scores)
    return scores


}

function handleSLeepEffect(player, ai, score) {
	// add safeguard handler
	if (player.status != "" || player.hasAbility('Insomnia', 'Vital Spirit')) {
		score -= 10
	}
	return score
}
