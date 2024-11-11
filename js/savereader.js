document.getElementById('save-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        if (baseGame == "Pt") {
            partyCountOffset = 0x9C
            smallBlockSize = 0xCF2C
            boxDataOffset = 0xCF30
            bigBlockStart = boxDataOffset - 4
            bigBlockSize = 0x121E4
            footerSize = 20
            partyPokSize = 236
        } else if (baseGame == "HGSS") {
            partyCountOffset = 0x94
            smallBlockSize = 0xF628
            boxDataOffset = 0x0f700
            bigBlockStart = boxDataOffset
            bigBlockSize = 0x12310
            footerSize = 16
            partyPokSize = 236
        } else if (baseGame == "BW") {
            partyCountOffset = 0x18e00 + 4
            boxDataOffset = 0x400
            boxSize = 0xFF0
            partySize = 0x534
            checksumsOffset = 0x23F00
            partyPokSize = 220
        }
        battleStatSize = (partyPokSize - 136) / 2

        reader.onload = function(e) {
            // Convert the binary string to ArrayBuffer for easier access
            const binaryData = e.target.result;
            const buffer = new ArrayBuffer(binaryData.length);
            view = new Uint8Array(buffer);


            saveUploaded = true
            for (let i = 0; i < binaryData.length; i++) {
                view[i] = binaryData.charCodeAt(i);
            }

            changelog = "<h4>Changelog:</h4>"

            $('#clearSets').after("<p id='changelog'></p>")
            console.log("reader init")

            partyExpTables = []
            partyExpIndexes = []

            smallBlockStart = 0

            if (baseGame == "Pt" || baseGame == "HGSS") {
                smallBlock1SaveCount = read32BitIntegerFromUint8Array(view,  smallBlockSize - 16)
                smallBlock2SaveCount = read32BitIntegerFromUint8Array(view,  smallBlockSize + 0x40000 - 16)
                if (smallBlock2SaveCount > smallBlock1SaveCount) {
                    partyCountOffset += 0x40000
                    blockId = read32BitIntegerFromUint8Array(view,  smallBlockSize + 0x40000 - 20)
                    console.log("now reading party from block 2")
                    smallBlockStart = 0x40000
                } else {
                    console.log("now reading party from block 1")
                    blockId = read32BitIntegerFromUint8Array(view,  smallBlockSize - 20)       
                }
                block1Id = read32BitIntegerFromUint8Array(view,  bigBlockStart + bigBlockSize - 20)
                if (block1Id != blockId) {
                    boxDataOffset += 0x40000
                    bigBlockStart += 0x40000
                    console.log("now reading box from block 2")
                } else {
                    console.log("now reading box from block 1")
                }
            }


            // Step 1: Get 'n' from offset 0x9C (single byte)
            var n = view[partyCountOffset];
            partyCount = n


            // Initialize an array to store decrypted chunks
            decryptedChunks = [];
            decryptedBattleStats = []
            partyMons = {}
            partyPIDs = []

            // Step 2: Loop 'n' times to read and decrypt each 236-byte chunk
            
            
            CHUNK_SIZE = partyPokSize
            var offset = partyCountOffset + 4;
            
            showdownImport = ""

            savParty = []

            for (let i = 0; i < n; i++) {
                // Extract the chunk of 236 bytes from the binary data
               chunk = view.slice(offset, offset + CHUNK_SIZE);
               showdownImport += parsePKM(chunk, true)
               offset += CHUNK_SIZE                 
            }


            offset = boxDataOffset
            CHUNK_SIZE = 136
            n = 510
            

            if (baseGame == "BW") {
                n = 690
            }

            boxPokOffsets = {}

            savBox = []


            for (let i = 0; i < n; i++) {
                // Extract the chunk of 236 bytes from the binary data

               if (baseGame == "HGSS") {
                 if (i > 0 && i % 30 == 0) {
                    offset += 16
                 } 
               } else if (baseGame == "BW") {
                 if (i > 0 && i % 30 == 0) {
                    offset += 16
                 } 
               }
              
               chunk = view.slice(offset, offset + CHUNK_SIZE);
               
               showdownImport += parsePKM(chunk, false, offset)
               offset += CHUNK_SIZE                 
            }
            $('.import-team-text').val(showdownImport)
        };

        // Read file as binary string
        reader.readAsBinaryString(file);
    } else {
        console.log("No file selected.");
    }
});

function setBWChecksums() {
    // set box checksums
    for (let i = 0; i < 24;i++) {
        // calcualte checksum for pc box
        var boxStart = boxDataOffset + (i * 0x1000)
        var checksum = getCheckSum(view.slice(boxStart, boxStart + boxSize))

        // set new checksum
        view.set([checksum & 0xFF, (checksum >>> 8) & 0xFF], boxStart + boxSize + 2)
        view.set([checksum & 0xFF, (checksum >>> 8) & 0xFF], checksumsOffset + (i * 2) + 2)
    }

    // set party checksum
    var partyChecksum = getCheckSum(view.slice(0x18e00, 0x18e00 + partySize))
    view.set([partyChecksum & 0xFF, (partyChecksum >>> 8) & 0xFF], 0x18e00 + partySize + 2)
    view.set([partyChecksum & 0xFF, (partyChecksum >>> 8) & 0xFF], checksumsOffset + 52)


    // set checksum table
    checksumsChecksum = getCheckSum(view.slice(0x23F00, 0x23F00 + 0x8C))
    view.set([checksumsChecksum & 0xFF, (checksumsChecksum >>> 8) & 0xFF], 0x23F9A)
}

// The decryptData function, as described earlier
function decryptData(encryptedData, checksum, wordCount=64) {
    const decryptedData = [];
    let X = checksum; // Initialize PRNG with checksum as seed

    for (let i = 0; i < wordCount; i++) {
        // Advance the PRNG state
        X = (BigInt(BigInt(0x41C64E6D) * BigInt(X)) + BigInt(0x6073)); 


        // Extract the top 16 bits for XOR
        prngValue = parseInt(BigInt(X) >> BigInt(16) & BigInt(0XFFFF))

        // Decrypt by reversing the XOR operation

        const decryptedWord = encryptedData[i] ^ prngValue;
        // Store decrypted word
        decryptedData.push(decryptedWord);
    }
    return decryptedData;
}

function getTop16BitsAsInt(bigint) {
  const totalBits = bigint.toString(2).length;       // Get the bit length of the BigInt
  const shiftAmount = totalBits - 16;                // Calculate the shift to get top 16 bits

  if (shiftAmount <= 0) {
    return Number(bigint & BigInt(0xFFFF));          // If 16 bits or less, just mask directly
  }

  const top16Bits = (bigint >> BigInt(shiftAmount)) & BigInt(0xFFFF); // Shift and mask
  return Number(top16Bits);                          // Convert to regular integer
}

function toLittleEndian(value) {
    // Ensure the value is within the 2-byte range (0 to 65535)
    value &= 0xFFFF;

    // Convert to little-endian by swapping the bytes
    const littleEndianValue = ((value & 0xFF) << 8) | ((value >> 8) & 0xFF);
    return littleEndianValue;
}


function parsePKM(chunk, is_party=false, offset=0) {

    var showdownString = ""

     // Extract the first 4 bytes and convert them to a 32-bit integer
    pv = read32BitIntegerFromUint8Array(chunk)

    if (pv == 0) {
        return ""
    }

    


    // Perform the function on pv: ((pv & 0x3E000) >> 0xD) % 24
    const shiftValue = ((pv & 0x3E000) >> 0xD) % 24;

    shiftOrder = blockOrders[shiftValue]

    // Extract the 2-byte checksum at offset 0x06 within the chunk
    const checksum = (chunk[0x07] << 8) | chunk[0x06];

    battleStats = chunk.slice(136)
    chunk = chunk.slice(8,136)



    // Convert chunk to array of 16-bit words (2-byte integers) for decryption
    const encryptedData = [];
    for (let j = 0; j < 128; j += 2) {
        const word = (chunk[j + 1] << 8) | chunk[j];
        encryptedData.push(word);
    }

    const decryptedData = decryptData(encryptedData, checksum);

    if (is_party) {
        const encryptedBattleStat = []
        for (let j = 0; j < 100; j += 2) {
            const word = (battleStats[j + 1] << 8) | battleStats[j];
            encryptedBattleStat.push(word);
        }

        const decryptedBattleStat = decryptData(encryptedBattleStat, pv, battleStatSize)
        decryptedBattleStats.push(decryptedBattleStat)
    }
    

    // Store decrypted chunk
    decryptedChunks.push(decryptedData);
    
    var mon_data_offset = shiftOrder.indexOf(0) * 16
    var move_data_offset = shiftOrder.indexOf(1) * 16

    var mon_name = sav_pok_names[decryptedData[mon_data_offset]]




    if (mon_name in mon_forms) {
        var form_index = (decryptedData[move_data_offset + 12] >> 3 & 0x1F) - 1 
        if (form_index >= 0 ) {
           mon_name += `-${mon_forms[mon_name][form_index]}` 
        } 
    }

    var item_name = sav_item_names[decryptedData[mon_data_offset + 1]]

    var hp_ev = decryptedData[mon_data_offset + 8] & 0xFF
    var def_ev = decryptedData[mon_data_offset + 9] & 0xFF
    var spa_ev = decryptedData[mon_data_offset + 10] & 0xFF
    var atk_ev = decryptedData[mon_data_offset + 8] >> 8 & 0xFF
    var spe_ev = decryptedData[mon_data_offset + 9] >> 8 & 0xFF
    var spd_ev = decryptedData[mon_data_offset + 10] >> 8 & 0xFF

    
    // cheat mode
    // decryptedData[move_data_offset + 8] = 65535  
    // decryptedData[move_data_offset + 9] = 16383  

    var iv_value = (decryptedData[move_data_offset + 9] << 16) | (decryptedData[move_data_offset + 8]  & 0xFFFF)



    ivs = getIVs(iv_value) 

    if (baseGame != "BW") {
        var nature = natures[Math.abs(pv) % 25]
    } else {
        var natureIndex = decryptedData[move_data_offset + 12] >> 8  
        var nature = natures[natureIndex]
    }

    

    if (is_party) {
        partyMons[mon_name] = decryptedBattleStats.length - 1
        partyPIDs.push(pv)
        mon_name += " |Party|"
        partyExpTables.push(sav_pok_growths[decryptedData[mon_data_offset]])
        partyExpIndexes.push(mon_data_offset + 4)
        savParty.push(decryptedData)
    } else {
        boxPokOffsets[mon_name] = {}
        boxPokOffsets[mon_name]["offset"] = offset
        boxPokOffsets[mon_name]["decryptedData"] = decryptedData

        boxPokOffsets[mon_name]["exp_table"] = sav_pok_growths[decryptedData[mon_data_offset]]
        boxPokOffsets[mon_name]["exp_index"] = mon_data_offset + 4
    }


    showdownString += `${mon_name} @ ${item_name}\n`



    var exp = (decryptedData[mon_data_offset + 5] << 16) | (decryptedData[mon_data_offset + 4]  & 0xFFFF)
    var exp_table = expTables[sav_pok_growths[decryptedData[mon_data_offset]]]

    var level = get_level(exp_table, exp) 
    var ability = sav_abilities[(decryptedData[mon_data_offset + 6] >> 8 & 0xFF) ]


    showdownString += `Level: ${level}\n`
    showdownString += `${nature} Nature\n`
    showdownString += `Ability: ${ability}\n`

    showdownString += `EVs: ${hp_ev} HP / ${atk_ev} Atk / ${def_ev} Def / ${spa_ev} SpA / ${spd_ev} SpD / ${spe_ev} Spe\n`
    showdownString += `IVs: ${ivs[0]} HP / ${ivs[1]} Atk / ${ivs[2]} Def / ${ivs[3]} SpA / ${ivs[4]} SpD / ${ivs[5]} Spe\n`

    for (let i = 0; i < 4; i++) {
        var move_name = sav_move_names[decryptedData[move_data_offset + i]]
        showdownString += `- ${move_name}\n`
    }
    showdownString += "\n"
    return showdownString    
}


function read32BitIntegerFromUint8Array(array, offset = 0) {
  const buffer = array.buffer; // Get the ArrayBuffer from the Uint8Array
  const view = new DataView(buffer, array.byteOffset, array.byteLength);
  return view.getUint32(offset, true); // true for little-endian
}


function getIVs(ivValue) {

    // Extract each stat using bitwise operations
    const hp = (ivValue >> 0) & 0x1F;         // 5 bits for HP
    const attack = (ivValue >> 5) & 0x1F;     // 5 bits for Attack
    const defense = (ivValue >> 10) & 0x1F;   // 5 bits for Defense
    const speed = (ivValue >> 15) & 0x1F;     // 5 bits for Speed
    const spAttack = (ivValue >> 20) & 0x1F;  // 5 bits for Special Attack
    const spDefense = (ivValue >> 25) & 0x1F; // 5 bits for Special Defense

    return [
        hp,
        attack,
        defense,  
        spAttack,
        spDefense,
        speed,
    ];
}

function getCheckSum(dataToUpdate) {
    // Precomputed lookup table
    const table = new Uint16Array([
        0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50A5, 0x60C6, 0x70E7,
        0x8108, 0x9129, 0xA14A, 0xB16B, 0xC18C, 0xD1AD, 0xE1CE, 0xF1EF,
        0x1231, 0x0210, 0x3273, 0x2252, 0x52B5, 0x4294, 0x72F7, 0x62D6,
        0x9339, 0x8318, 0xB37B, 0xA35A, 0xD3BD, 0xC39C, 0xF3FF, 0xE3DE,
        0x2462, 0x3443, 0x0420, 0x1401, 0x64E6, 0x74C7, 0x44A4, 0x5485,
        0xA56A, 0xB54B, 0x8528, 0x9509, 0xE5EE, 0xF5CF, 0xC5AC, 0xD58D,
        0x3653, 0x2672, 0x1611, 0x0630, 0x76D7, 0x66F6, 0x5695, 0x46B4,
        0xB75B, 0xA77A, 0x9719, 0x8738, 0xF7DF, 0xE7FE, 0xD79D, 0xC7BC,
        0x48C4, 0x58E5, 0x6886, 0x78A7, 0x0840, 0x1861, 0x2802, 0x3823,
        0xC9CC, 0xD9ED, 0xE98E, 0xF9AF, 0x8948, 0x9969, 0xA90A, 0xB92B,
        0x5AF5, 0x4AD4, 0x7AB7, 0x6A96, 0x1A71, 0x0A50, 0x3A33, 0x2A12,
        0xDBFD, 0xCBDC, 0xFBBF, 0xEB9E, 0x9B79, 0x8B58, 0xBB3B, 0xAB1A,
        0x6CA6, 0x7C87, 0x4CE4, 0x5CC5, 0x2C22, 0x3C03, 0x0C60, 0x1C41,
        0xEDAE, 0xFD8F, 0xCDEC, 0xDDCD, 0xAD2A, 0xBD0B, 0x8D68, 0x9D49,
        0x7E97, 0x6EB6, 0x5ED5, 0x4EF4, 0x3E13, 0x2E32, 0x1E51, 0x0E70,
        0xFF9F, 0xEFBE, 0xDFDD, 0xCFFC, 0xBF1B, 0xAF3A, 0x9F59, 0x8F78,
        0x9188, 0x81A9, 0xB1CA, 0xA1EB, 0xD10C, 0xC12D, 0xF14E, 0xE16F,
        0x1080, 0x00A1, 0x30C2, 0x20E3, 0x5004, 0x4025, 0x7046, 0x6067,
        0x83B9, 0x9398, 0xA3FB, 0xB3DA, 0xC33D, 0xD31C, 0xE37F, 0xF35E,
        0x02B1, 0x1290, 0x22F3, 0x32D2, 0x4235, 0x5214, 0x6277, 0x7256,
        0xB5EA, 0xA5CB, 0x95A8, 0x8589, 0xF56E, 0xE54F, 0xD52C, 0xC50D,
        0x34E2, 0x24C3, 0x14A0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
        0xA7DB, 0xB7FA, 0x8799, 0x97B8, 0xE75F, 0xF77E, 0xC71D, 0xD73C,
        0x26D3, 0x36F2, 0x0691, 0x16B0, 0x6657, 0x7676, 0x4615, 0x5634,
        0xD94C, 0xC96D, 0xF90E, 0xE92F, 0x99C8, 0x89E9, 0xB98A, 0xA9AB,
        0x5844, 0x4865, 0x7806, 0x6827, 0x18C0, 0x08E1, 0x3882, 0x28A3,
        0xCB7D, 0xDB5C, 0xEB3F, 0xFB1E, 0x8BF9, 0x9BD8, 0xABBB, 0xBB9A,
        0x4A75, 0x5A54, 0x6A37, 0x7A16, 0x0AF1, 0x1AD0, 0x2AB3, 0x3A92,
        0xFD2E, 0xED0F, 0xDD6C, 0xCD4D, 0xBDAA, 0xAD8B, 0x9DE8, 0x8DC9,
        0x7C26, 0x6C07, 0x5C64, 0x4C45, 0x3CA2, 0x2C83, 0x1CE0, 0x0CC1,
        0xEF1F, 0xFF3E, 0xCF5D, 0xDF7C, 0xAF9B, 0xBFBA, 0x8FD9, 0x9FF8,
        0x6E17, 0x7E36, 0x4E55, 0x5E74, 0x2E93, 0x3EB2, 0x0ED1, 0x1EF0
    ]);
    let sum = 0xFFFF;
    const view = new Uint8Array(dataToUpdate);
    for (let i = 0; i < view.length; i++) {
        sum = ((sum << 8) ^ table[(view[i] ^ (sum >> 8)) & 0xFF]) & 0xFFFF;
    }
    return '0x' + (sum & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function getPKMNCheckSum(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum & 0xFFFF; 
}


// updates the selected party pokemon with the battle stats displayed on showdown calc, and edges exp to max
function updatePartyPKMN(edge=false) {
    var partyOffset = partyCountOffset + 4

    const partyIndex = partyMons[$('.set-selector')[0].value.split("(")[0].trim()]
    const decryptedBattleStat = decryptedBattleStats[partyIndex]
    const updatedBattleStat = updateBattleStat(decryptedBattleStat)
    const level = decryptedBattleStat[2] 



    edge = confirm("Would you like to edge exp to max as well? Clicking cancel will only update hp and status")
    if (edge) {
        // edge exp
        var i = partyIndex
        // get target exp from exp tables
        var desiredExp = expTables[partyExpTables[i]][level] - 1

        // write the new exp to the pokemon data 
        savParty[i][partyExpIndexes[i]] = desiredExp & 0xFFFF
        savParty[i][partyExpIndexes[i] + 1] = (desiredExp >>> 16) & 0xFFFF


        console.log(desiredExp)

        var newPartyPokCheckSum = getPKMNCheckSum(savParty[i])
        var encryptedPok = encryptData(savParty[i], newPartyPokCheckSum)
        var uint8PokArray = convert16BitWordsToUint8Array(encryptedPok)


        // write checksum for main pkmn data
        view.set([newPartyPokCheckSum & 0xFF, (newPartyPokCheckSum >>> 8) & 0xFF], partyOffset + (i * partyPokSize) + 6)
        view.set(uint8PokArray, partyOffset + (i * partyPokSize) + 8)  
        changelog += `<p>Party ${$('.set-selector')[0].value.split("(")[0].trim()} edged</p>`
    }
    
    // update battle stats
    var encryptedBattleStat = encryptData(updatedBattleStat, partyPIDs[partyIndex], battleStatSize)
    uint8PokArray = convert16BitWordsToUint8Array(encryptedBattleStat)
    view.set(uint8PokArray, partyOffset + (partyIndex * partyPokSize) + 136)

    changelog += `<p>Party ${$('.set-selector')[0].value.split("(")[0].trim()} hp/status updated</p>`
    $('#changelog').html(changelog)

    if (baseGame != "BW") {
        setSmallBlockChecksum()   
    }
    addSaveBtn()
}

$('#edge').click(function() {
    edgeSelected()
})

function setSmallBlockChecksum() {
    var checkSum = getCheckSum(view.slice(smallBlockStart, smallBlockSize + smallBlockStart - footerSize))
    view.set([checkSum & 0xFF, (checkSum >>> 8) & 0xFF], smallBlockSize + smallBlockStart - 2)
}

function edgeSelected(maxIVs=false) {
    var selected = getSelectedPoks()

    var level = parseInt(prompt("Edge selection to level: "))

    if (selected.length == 0) {
        alert("Nothing selected")
        return
    }

    for (let i = 0;i < selected.length; i++) {
        if (!boxPokOffsets[selected[i]]) {
            alert(`${selected[i]} not found in pc box, please select ${selected[i]} and edit the level there click save changes to edge party pokemon`)
            return
        }

        var boxPokData = boxPokOffsets[selected[i]]
        var expTable = expTables[boxPokData["exp_table"]]
        var desiredExp = expTable[level - 1] - 1

        var decryptedData = boxPokData["decryptedData"]
        decryptedData[boxPokData["exp_index"]] = desiredExp & 0xFFFF
        decryptedData[boxPokData["exp_index"] + 1] = (desiredExp >>> 16) & 0xFFFF


        var newBoxPokCheckSum = getPKMNCheckSum(decryptedData)
        var encryptedPok = encryptData(decryptedData, newBoxPokCheckSum)
        var uint8PokArray = convert16BitWordsToUint8Array(encryptedPok)

        view.set([newBoxPokCheckSum & 0xFF, (newBoxPokCheckSum >>> 8) & 0xFF], boxPokData["offset"] + 6)
        view.set(uint8PokArray, boxPokData["offset"] + 8)

        changelog += `<p>${selected[i]} edged to level ${level}</p>`
    }

    if (baseGame != "BW") {
        var checkSum = getCheckSum(view.slice(bigBlockStart, bigBlockStart + bigBlockSize - footerSize))
        view.set([checkSum & 0xFF, (checkSum >>> 8) & 0xFF], bigBlockStart + bigBlockSize - 2)
    } 
    addSaveBtn()

    $('#changelog').html(changelog)
}

function maxAll() {
    var selected = getAllPoks()

     for (let i = 0;i < selected.length; i++) {
        if (!boxPokOffsets[selected[i]]) {
            continue
        
        }

        var boxPokData = boxPokOffsets[selected[i]]
        var decryptedData = boxPokData["decryptedData"]

        var newBoxPokCheckSum = getPKMNCheckSum(decryptedData)
        var encryptedPok = encryptData(decryptedData, newBoxPokCheckSum)
        var uint8PokArray = convert16BitWordsToUint8Array(encryptedPok)

        view.set([newBoxPokCheckSum & 0xFF, (newBoxPokCheckSum >>> 8) & 0xFF], boxPokData["offset"] + 6)
        view.set(uint8PokArray, boxPokData["offset"] + 8)

    }

    if (baseGame != "BW") {
        var checkSum = getCheckSum(view.slice(bigBlockStart, bigBlockStart + bigBlockSize - footerSize))
        view.set([checkSum & 0xFF, (checkSum >>> 8) & 0xFF], bigBlockStart + bigBlockSize - 2)
    } 
    setSmallBlockChecksum()   
    addSaveBtn()

}

function addSaveBtn() {
    $('#download-sav').remove()
    $('#read-save').after(`<button id="download-sav" class="bs-btn bs-btn-default" onClick='downloadSave()'>Download .sav</button>`)
}


function encryptData(decryptedData, checksum, wordCount=64) {
    const encryptedData = [];
    let X = checksum; // Initialize PRNG with checksum as seed

    for (let i = 0; i < wordCount; i++) {
        // Advance the PRNG state
        X = (BigInt(0x41C64E6D) * BigInt(X) + BigInt(0x6073)) & BigInt(0xFFFFFFFF);

        // Extract the top 16 bits for XOR
        const prngValue = Number((X >> BigInt(16)) & BigInt(0xFFFF));

        // Encrypt by applying XOR to the decrypted data
        const encryptedWord = decryptedData[i] ^ prngValue;

        // Store encrypted word
        encryptedData.push(encryptedWord);
    }

    return encryptedData;
}


function convert16BitWordsToUint8Array(words) {
    const byteArray = new Uint8Array(words.length * 2); // Each word produces 2 bytes
    for (let i = 0; i < words.length; i++) {
        // Get the current 16-bit word
        const word = words[i];

        // Split into two bytes and store in little-endian format
        byteArray[i * 2] = word & 0xFF; // Lower byte
        byteArray[i * 2 + 1] = (word >> 8) & 0xFF; // Higher byte
    }
    return byteArray;
}


function downloadSave() {
    if (baseGame == "BW") {
        setBWChecksums()
    }

    const blob = new Blob([view], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${TITLE}_edited.sav`; 

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getSelectedPoks() {
    var selected = []
    $('.player-party .left-side').each(function() {
        selected.push($(this).attr('data-id').split(" (My")[0])
    })
    return selected
}

function getAllPoks() {
    var selected = []
    $('#p1 .trainer-pok-list .left-side').each(function() {
        selected.push($(this).attr('data-id').split(" (My")[0])
    })
    return selected
}

function bedtime() {
    for (let i=0;i<partyCount;i++) {
        var battleStat = decryptedBattleStats[i]

        battleStat[0] = 1

        var encryptedBattleStat = encryptData(battleStat, partyPIDs[i], battleStatSize)
        uint8PokArray = convert16BitWordsToUint8Array(encryptedBattleStat)
        view.set(uint8PokArray, partyCountOffset + 4 + (i * partyPokSize) + 136)
    }

    changelog += `<p>Full Party set to 1 turn sleep </p>`
    $('#changelog').html(changelog)
    setSmallBlockChecksum()   
    addSaveBtn()

}

function updateBattleStat(battleStat, onlySleep=false) {
    const level = parseInt($('#levelL1').val())
    const currentHp = parseInt($('#currentHpL1').val())

    var monStats = $('tbody span.total') 
        
    const hp = parseInt(monStats[0].innerHTML)
    const ata = parseInt(monStats[1].innerHTML)
    const def = parseInt(monStats[2].innerHTML)
    const spa = parseInt(monStats[3].innerHTML)
    const spd = parseInt(monStats[4].innerHTML)
    const spe = parseInt(monStats[6].innerHTML)

    const status = $('#statusL1').val()
    const newLevel = level

    battleStat[2] = newLevel
    battleStat[3] = currentHp
    battleStat[4] = hp
    battleStat[5] = ata
    battleStat[6] = def
    battleStat[7] = spe
    battleStat[8] = spa
    battleStat[9] = spd

    if (baseGame != "BW") {
        if (status == "Poisoned") {
            battleStat[0] = 0 | (1 << 3)
        } else if (status == "Asleep") {
            battleStat[0] = 1
        } else if (status == "Burned") {
            battleStat[0] = 0 | (1 << 4)   
        } else if (status == "Paralyzed") {
            battleStat[0] = 0| (1 << 6)   
        } else if (status == "Frozen") {
            battleStat[0] = 0 | (1 << 5)   
        } else if (status == "Badly Poisoned") {
            battleStat[0] = 0 | (1 << 7)   
        }
    } else {
        if (status == "Poisoned") {
            battleStat[0] = 5
        } else if (status == "Asleep") {
            battleStat[0] = 2
        } else if (status == "Burned") {
            battleStat[0] = 4  
        } else if (status == "Paralyzed") {
            battleStat[0] = 1 
        } else if (status == "Frozen") {
            battleStat[0] = 3 
        } else if (status == "Badly Poisoned") {
            battleStat[0] = 6
        }
    }
    return battleStat
}




