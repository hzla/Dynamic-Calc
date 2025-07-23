
$('#read-save').click(function(){
    $('#save-upload')[0].value = null
})

document.getElementById('save-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        saveFileName = $('#save-upload').val().split("\\").pop()
        savExt = saveFileName.slice(-3)

        reader.onload = function(e) {
            // Convert the binary string to ArrayBuffer for easier access
            const buffer = e.target.result;
            view = new Uint8Array(buffer);
            saveFile = new DataView(buffer);
            saveUploaded = true;


            let lvlCap = $('#lvl-cap').val()  || 1

            changelog = "<h4>Changelog:</h4>"
            changelog += `<p>${saveFileName} loaded</p>`
            if ($('#changelog').length == 0) {
               $('#clearSets').after("<p id='changelog'></p>") 
            }
            $('#changelog').html(changelog).show()
            

            save_index_a_offset = 0xffc
            save_block_b_offset = 0x00E000
            trainer_id_offset = 0xa
            save_index_b_offset = save_block_b_offset + save_index_a_offset

            const save_index_a = saveFile.getUint16(save_index_a_offset, true)
            const save_index_b = saveFile.getUint16(save_index_b_offset, true)
            var block_offset = 0


            if (save_index_b > save_index_a || save_index_a == 65535) {
                 block_offset = save_block_b_offset
            }

            var save_index = Math.max(save_index_a, save_index_b)
            if (save_index_b == 65535) {save_index = save_index_a }
            if (save_index_a == 65535) { save_index = save_index_b }

            const rotation = (save_index % 14) 
            const total_offset = rotation * 4096

            let offset = 0;
            const magicValue = 0x0202;

            let pokCount = 0


            let lastFoundAt = 0

            let showdownText = ""

            while (offset < saveFile.byteLength - 1) { 
                const value = saveFile.getUint16(offset, true); 
                
                if (value === magicValue) {
                    lastFoundAt = offset

                    // move back 18 bytes and get PID, TID, and custom nature info
                    offset -= 18
                    let pid = saveFile.getUint32(offset, true)
                    offset += 4
                    let tid = saveFile.getUint32(offset, true)
                    offset += 4
                    let moddedNature = (saveFile.getUint16(offset, true) >> 13) && 0b11111

                    // substructs are scrambled according to PID
                    let suborder = orderFormats[pid % 24]
                   

                    let key = pid ^ tid
                    let decrypted = []


                    offset = lastFoundAt + 14

                    // decrypt substructs
                    for (let i = 0; i <= 11; i++) {
                        let block = saveFile.getUint32(offset , true) ^ key
                        decrypted.push(block)
                        offset += 4
                    }

                    let growth_index = suborder.indexOf(1)
                    let moves_index = suborder.indexOf(2)
                    let evs_index = suborder.indexOf(3)
                    let misc_index = suborder.indexOf(4)


                    // get Species
                    let speciesId = [decrypted[growth_index * 3]] & 0x07FF
                    // for Inclement Emerald
                    if (TITLE.includes("Inclement") && speciesId > 899) {
                        speciesId += 7
                    }
                    let speciesName = emImpMons[speciesId]



                    // Skip if species id out of bounds
                    if (!speciesName || speciesName == "None") {
                        offset = lastFoundAt + 2
                        continue
                    }


                    // Try Substitute Spaces for Dashes if pokemon name doesn't exist
                    if (!pokedex[speciesName]) {
                        speciesName = speciesName.replace(" ", "-")
                    }

                    // get Item
                    let itemId = [decrypted[growth_index * 3]] >> 16 & 0x07FF
                    
                    // get nature
                    let monNature = 0
                    if (TITLE.includes("Inclement")) {
                        let natureByte = [decrypted[misc_index * 3]] >> 16 & 0x07FF
                        monNature = natures[natureByte & 31744 >> 10]   
                    } else {
                        monNature = natures[pid % 25]
                        if (moddedNature <= 26) {
                            monNature = natures[moddedNature]
                        }
                    }

                    // get evs
                    let int1 = decrypted[evs_index * 3]
                    let int2 = decrypted[evs_index * 3 + 1]

                    let evs = []

                    evs[0] = (int1 & 0xFF)
                    evs[1] = ((int1 >> 8) & 0xFF)
                    evs[2] = ((int1 >> 16) & 0xFF)
                    evs[3]= ((int1 >> 24) & 0xFF)
                    evs[4] = (int2 & 0xFF)
                    evs[5] = ((int2 >> 8) & 0xFF)

                    // skip if pokemon has evs and evs are turned off
                    if (evs[0] +  evs[1] +  evs[2] +  evs[3] +  evs[4] +  evs[5] > 0 && !hasEvs) {
                        offset = lastFoundAt + 2
                        continue
                    }

                    // get moves
                    let move1 = pokeemeraldMoves[[decrypted[moves_index * 3]] & 0x07FF]
                    let move2 = pokeemeraldMoves[[decrypted[moves_index * 3]] >> 16 & 0x07FF]
                    let move3 = pokeemeraldMoves[[decrypted[moves_index * 3 + 1]] & 0x07FF]
                    let move4 = pokeemeraldMoves[[decrypted[moves_index * 3 + 1]] >> 16 & 0x07FF]

                    let moves = [move1, move2, move3, move4]

                    // skip if any moves out of bounds or duplicates moves that aren't "None"
                    if (hasInvalidMoves(moves)) {
                        offset = lastFoundAt + 2
                        continue
                    }

                    // get ivs 
                    let ivs = getIVs(decrypted[misc_index * 3 + 1])

                    // get ability

                    let abilitySlot = 0

                    if (TITLE.includes("Inclement")) {
                        abilitySlot = decrypted[misc_index * 3 + 2] & 96 >> 5
                    } else {
                        abilitySlot = decrypted[misc_index * 3 + 2] >> 29 & 0b11
                        if (abils[speciesName]) {
                            abilitySlot = abils[speciesName][abilitySlot]
                        }           
                    }
                    




                    if (nn.toLowerCase() != speciesName.toLowerCase() && !(speciesName.toLowerCase().includes(nn.toLowerCase().trim()))) {
                    
                        if (nn.toLowerCase().includes(speciesName.toLowerCase())) {
                            showdownText += `${speciesName}`
                        } else {
                            showdownText += `${nn} (${speciesName})`
                        }

                       
                    } else {
                        showdownText += `${speciesName}`
                    }

                    
                    if (itemId != 0) {
                        showdownText += ` @ ${itemTitleize(emImpItems[itemId])}`
                    }
                    showdownText += "\n"
                    showdownText += `Level: ${lvlCap}\n`
                    showdownText += `${monNature} Nature\n`

                    if (hasEvs) {
                        showdownText += `EVs: ${evs[0]} HP / ${evs[1]} Atk / ${evs[2]} Def / ${evs[3]} Spe / ${evs[4]} SpA / ${evs[5]} SpD\n`
                    }
                    showdownText += `IVs: ${ivs[0]} HP / ${ivs[1]} Atk / ${ivs[2]} Def / ${ivs[3]} Spe / ${ivs[4]} SpA / ${ivs[5]} SpD\n`

                    showdownText += `Ability: ${abilitySlot}\n`
                    showdownText += `- ${move1}\n`
                    showdownText += `- ${move2}\n`
                    showdownText += `- ${move3}\n`
                    showdownText += `- ${move4}\n\n`
                    offset = lastFoundAt + 2
                } else {
                    offset += 2; 
                }   
            }
            $('.import-team-text').val(showdownText)    
        };
        reader.readAsArrayBuffer(file);
    }
});

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
        speed,
        spAttack,
        spDefense,
    ];
}

function hasInvalidMoves(arr) {
    const seen = new Set();
    
    for (const item of arr) {
        // Check for undefined
        if (item === undefined) {
            return true;
        }

        if (item !== "None") {
            if (seen.has(item)) {
                return true;
            }
            seen.add(item);
        }
    }    
    return false;
}

function itemTitleize(item) {
    return item.toLowerCase().split(/([ _-])/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('').replace("_", " ").replace("Never Melt", "Never-Melt")
}

const orderFormats = [[1,2,3,4],         
                        [1,2,4,3],          
                        [1,3,2,4],          
                        [1,3,4,2],          
                        [1,4,2,3],          
                        [1,4,3,2],          
                        [2,1,3,4],
                        [2,1,4,3],
                        [2,3,1,4],
                        [2,3,4,1],
                        [2,4,1,3],
                        [2,4,3,1],
                        [3,1,2,4],
                        [3,1,4,2],
                        [3,2,1,4],
                        [3,2,4,1],
                        [3,4,1,2],
                        [3,4,2,1],
                        [4,1,2,3],
                        [4,1,3,2],
                        [4,2,1,3],
                        [4,2,3,1],
                        [4,3,1,2],
                        [4,3,2,1]]







