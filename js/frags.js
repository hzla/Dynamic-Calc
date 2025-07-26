dbName = "Frags"


// Add any new mons to encounters found in custom sets
// Adds frag count of prevos to any new mons found
function importEncounters() {
	// Initialize encounter list if doesn't exist
	if (localStorage.encounters) {
		currentEncounters = JSON.parse(localStorage.encounters)
	} else {
		currentEncounters = {}
	}
	for (const [speciesName, setData] of Object.entries(customSets)) {
		
	  // add to encounters if doesn't exist
	  if (!currentEncounters[speciesName]) {
		// console.log(currentEncounters)s
	  	let encounter = {setData: setData, fragCount: 0, frags: [], prevoFragCount: 0, alive: true, hide: false}
	  	currentEncounters[speciesName] = encounter

	  	let preFrags = prevoFrags(speciesName, currentEncounters)
	
	  	encounter.prevoFragCount = preFrags[0]
	  	encounter.fragCount = preFrags[0]

	  	encounter.frags = preFrags[1]
	  } 
	}
	localStorage.encounters = JSON.stringify(currentEncounters)  	
	return currentEncounters
}

function getEncounters() {
	if (localStorage.encounters && localStorage.encounters != "" ) {
		return JSON.parse(localStorage.encounters)
	} else {
		return {}
	}

	
}

function resetEncounters() {
	localStorage.encounters = ""
	if (typeof customSets != "undefined") {
		return importEncounters()
	}
	console.log("Encounters cleared")
}

function addFrag(e) {
	e.preventDefault()
	let speciesName = $('.select2-chosen')[0].innerHTML.split(" (")[0]
	let fragged =  $('.select2-chosen')[5].innerHTML
	let currentEncounters = JSON.parse(localStorage.encounters)

	if (currentEncounters[speciesName] && currentEncounters[speciesName].frags.indexOf(fragged) == -1 ) {
		currentEncounters[speciesName].fragCount += 1
		currentEncounters[speciesName].frags.push(fragged) 
		localStorage.encounters = JSON.stringify(currentEncounters)

		$('#p2 .frag-text').show()

		$('#frag-count').text(`Frags: ${currentEncounters[speciesName].fragCount}`)

		setTimeout(function() {
			$('#p2 .frag-text').hide()
		},300)

		console.log(`${speciesName} fragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)
	} else if (currentEncounters[speciesName].frags.indexOf(fragged) != -1) {
		currentEncounters[speciesName].frags = currentEncounters[speciesName].frags.filter(item => item !== fragged)
		currentEncounters[speciesName].fragCount -= 1
		localStorage.encounters = JSON.stringify(currentEncounters)

		$('#p2 .unfrag-text').show()

		setTimeout(function() {
			$('#p2 .unfrag-text').hide()
		},300)

		console.log(`${speciesName} unfragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)
	} else {
		alert(`${speciesName} not found in encounter list`)
	}
	return currentEncounters
}

function toggleEncounterStatus(e) {
	e.preventDefault()
	if (!splitData[TITLE]) {
		return
	}
	let speciesName = $('.select2-chosen')[0].innerHTML.split(" (")[0]
	let currentEncounters = JSON.parse(localStorage.encounters)

	currentEncounters[speciesName].alive = !currentEncounters[speciesName].alive
	localStorage.encounters = JSON.stringify(currentEncounters)

	if (currentEncounters[speciesName].alive) {
		$('#p1 .unfrag-text').show()

		setTimeout(function() {
			$('#p1 .unfrag-text').hide()
		},300)
	} else {
		$('#p1 .frag-text').show()

		setTimeout(function() {
			$('#p1 .frag-text').hide()
		},300)
	}

	console.log(`${speciesName} marked as alive: ${currentEncounters[speciesName].alive}`)
}


// Returns [fragCount, frags, met location, nickname]
function prevoData(speciesName, encounters) {
    let ancestor = evoData[speciesName]["anc"]

    if (ancestor == speciesName) {
        console.log("Does not evolve")
        return [0, [], false, false]
    }

    let evos = [ancestor].concat(evoData[ancestor]["evos"])


    // Look for later evolutions first
    for (let i = evos.length - 1; i >= 0; i--) {
        mon = evos[i]
        if (encounters[mon] && mon != speciesName) {
            return [encounters[mon].fragCount, encounters[mon].frags, encounters[mon].setData["My Box"].met, encounters[mon].setData["My Box"].nn]
        }
    }
    console.log("prevo data not found")
    return [0, [], false, false]
}


$(document).ready(function(){
	$(document).on('click', '#p2 .poke-sprite', addFrag)
	if (localStorage.encounters && localStorage.encounters != "") {
		$('#fragsheet-howto').show()
	}
	// $(document).on('contextmenu', '#p1 .poke-sprite', toggleEncounterStatus)

	$(document).on('click', '#p1 .poke-sprite, #fragsheet-howto', function() {
		let url = location.href.replace("index.html", "frags.html")
		if (location.href.includes("/?data")){
		  url = url.split("?data").join("frags.html?data");
		}
		window.open(url, '_blank');
	})
})





