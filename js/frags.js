dbName = "Frags"




function importEncounters() {
	let currentEncounters
	// Initialize encounter list if doesn't exist
	if (localStorage.encounters) {
		currentEncounters = JSON.parse(localStorage.encounters)
	} else {
		currentEncounters = {}
	}
	

	for (const [speciesName, setData] of Object.entries(customSets)) {
		
	  // add to encounters if doesn't exist
	  if (!currentEncounters.speciesName) {
	  	let encounter = {setData: setData, fragCount: 0, frags: []}
	  	currentEncounters[speciesName] = encounter
	  }    
	}

	localStorage.encounters = JSON.stringify(currentEncounters)
	return currentEncounters
}

function getEncounters() {
	return JSON.parse(localStorage.encounters)
}

function resetFrags() {
	localStorage.encounters = ""
	return importEncounters()
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

		console.log(`${speciesName} fragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)
	} else if (currentEncounters[speciesName].frags.indexOf(fragged) != -1) {
		currentEncounters[speciesName].frags = currentEncounters[speciesName].frags.filter(item => item !== fragged)
		currentEncounters[speciesName].fragCount -= 1

		localStorage.encounters = JSON.stringify(currentEncounters)

		console.log(`${speciesName} unfragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)

	} else {
		alert(`${speciesName} not found in encounter list`)
	}


	return currentEncounters
}




$(document).ready(function(){
	$(document).on('contextmenu', '#p2 .poke-sprite', addFrag)
})





