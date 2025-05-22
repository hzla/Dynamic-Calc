dbName = "Frags"

function formattedCustomSets() {
	var formattedImports = []

	for (const [speciesName, setData] of Object.entries(customSets)) {
	  var formattedImport = {setName: speciesName, setData: setData, fragCount: 0, frags: []}
	  formattedImports.push(formattedImport)
	}
	return formattedImports
}

function getEncounter(species) {
	db
	  .transaction("encounters")
	  .objectStore("encounters")
	  .get(species).onsuccess = (event) => {
	  	

	  	var enc = event.target.result
	  	console.log(enc);
	};
}


$(document).ready(function() {
	const request = window.indexedDB.open(dbName, 2);


	request.onerror = (event) => {
	  // Handle errors.
	};

	request.onsuccess = (event) => {
	  db = event.target.result;
	  console.log("Database opened")
	};

	request.onupgradeneeded = (event) => {
	  db = event.target.result;

	  const objectStore = db.createObjectStore("encounters", { keyPath: "setName" });


	  var encounterData = formattedCustomSets()

	  // Use transaction oncomplete to make sure the objectStore creation is
	  // finished before adding data into it.
	  objectStore.transaction.oncomplete = (event) => {
	    // Store values in the newly created objectStore.
	    const encounterObjectStore = db
	      .transaction("encounters", "readwrite")
	      .objectStore("encounters");
	    
	    encounterData.forEach((encounter) => {
	      encounterObjectStore.add(encounter);
	    });
	  };
	};
})




