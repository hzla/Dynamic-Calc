params = new URLSearchParams(window.location.search);
SOURCES = {
    "9aa37533b7c000992d92": "Blaze Black/Volt White",
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
    "a0e5b4fa06d9e7762210": "Parallel Emerald Normal"
}

function initializeSplits() {
    TITLE = SOURCES[params.get('data')]
    $('#sheet-title').text(`${TITLE} Sheet`)
    splitTitles = splitData[TITLE]["titles"]
    for (title in splitTitles) {
        $(`#split-${parseInt(title)}-tab`).text(`${splitTitles[title]}`)
    }

    lvlcaps = splitData[TITLE]["lvls"]
    if (typeof localStorage.encounters != "undefined" && localStorage.encounters != "") {

        encounters = JSON.parse(localStorage.encounters)
    }
    else {
        encounters = {}
    }
    rowData = []
    globalSeenTrainers = {}
    activeSplit = "all-simple"
    columnDefs = []
}

// Custom cell renderers
const statusCellRenderer = (params) => {
    return `<span class="status-${params.value.toLowerCase()}">${params.value}</span>`;
};

const pokemonImageRenderer = (params) => {
    return `<span class="pokemon-sprite">${params.value}</span>`;
};

const progressBarRenderer = (params) => {
    let percentage = params.value || 0;
    if (percentage == "NaN") {
        percentage = 0
    }
    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
            <div class="progress-text">${percentage}%</div>
        </div>
    `;
};

const splitsCellRenderer = (params) => {
    return `<div class="splits-cell">${params.value || 0}</div>`;
};

function updateEncounter(field, species, value) {
    encounters[species][field] = value
    localStorage.encounters = JSON.stringify(encounters)
}

function updateEncounterSetData(field, species, value) {
    encounters[species].setData["My Box"][field] = value
    localStorage.encounters = JSON.stringify(encounters)
}


function watchLocalStorageProperty(propertyName, callback) {
  window.addEventListener('storage', (event) => {
    // The storage event only fires when localStorage is changed in OTHER tabs/windows
    if (event.key === propertyName) {
      callback({
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue,
        url: event.url
      });
    }
  });
}

watchLocalStorageProperty('encounters', (data) => {
  console.log("Encounter Data Updated, refreshing table")
  encounters = JSON.parse(localStorage.encounters)
  refreshTables();
});




function setColumnDefs() {
    // Column definitions
    columnDefs = [
        {
            headerName: '#',
            field: 'rank',
            width: 60,
            pinned: 'left',
            cellStyle: params => {
                return { 'font-weight': 'bold' };
            },
            cellClassRules: {
              'rank-1': params => params.value === 1,
              'rank-2': params => params.value === 2,
              'rank-3': params => params.value === 3
            }
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 85,
            cellRenderer: statusCellRenderer,
            menuTabs: []
        },
        {
            headerName: 'Img',
            field: 'img',
            width: 80,
            cellRenderer: (params) => {
              if (params.data.species) {
                return `<img src="./img/pokesprite/${params.data.species.toLowerCase().replace(/[ :]/g, '-').replace(/[.’]/g, '')}.png" style="width: 60px; height: 60px; object-fit: cover;margin-top: 10px;" />`;
              }
              return '';
            },
            menuTabs: []
        },
        {
            headerName: 'Nickname',
            field: 'nickname',
            width: 115,
            menuTabs: [],
            editable: true,
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: (event) => {
                updateEncounterSetData('nn', event.data.species, event.newValue);
            },
        },
        {
            headerName: 'Species',
            field: 'species',
            width: 115,
            menuTabs: []
        },
        {
            headerName: 'Met Location',
            field: 'encounterLocation',
            width: 135,
            menuTabs: [],
            editable: true,
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: (event) => {
                updateEncounterSetData('met', event.data.species, event.newValue);
            },
            valueFormatter: (params) => toTitleCase(params.value),
            cellStyle: params => {
                return { 'text-overflow': 'initial' };
            },
        },
        {
            headerName: 'S1',
            field: 'split0',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S2',
            field: 'split1',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all" 
        },
        {
            headerName: 'S3',
            field: 'split2',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S4',
            field: 'split3',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S5',
            field: 'split4',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S6',
            field: 'split5',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S7',
            field: 'split6',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S8',
            field: 'split7',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'E4',
            field: 'split8',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'KOs',
            field: 'totalKo',
            width: 65,
            cellStyle: { 'font-weight': 'bold' },
            menuTabs: [],
            hide: activeSplit == 9
        },
        {
            headerName: 'KO Share',
            field: 'koShare',
            width: activeSplit == "all" ? 105 : 575,
            cellRenderer: progressBarRenderer,
            menuTabs: [],
            hide: activeSplit == 9
        },
        {
            headerName: 'Ability',
            field: 'ability',
            width: 145,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Nature',
            field: 'nature',
            width: 105,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Hp',
            field: 'hp',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Atk',
            field: 'at',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Def',
            field: 'df',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'SpA',
            field: 'sa',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'SpD',
            field: 'sd',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Spe',
            field: 'sp',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },

    ];
}

function displayFragHistory(rowData) {
    let battleCount = 0



    $('.frag-row').remove()
    $('.split-container').hide()
    $('#stat-title').text(`${rowData.species}'s Battles`)
    for (let i = 0; i < 9; i++) {
        let container = $(`#split-1-container`)
        let fragList = rowData[`split${i}FragInfo`]
        let seenTrainers = {}

        for (const frag of fragList) {
            let trName = extractTrainerName(frag)
            
            let pokName = extractPokemonName(frag)
            let spritePath = `./img/pokesprite/${pokName.toLowerCase().replace(/[ :'.-]+/g, '-').replace(/^-|-glitched$|-$/g, '')}.png`
            let typing = splitData[TITLE]["types"][i]


            if (!seenTrainers[trName]) {
                let fragHTML = `<div class="frag-row">
                                    <div class="fragged-tr ${typing}-type"><div class="tr-name">${trName}</div> <div class="tr-split">${splitTitles[i]} Split</div></div>
                                    <div class="fragged-mons" data-tr="${trName}"><img src="${spritePath}"></div>
                                </div>`

                container.append(fragHTML)
                seenTrainers[trName] = true
                battleCount += 1
            } else {
                let fragHTML = `<img src="${spritePath}">`
                $(`[data-tr="${trName}"`).append(fragHTML)
            }
            $(container).show()
        }
    }
    $('#delete-enc').show().text(`Delete ${rowData.species}`)
    return battleCount    
}

function extractLevel(str) {
    const match = str.match(/Lvl (\d+)/);
    return match ? parseInt(match[1]) : null;
}

function extractTrainerName(str) {
    // Find "Lvl " followed by numbers, then capture everything after it until the closing parenthesis
    const match = str.match(/Lvl \d+\s+(.+?)\s*\)/);
    return match ? match[1].trim() : null;
}

function extractPokemonName(str) {
    // Match everything before the opening parenthesis and trim whitespace
    const match = str.match(/^(.+?)\s*\(/);
    return match ? match[1].trim() : null;
}

function toTitleCase(str) {
  if (!str) {
    return ""
  }
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function findRowDataBySpecies(speciesName) {
    for (row of rowData) {
        if (row.species == speciesName) {
            return row
        }
    }
    return {}
}

// Returns [fragCount, frags, met location, nickname]
function prevoData(speciesName, encounters) {
    let ancestor = evoData[speciesName]["anc"]



    if (ancestor == speciesName) {
        return [0, [], false, false]
    }

    let evos = [ancestor].concat(evoData[ancestor]["evos"])

    // if (speciesName.includes("Rotom-")) {
    //     ancestor = ["Rotom", "Rotom-Mow", "Rotom-Frost", "Rotom-Heat", "Rotom-Fan", "Rotom-Wash"]
    // }

    // Look for later evolutions first
    for (let i = evos.length - 1; i >= 0; i--) {
        mon = evos[i]
        if (encounters[mon] && mon != speciesName) {
            if (typeof encounters[mon].setData["My Box"] == "undefined" ) {
                return [encounters[mon].fragCount, encounters[mon].frags, "Unknown", speciesName]
            } else {
               return [encounters[mon].fragCount, encounters[mon].frags, encounters[mon].setData["My Box"].met, encounters[mon].setData["My Box"].nn] 
            }
            
        }
    }

    return [0, [], false, false]
}



function createRowData() {
    allKos = 0
    aliveCount = 0
    deadCount = 0
    rowData = []

    for (enc in encounters) {
        encRow = {}
        encRow.totalKo = 0

        let evolutions = evoData[evoData[enc].anc].evos

        let foundEvo = false
        for (evo of evolutions) {
            if (typeof encounters[evo] != "undefined" && evo != enc && evolutions.indexOf(enc) < evolutions.indexOf(evo)) {
                foundEvo = true
                break
            }
        }


        // merge frags with prevos
        let prevo = prevoData(enc, encounters)
        let uniqFrags = [...new Set(encounters[enc].frags.concat(prevo[1]))].filter(item => item !== undefined);

        encounters[enc].frags = uniqFrags
        encounters[enc].fragCount = uniqFrags.length
        encRow.frags = uniqFrags
        encRow.fragCount = uniqFrags.length






        if (foundEvo) {
            continue
        }

       if (encounters[enc].alive) {
        encRow.status = "Alive"
        aliveCount++
       } else {
        encRow.status = "Dead"
        deadCount++
       }

  
       
       let setData = encounters[enc].setData["My Box"]

       if (typeof setData == "undefined" && enc.includes("Rotom-") && typeof encounters["Rotom"].setData != "undefined") {
            setData = encounters["Rotom"].setData
       } 

       if (typeof setData == "undefined" || setData == {}) {
            setData = JSON.parse(localStorage.customsets)[enc]
       }

       if (typeof setData == "undefined") continue;






       
       encRow.species = enc

        if (typeof setData == "undefined") {
            encRow.nickname = enc
            encRow.encounterLocation = "Click to Edit"
            encRow.nature = "Unknown"
            encRow.ability = "Unknown"
        } else {
            encRow.nickname = setData.nn || enc
            encRow.encounterLocation = setData.met
            encRow.nature = setData.nature
            encRow.ability = setData.ability
        }
       

       if (!setData.ivs) {
           encRow.hp = 31
           encRow.at = 31
           encRow.df = 31
           encRow.sa = 31
           encRow.sd = 31
           encRow.sp = 31
       } else {
           encRow.hp = setData.ivs.hp
           encRow.at = setData.ivs.at
           encRow.df = setData.ivs.df
           encRow.sa = setData.ivs.sa
           encRow.sd = setData.ivs.sd
           encRow.sp = setData.ivs.sp 
       }
       

       for (let i = 0; i < 9; i++) {
            encRow[`split${i}`] = 0
            encRow[`split${i}FragInfo`] = []
       }
       let totalKos = 0
       let splitFound = false

       let seenTrainers = {}

       for (const frag of encounters[enc].frags) {
        let level = extractLevel(frag)
        let trName = extractTrainerName(frag)


        globalSeenTrainers[trName] ||= true
        seenTrainers[trName] ||= true

        splitFound = false

        for( index in lvlcaps) {
            let minCap = 0

            if (index > 0) {
                minCap = lvlcaps[index - 1]
            }

            if (level <= lvlcaps[index] && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == index)) {
                encRow[`split${index}`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                encRow.totalKo += 1
                allKos += 1 
                break
            }  
            if (index == 8 && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == 8)) {
                encRow[`split8`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                encRow.totalKo += 1
                allKos += 1 
            }
        }
        
        
       }
       encRow.battleCount = Object.keys(seenTrainers).length
       rowData.push(encRow)
    }
    rowData = rowData.sort((a, b) => b.totalKo - a.totalKo);
    for (rowIndex in rowData) {
        rowData[rowIndex].rank = parseInt(rowIndex) + 1
        rowData[rowIndex].koShare = (rowData[parseInt(rowIndex)].totalKo / allKos * 100).toFixed(1) || 0
    }

    $('#alive-count').text(aliveCount)
    $('#dead-count').text(deadCount)
    $('#ko-count').text(allKos)
    $('#battle-count').text(Object.keys(globalSeenTrainers).length)
}

function refreshTables() {
    createRowData()
    setColumnDefs()
    gridApi.setGridOption('columnDefs', columnDefs);
    gridApi.setGridOption('rowData', rowData);

    // Filter frag history if visible
    if (typeof currentDisplayedSpecies != 'undefined') {
        displayFragHistory(findRowDataBySpecies(currentDisplayedSpecies));
    }
}

$('.tab').click(function() {
    $('.tab').removeClass('active')
    $(this).addClass('active')
    
    if (!$(this).attr('data-split').includes("all") ) {
        activeSplit = parseInt($(this).attr('data-split'))
    } else {
        activeSplit = $(this).attr('data-split')
    }

    refreshTables()
})

$(document).on('click', '.status-alive', function() {
    $(this).removeClass('status-alive').addClass('status-dead').text("Dead")
    let speciesName = rowData[parseInt($(this).parent().parent().parent().attr('row-id'))].species
    updateEncounter('alive', speciesName, false)
})

$(document).on('click', '.status-dead', function() {
    $(this).removeClass('status-dead').addClass('status-alive').text("Alive")
    let speciesName = rowData[parseInt($(this).parent().parent().parent().attr('row-id'))].species
    updateEncounter('alive', speciesName, true)
})

$('#delete-enc').click(function() {
    let speciesName = $(this).text().split("Delete ")[1]
    if (confirm(`Delete ${speciesName} from your encounters?`)) {
        delete encounters[speciesName]

        localStorage.encounters = JSON.stringify(encounters);

        createRowData()
        gridApi.setGridOption('rowData', rowData);

    }
})


function addRowTitles(gridApi) {

   for (index in rowData) {
        
        let rowElement = $(`[row-id="${index}"]`)

        let ivs = rowData[index].ivs
        let ivInfo = `${ivs["hp"]} HP / ${ivs["at"]} Atk / ${ivs["df"]} Def / ${ivs["sa"]} SpA / ${ivs["sd"]} SpD / ${ivs["sp"]} Spe`

        let setInfo = `${rowData[index].ability} ${rowData[index].nature} ${ivInfo}`

        console.log(rowData[index].species)


        $(rowElement).attr('title', setInfo)
   }
}




// Initialize the grid
document.addEventListener('DOMContentLoaded', () => {
    initializeSplits()
    setColumnDefs()
    createRowData()


    const gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true,
            cellClass: (params) => `field-${params.colDef.field}`
        },
        getRowStyle: params => {
            let styles = {}
            styles.cursor = "pointer"
            styles.class = `rank-${params.data.rank}`
            styles.title = `test`
            return styles
        },
        onRowClicked: (event) => {
            currentDisplayedSpecies = event.data.species;
            displayFragHistory(event.data)
        },
        rowHeight: 80,
        headerHeight: 40
    };
    gridDiv = document.querySelector('#myGrid');
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
});

