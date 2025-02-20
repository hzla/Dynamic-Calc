
function saveState() {
    var state = {}

    state["left"] = $('.set-selector')[0].value
    state["right"] = $('.set-selector')[2].value


    const stats = ["at", "df", "sa", "sd", "sp"]
    
    state["rightBoosts"] = []
    for (let i = 0;i<stats.length;i++) {
        var boostVal = $(`#p2 .${stats[i]} select`).val()
        state["rightBoosts"].push(boostVal)
    }

    state["leftBoosts"] = []
    for (let i = 0;i<stats.length;i++) {
        var boostVal = $(`#p1 .${stats[i]} select`).val()
        state["leftBoosts"].push(boostVal)
    }

    state["rightHP"] = ''
    if ($('#p2 .percent-hp').val() != '100') {
        state["rightHP"] = $('#p2 .current-hp').val()
    }

    state["leftHP"] = ''
    if ($('#p1 .percent-hp').val() != '100') {
        state["leftHP"] = $('#p1 .current-hp').val()
    }

    state["rightStatus"] = ''
    if ($('#statusR1').val() != 'Healthy') {
        state["rightStatus"] = $('#statusR1').val()
    }

    state["leftStatus"] = ''
    if ($('#statusL1').val() != 'Healthy') {
        state["leftStatus"] = $('#statusL1').val()
    }

    stateKeyLeft = `${state['left'].split(" (")[0]}` 
    for (let i = 0;i<stats.length;i++) {
        var boostVal = state["leftBoosts"][i]
        if (boostVal != '0') {
            if (parseInt(boostVal) > 0) {
                boostVal = "+" + boostVal
            }

            boostVal += stats[i].toUpperCase()
            stateKeyLeft = `${boostVal} ${stateKeyLeft}`
        }  
    }

    if (state["leftStatus"]) {
        stateKeyLeft += ` (${state["leftStatus"]})`
    }

    if (state["leftHP"]) {
        stateKeyLeft += ` (${state["leftHP"]}HP)`
    }

    stateKeyRight = `${state['right'].split(" (")[0]}` 
    for (let i = 0;i<stats.length;i++) {
        var boostVal = state["rightBoosts"][i]
        if (boostVal != '0') {
            if (parseInt(boostVal) > 0) {
                boostVal = "+" + boostVal
            }
            boostVal += stats[i].toUpperCase()
            stateKeyRight = `${boostVal} ${stateKeyRight}`
        }  
    }

    if (state["rightStatus"]) {
        stateKeyRight += ` (${state["rightStatus"]})`
    }

    if (state["rightHP"]) {
        stateKeyRight += ` (${state["rightHP"]}HP)`
    }

    stateKey = `${stateKeyLeft} vs ${stateKeyRight}`

    states[stateKey] = state
    return $(`<span class="state" contenteditable="false">${stateKey}</span>`)[0]
}


$('#save-state').click(function(){
    stateHTML = saveState()

    // Restore the saved range
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);

    savedRange.insertNode(stateHTML)

    // $('#battle-notes .notes-text').append(stateHTML)

    localStorage.notes = $('#battle-notes .notes-text').html()
    localStorage.states = JSON.stringify(states)
})


$('.notes-text').on("mouseup keyup", function () {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0);

    }
});




$('#battle-notes .notes-text').blur(function() {
    localStorage.notes = $('#battle-notes .notes-text').html()
})

$(document).on('click', '.state', function() {
    loadState($(this).text())

})

function loadState(id) {
    state = states[id]

    $('#p1').find(`.trainer-pok.left-side[data-id="${state['left']}"]`).click()

    const stats = ["at", "df", "sa", "sd", "sp"]

    // set boosts
    for (let i = 0;i<stats.length;i++) {
        var boostVal = stats[i]
        if (stats[i] != "0") {
            $(`#p1 .${stats[i]} select`).val(state["leftBoosts"][i])
        }
    }

    // set hp
    if (state["leftHP"]) {
        $('#p1 .current-hp').val(state["leftHP"])
    }

    
    // set status
    if (state["leftStatus"]) {
        $('#statusL1').val(state["leftStatus"])
    }

    setOpposing(state["right"])

    for (let i = 0;i<stats.length;i++) {
        var boostVal = stats[i]
        if (stats[i] != "0") {
            $(`#p2 .${stats[i]} select`).val(state["rightBoosts"][i])
        }
    }

    if (state["rightHP"]) {
        $('#p2 .current-hp').val(state["rightHP"])
    }

    if (state["rightStatus"]) {
        $('#statusR1').val(state["rightStatus"])
    }
}

$(document).ready(function() {
    $('#battle-notes .notes-text').on('keydown', function(event) {
    if (event.key === '[') {
        event.preventDefault(); // Prevent default behavior of creating a new <div> or <p>
        
        // Insert a line break at the caret position
        $('#save-state').click()
    }
});

    $('#battle-notes .notes-text').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default behavior of creating a new <div> or <p>
            
            // Insert a line break at the caret position
            document.execCommand('insertLineBreak');
        }
    });

})
let isAlertShowing = false;

// Override the default alert function
const originalAlert = window.alert;
window.alert = function(message) {
    if (!isAlertShowing) {
        isAlertShowing = true;
        originalAlert(message);
        isAlertShowing = false;
    }
};
