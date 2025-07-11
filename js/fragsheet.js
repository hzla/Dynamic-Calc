  // Sample data based on your spreadsheet

const lvlcaps = [14,22,29,38,47,55,64,68,78]
const encounters = JSON.parse(localStorage.encounters)
var customSets = JSON.parse(localStorage.customsets)

let rowData = []

function extractLevel(str) {
    const match = str.match(/Lvl (\d+)/);
    return match ? parseInt(match[1]) : null;
}

allKos = 0

for (enc in encounters) {

    encRow = {}
    encRow.totalKo = 0

   if (encounters[enc].alive) {
    encRow.status = "Alive"
   } else {
    encRow.status = "Dead"
   }

   encRow.nickname = enc
   encRow.species = enc
   encRow.encounterLocation = customSets[enc]["My Box"].met

   for (let i = 0; i < 9; i++) {
        encRow[`split${i}`] = 0
   }

   let totalKos = 0

   let splitFound = false



   for (const frag of encounters[enc].frags) {
    let level = extractLevel(frag)
    // console.log(level)

    splitFound = false

    for( index in lvlcaps) {
        if (level <= lvlcaps[index]) {
            encRow[`split${index}`] += 1
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
        width: 100,
        cellRenderer: statusCellRenderer
    },
    {
        headerName: 'IMG',
        field: 'img',
        width: 80,
        cellRenderer: (params) => {
          if (params.data.species) {
            return `<img src="./img/newhd/${params.data.species.toLowerCase().replace(/[ :]/g, '-').replace(/[.']/g, '')}.png" style="width: 40px; height: 40px; object-fit: cover;" />`;
          }
          return '';
        }
    },
    {
        headerName: 'Nickname',
        field: 'nickname',
        width: 120
    },
    {
        headerName: 'Species',
        field: 'species',
        width: 120
    },
    {
        headerName: 'Met Location',
        field: 'encounterLocation',
        width: 150
    },
    {
        headerName: 'S1',
        field: 'split0',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S2',
        field: 'split1',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S3',
        field: 'split2',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S4',
        field: 'split3',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S5',
        field: 'split4',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S6',
        field: 'split5',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S7',
        field: 'split6',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'S8',
        field: 'split7',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'E4',
        field: 'split8',
        width: 70,
        cellRenderer: splitsCellRenderer
    },
    {
        headerName: 'KOs',
        field: 'totalKo',
        width: 80,
        cellStyle: { 'font-weight': 'bold' }
    },
    {
        headerName: 'KO Share',
        field: 'koShare',
        width: 120,
        cellRenderer: progressBarRenderer
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
        return { class: `rank-${params.data.rank}` };
    },
    suppressRowClickSelection: true,
    rowHeight: 40,
    headerHeight: 40
};

// Initialize the grid
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    agGrid.createGrid(gridDiv, gridOptions);

});