document.getElementById('save-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // Convert the binary string to ArrayBuffer for easier access
                const binaryData = e.target.result;
                const buffer = new ArrayBuffer(binaryData.length);
                const view = new Uint8Array(buffer);

                for (let i = 0; i < binaryData.length; i++) {
                    view[i] = binaryData.charCodeAt(i);
                }

                

                if (baseGame == "Pt") {
                    smallBlock1SaveCount = read32BitIntegerFromUint8Array(view,  0x0CF1C)
                    smallBlock2SaveCount = read32BitIntegerFromUint8Array(view,  0x4CF1C)
                    if (smallBlock2SaveCount > smallBlock1SaveCount) {
                        partyCountOffset += 0x40000
                        blockId = read32BitIntegerFromUint8Array(view,  0x4CF1C - 4)
                        console.log("now reading party from block 2")
                    } else {
                        console.log("now reading party from block 1")
                        blockId = read32BitIntegerFromUint8Array(view,  0x0CF1C - 4)
                    }

                    block1Id = read32BitIntegerFromUint8Array(view,  0x1f0fc)
                    console.log(blockId)
                    console.log(block1Id)
                    if (block1Id != blockId) {
                        boxDataOffset += 0x40000
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

                // Step 2: Loop 'n' times to read and decrypt each 236-byte chunk
                
                if (baseGame == "Pt" || baseGame == "HGSS") {
                    CHUNK_SIZE = 236
                } else {
                    CHUNK_SIZE = 220
                }

                var offset = partyCountOffset + 4;
                
                var showdownImport = ""

                var checkSum = getCheckSum(view.slice(0, 0xcf18))

                console.log("Checksum: ", checkSum)

                for (let i = 0; i < n; i++) {
                    // Extract the chunk of 236 bytes from the binary data
                   chunk = view.slice(offset, offset + CHUNK_SIZE);
                   showdownImport += parsePKM(chunk, true)
                   offset += CHUNK_SIZE                 
                }


                offset = boxDataOffset
                CHUNK_SIZE = 136
                n = 510
                savParty = []

                if (baseGame == "BW") {
                    n = 690
                }


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
                   savParty.push(chunk)
                   showdownImport += parsePKM(chunk)
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

    // The decryptData function, as described earlier
    function decryptData(encryptedData, checksum) {
        const decryptedData = [];
        const WORD_COUNT = 64; // 64 2-byte words
        let X = checksum; // Initialize PRNG with checksum as seed

        for (let i = 0; i < WORD_COUNT; i++) {
            // Advance the PRNG state
            X = (BigInt(BigInt(0x41C64E6D) * BigInt(X)) + BigInt(0x6073)); 


            // Extract the top 16 bits for XOR

            prngValue = parseInt(BigInt(X) >> BigInt(16) & BigInt(0XFFFF))

            // Decrypt by reversing the XOR operation

            const decryptedWord = encryptedData[i] ^ prngValue;

            // console.log(X, encryptedData[i], prngValue, decryptedWord)

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


    function parsePKM(chunk, is_party=false) {

        var showdownString = ""

         // Extract the first 4 bytes and convert them to a 32-bit integer
        pv = read32BitIntegerFromUint8Array(chunk)



        if (pv == 0) {
            return ""
        }
        var nature = natures[Math.abs(pv) % 25]

 
        // Perform the function on pv: ((pv & 0x3E000) >> 0xD) % 24
        const shiftValue = ((pv & 0x3E000) >> 0xD) % 24;

        shiftOrder = blockOrders[shiftValue]

        // Extract the 2-byte checksum at offset 0x06 within the chunk
        const checksum = (chunk[0x07] << 8) | chunk[0x06];

        
        chunk = chunk.slice(8,136)



        // Convert chunk to array of 16-bit words (2-byte integers) for decryption
        const encryptedData = [];
            for (let j = 0; j < 128; j += 2) {
                const word = (chunk[j + 1] << 8) | chunk[j];
                encryptedData.push(word);
            }

        // Step 3: Decrypt the data using the checksum
        const decryptedData = decryptData(encryptedData, checksum);

        // Store decrypted chunk
        decryptedChunks.push(decryptedData);

        console.log(getPKMNCheckSum(decryptedData), checksum)

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

        var iv_value = (decryptedData[move_data_offset + 9] << 16) | (decryptedData[move_data_offset + 8]  & 0xFFFF) 


        ivs = getIVs(iv_value) 








        if (is_party) {
            mon_name += " |Party|"
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
        speed,
        spAttack,
        spDefense
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

    // Return the lower 16 bits of the sum
    return sum & 0xFFFF; // Mask with 0xFFFF to get the lower 16 bits
}

function updatePartyPKMN(view, pkmn, partyIndex) {

}