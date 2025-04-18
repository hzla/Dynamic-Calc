// This is Javascript code to be pasted into the web console of a default showdown calculator. It will grab all pokedex, move, and set data and format it for use for Dynamic Calc.
// Scraped data is stored in the variable npoint_data



// Gets formatted sets

newSets = {}

trNameCounts = {}


function isLastCharNumber(str) {
  const lastChar = str.charAt(str.length - 1);
  return !isNaN(lastChar) && lastChar !== ' ';
}

const replaceSpaceBeforeNumber = (input) => {
    return input.replace(/ \d/g, (match) => match.trim());
};

for (let pok in setdex) {
	newSets[pok] ||= {}
	for (let set in setdex[pok]) {
		var setData = setdex[pok][set]
		var trName = set.replace("[", "|").replace("]", "|").replace("(", "|").replace(")", "|")
		if (isLastCharNumber(trName)) {
			trName = replaceSpaceBeforeNumber(trName) + " "
		}
		newProp = `Lvl ${setData.level} ${trName}`
		newSets[pok][newProp] = setData
	}
}

// Gets Poks
npoint_poks = {}

for (species in pokedex) {
	npoint_poks[species] = {}
	npoint_poks[species]["bs"] = pokedex[species]["bs"]
	npoint_poks[species]["types"] = pokedex[species]["types"]
}

npoint_moves = {}

for (move in moves) {
	npoint_moves[move] = {}
	npoint_moves[move]["basePower"] = moves[move]["bp"]
	npoint_moves[move]["type"] = moves[move]["type"]
	npoint_moves[move]["category"] = moves[move]["category"]
}

npoint_data = {"poks": npoint_poks, "moves": npoint_moves, "formatted_sets": newSets}


