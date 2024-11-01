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

                // Step 1: Get 'n' from offset 0x9C (single byte)
                var n = view[partyCountOffset];
                console.log(n)

                // Initialize an array to store decrypted chunks
                decryptedChunks = [];

                // Step 2: Loop 'n' times to read and decrypt each 236-byte chunk
                
                if (baseGame == "Pt" || baseGame == "HGSS") {
                    CHUNK_SIZE = 236
                } else {
                    CHUNK_SIZE = 220
                }

                var offset = partyDataOffset;
                
                var showdownImport = ""

                for (let i = 0; i < n; i++) {
                    // Extract the chunk of 236 bytes from the binary data
                   chunk = view.slice(offset, offset + CHUNK_SIZE);
                   showdownImport += parsePKM(chunk, true)
                   offset += CHUNK_SIZE                 
                }


                offset = boxDataOffset
                CHUNK_SIZE = 136
                n = 540

                if (baseGame == "BW") {
                    n = 720
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
        var nature = natures[pv % 25]

 
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

        var mon_data_offset = shiftOrder.indexOf(0) * 16
        var move_data_offset = shiftOrder.indexOf(1) * 16

        var mon_name = sav_pok_names[decryptedData[mon_data_offset]]


        if (mon_name in mon_forms) {
            var form_index = (decryptedData[move_data_offset + 12] >> 3 & 0x1F) - 1
            console.log(mon_name, decryptedData[move_data_offset + 12], (decryptedData[move_data_offset + 12] >> 3 & 0x1F) - 1)  
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
