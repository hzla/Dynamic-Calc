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

TITLE = SOURCES[params.get('data')]
$('#sheet-title').text(`${TITLE} Sheet`)
splitTitles = splitData[TITLE]["titles"]
for (title in splitTitles) {
    $(`#split-${parseInt(title)}-header`).text(`${splitTitles[title]} Split`)
    $(`#split-${parseInt(title)}-tab`).text(`${splitTitles[title]}`)
}

const lvlcaps = splitData[TITLE]["lvls"]
if (typeof localStorage.encounters != "undefined" && localStorage.encounters != "") {

    encounters = JSON.parse(localStorage.encounters)
}
else {
    encounters = {}
}
let rowData = []
globalSeenTrainers = {}
activeSplit = "all"
columnDefs = []

// Custom cell renderers
const statusCellRenderer = (params) => {
    return `<span class="status-${params.value.toLowerCase()}">${params.value}</span>`;
};

const pokemonImageRenderer = (params) => {
    return `<span class="pokemon-sprite">${params.value}</span>`;
};

const progressBarRenderer = (params) => {
    const percentage = params.value || 0;
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
                return `<img src="./img/newhd/${params.data.species.toLowerCase().replace(/[ :]/g, '-').replace(/[.']/g, '')}.png" style="width: 60px; height: 60px; object-fit: cover;" />`;
              }
              return '';
            },
            menuTabs: []
        },
        {
            headerName: 'Nickname',
            field: 'nickname',
            width: 105,
            menuTabs: [],
            editable: true,
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: (event) => {
                updateEncounter('nn', event.data.species, event.newValue);
            },
        },
        {
            headerName: 'Species',
            field: 'species',
            width: 105,
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
            menuTabs: []
        },
        {
            headerName: 'KO Share',
            field: 'koShare',
            width: activeSplit == "all" ? 105 : 600,
            cellRenderer: progressBarRenderer,
            menuTabs: []
        }
    ];
}

function displayFragHistory(rowData) {
    let battleCount = 0
    $('.frag-row').remove()
    $('.split-container').hide()
    $('#stat-title').text(`${rowData.species} Battle History`)
    for (let i = 0; i < 9; i++) {
        let container = $(`#split-${i}-container`)
        let fragList = rowData[`split${i}FragInfo`]
        let seenTrainers = {}

        for (const frag of fragList) {
            let trName = extractTrainerName(frag)
            
            let pokName = extractPokemonName(frag)
            let spritePath = `./img/newhd/${pokName.toLowerCase().replace(/[ :]/g, '-').replace(/[.']/g, '')}.png`

            if (!seenTrainers[trName]) {
                let fragHTML = `<div class="frag-row">
                                    <div class="fragged-tr">${trName}</div>
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

       encRow.nickname = encounters[enc].nn || enc
       encRow.species = enc
       encRow.encounterLocation = encounters[enc].setData["My Box"].met

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


            if (level <= lvlcaps[index] && level > minCap && (activeSplit == "all" || activeSplit == index)) {
                encRow[`split${index}`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                encRow.totalKo += 1
                allKos += 1 
                break
            }  
            if (index == 8 && level > minCap && (activeSplit == "all" || activeSplit == 8)) {
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

$('.tab').click(function() {
    $('.tab').removeClass('active')
    $(this).addClass('active')
    
    if ($(this).attr('data-split') != "all") {
        activeSplit = parseInt($(this).attr('data-split'))
    } else {
        activeSplit = "all"
    }


    createRowData()
    setColumnDefs()
    gridApi.setGridOption('columnDefs', columnDefs);
    gridApi.setGridOption('rowData', rowData);
})



// Initialize the grid
document.addEventListener('DOMContentLoaded', () => {
    setColumnDefs()
    createRowData()

    // Grid options
    const gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true
        },
        getRowStyle: params => {
            let styles = {}
            styles.cursor = "pointer"

            styles.class = `rank-${params.data.rank}`
            // if (params.data.totalKo > 0) {
            //   styles.background = "rgb(139, 233, 253, 0.5)"
            // }

            return styles
        },
        onRowClicked: (event) => {
            displayFragHistory(event.data)
        },
        rowHeight: 60,
        headerHeight: 40
    };

    gridDiv = document.querySelector('#myGrid');
    gridApi = agGrid.createGrid(gridDiv, gridOptions);

});