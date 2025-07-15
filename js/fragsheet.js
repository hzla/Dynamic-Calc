
// Generate Data for Fragsheet from encounters

const lvlcaps = [14,22,29,38,47,55,64,68,78]
const encounters = JSON.parse(localStorage.encounters)
let rowData = []

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

function displayFragHistory(rowData) {
    $('.frag-row').remove()
    $('.split-container').hide()
    $('#stat-title').text(`${rowData.species} Frag History`)
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
            } else {
                let fragHTML = `<img src="${spritePath}">`
                $(`[data-tr="${trName}"`).append(fragHTML)
            }

            $(container).show()
        }    
    }
}

function createRowData() {
    allKos = 0
    aliveCount = 0
    deadCount = 0

    for (enc in encounters) {
        encRow = {}
        encRow.totalKo = 0

        let evolutions = evoData[evoData[enc].anc].evos

        console.log(evolutions)
        let foundEvo = false
        for (evo of evolutions) {
            console.log(evo)
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

       encRow.nickname = enc
       encRow.species = enc
       encRow.encounterLocation = encounters[enc].setData["My Box"].met

       for (let i = 0; i < 9; i++) {
            encRow[`split${i}`] = 0
            encRow[`split${i}FragInfo`] = []
       }
       let totalKos = 0
       let splitFound = false

       for (const frag of encounters[enc].frags) {
        let level = extractLevel(frag)

        splitFound = false

        for( index in lvlcaps) {
            if (level <= lvlcaps[index]) {
                encRow[`split${index}`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                break
            }  
            if (index == 8) {encRow[`split8`] += 1}
        }
        encRow.totalKo += 1 
        allKos += 1
       }
       rowData.push(encRow)
    }

    rowData = rowData.sort((a, b) => b.totalKo - a.totalKo);
    



    for (rowIndex in rowData) {
        rowData[rowIndex].rank = parseInt(rowIndex) + 1
        rowData[rowIndex].koShare = (rowData[parseInt(rowIndex)].totalKo / allKos * 100).toFixed(1)
    }

    $('#alive-count').text(aliveCount)
    $('#dead-count').text(deadCount)
    $('#ko-count').text(allKos)

}





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

// Column definitions
const columnDefs = [
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
        headerName: '',
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
        menuTabs: []
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
        menuTabs: []
    },
    {
        headerName: 'S1',
        field: 'split0',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S2',
        field: 'split1',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: [] 
    },
    {
        headerName: 'S3',
        field: 'split2',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S4',
        field: 'split3',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S5',
        field: 'split4',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S6',
        field: 'split5',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S7',
        field: 'split6',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'S8',
        field: 'split7',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
    },
    {
        headerName: 'E4',
        field: 'split8',
        width: 55,
        cellRenderer: splitsCellRenderer,
        menuTabs: []
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
        width: 105,
        cellRenderer: progressBarRenderer,
        menuTabs: []
    }
];

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

// Initialize the grid
document.addEventListener('DOMContentLoaded', () => {
    createRowData()

    const gridDiv = document.querySelector('#myGrid');
    agGrid.createGrid(gridDiv, gridOptions);

});