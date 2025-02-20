class gen3Save {
    // Utility method to get bits from a number
    static middleBitsFromIndex(number, m, n) {
        const mask = (1 << n) - 1;
        return (number >> m) & mask;
    }

    // Natures array
    static getNatures() {
        return [
            "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
            "Bold", "Docile", "Relaxed", "Impish", "Bad",
            "Timid", "Hasty", "Serious", "Jolly", "Naive",
            "Modest", "Mild", "Quiet", "Bashful", "Rash",
            "Calm", "Gentle", "Sassy", "Careful", "Quirky"
        ];
    }

    // Custom data reading methods for ArrayBuffer/Uint8Array
    static readUInt8(data, offset) {
        return Math.abs(data[offset]);
    }

    static readUInt16LE(data, offset) {
        return Math.abs(data[offset] | (data[offset + 1] << 8));
    }

    static readUInt32LE(data, offset) {
        return Math.abs(data[offset] 
            | (data[offset + 1] << 8) 
            | (data[offset + 2] << 16) 
            | (data[offset + 3] << 24));
    }

    // Slice method for Uint8Array
    static sliceData(data, start, end) {
        return data.slice(start, end);
    }

    // Compare method for Uint8Array
    static compareData(data1, data2) {
        if (data1.length !== data2.length) return false;
        for (let i = 0; i < data1.length; i++) {
            if (data1[i] !== data2[i]) return false;
        }
        return true;
    }

    // Order formats for decryption
    static orderFormats() {
        return [
            [1,2,3,4], [1,2,4,3], [1,3,2,4], [1,3,4,2],
            [1,4,2,3], [1,4,3,2], [2,1,3,4], [2,1,4,3],
            [2,3,1,4], [2,3,4,1], [2,4,1,3], [2,4,3,1],
            [3,1,2,4], [3,1,4,2], [3,2,1,4], [3,2,4,1],
            [3,4,1,2], [3,4,2,1], [4,1,2,3], [4,1,3,2],
            [4,2,1,3], [4,2,3,1], [4,3,1,2], [4,3,2,1]
        ];
    }

    // Parse moves for Radical Red
    static parseMoves(movesBinary, allMoves) {
        const moves = [];
        for (let n = 0; n < 4; n++) {
            const start = n * 10;
            const end = (n + 1) * 10;
            const moveBits = movesBinary.slice(start, end).split('').reverse().join('');
            const moveId = parseInt(moveBits, 2);
            moves.push(allMoves[moveId]);
        }
        return moves;
    }

    // Main read method
    static read(saveData, options = {}) {
        const {
            staticLevel = 100, 
            game = "inc_em", 
            manualOffset = 0,
            allMoves = inc_em_moves, // Passed in moves list
            allMons = inc_em_mons,  // Passed in monsters list
            abils = {}     // Passed in abilities
        } = options;

        // Special case for Radical Red
        if (game === "rad_red") {
            return this.readRadRed(saveData, { staticLevel, allMoves, allMons, abils });
        }

        const saveIndexAOffset = 0xffc;
        const saveBlockBOffset = 0x00E000;
        const trainerIdOffset = 0xa;
        const saveIndexBOffset = saveBlockBOffset + saveIndexAOffset;

        const saveIndexA = this.readUInt16LE(saveData, saveIndexAOffset);
        const saveIndexB = this.readUInt16LE(saveData, saveIndexBOffset);
        let blockOffset = 0;

        if (saveIndexB > saveIndexA || saveIndexA === 65535) {
            blockOffset = saveBlockBOffset;
        }

        const save = this.sliceData(saveData, blockOffset, blockOffset + 57343);

        let saveIndex = Math.max(saveIndexA, saveIndexB);
        if (saveIndexB === 65535) saveIndex = saveIndexA;
        if (saveIndexA === 65535) saveIndex = saveIndexB;

        saveIndex -= manualOffset;
        const rotation = saveIndex % 14;
        const totalOffset = rotation * 4096;

        const newTrainerIdOffset = totalOffset + trainerIdOffset;
        const trainerId = this.readUInt32LE(saveData, newTrainerIdOffset);
        const boxOffset = (20480 + 4 + totalOffset) % 57344;
        const partyOffset = (totalOffset + 4096 + 0x238) % 57344;

        let boxData = this.sliceData(save, partyOffset, partyOffset + 599);



        for (let n = 0; n < 9; n++) {
            const boxStart = ((n * 4096) + boxOffset) % 57344;
            const pcBox = this.sliceData(save, boxStart, boxStart + 4096);
            boxData = new Uint8Array([...boxData, ...pcBox]);
        }

        const trainerString = new Uint8Array([0x02, 0x02]);
        let monCount = 0;
        let importData = "";
        const natures = this.getNatures();

        for (let n = 0; n < boxData.length; n += 2) {
            if (!this.compareData(
                this.sliceData(boxData, n, n+2), 
                trainerString
            )) continue;

            if (n > 34200) break;

            const monData = this.sliceData(boxData, n-18, n+62);
            const pid = this.readUInt32LE(monData, 0);
            const tid = this.readUInt32LE(monData, 4);
            const subOrder = this.orderFormats()[pid % 24];

            const key = tid ^ pid;
            const showdownData = this.sliceData(monData, 32);

            const decrypted = [];
            for (let m = 0; m < 12; m++) {
                const start = m * 4;
                const block = this.readUInt32LE(showdownData, start);
                decrypted.push(block ^ key);
            }

            const growthIndex = subOrder.indexOf(1);
            const movesIndex = subOrder.indexOf(2);
            const miscIndex = subOrder.indexOf(4);

            // Extracting species ID with bitwise operations
            const speciesIdBuffer = new Uint8Array(4);
            for (let i = 0; i < 4; i++) {
                speciesIdBuffer[i] = (decrypted[growthIndex * 3] >> (i * 8)) & 0xFF;
            }
            let speciesId = speciesIdBuffer[0] | (speciesIdBuffer[1] << 8);
            speciesId = speciesId > 899 ? speciesId + 7 : speciesId;

            // Nature extraction
            const natureByte = ((decrypted[miscIndex * 3] >> 16) & 0x1F) << 5;
            const nature = natures[natureByte >> 10];

            // Move extraction
            const moves = [
                allMoves[this.readUInt16LE(new Uint8Array(decrypted[movesIndex * 3]), 0)],
                allMoves[this.readUInt16LE(new Uint8Array(decrypted[movesIndex * 3]), 2)],
                allMoves[this.readUInt16LE(new Uint8Array(decrypted[movesIndex * 3 + 1]), 0)],
                allMoves[this.readUInt16LE(new Uint8Array(decrypted[movesIndex * 3 + 1]), 2)]
            ];

            // IV extraction
            const ivs = decrypted[miscIndex * 3 + 1];
            const ivStats = ["HP", "Atk", "Def", "Spe", "SpA", "SpD"];
            const ivSpread = ivStats.map((stat, i) => 
                `${this.middleBitsFromIndex(ivs, i * 5, 5)} ${stat}`
            ).join(" / ");

            const abilitySlot = (decrypted[miscIndex * 3 + 2] & 96) >> 5;

            const isParty = n <= 600 ? " |Party|" : "";

            importData += `${allMons[speciesId].trim()}${isParty}\n`;
            importData += `Level: ${staticLevel}\n`;
            importData += `${nature} Nature\n`;
            importData += `IVs: ${ivSpread}\n`;
            importData += `Ability: ${abilitySlot}\n`;
            moves.forEach(m => importData += `- ${m}\n`);
            importData += "\n";

            monCount++;
            n += 44;
        }

        $('.import-team-text').text(importData)

        return {
            importData,
            debugInfo: {
                saveIndexA,
                saveIndexB
            }
        };
    }

    // Radical Red specific reader
    static readRadRed(saveData, options = {}) {
        const {
            staticLevel = 100, 
            allMoves = [], 
            allMons = [], 
            abils = {}
        } = options;

        const saveIndexAOffset = 0xffc;
        const saveBlockBOffset = 0x00E000;
        const trainerIdOffset = 0xa;
        const saveIndexBOffset = saveBlockBOffset + saveIndexAOffset;

        const saveIndexA = this.readUInt16LE(saveData, saveIndexAOffset);
        const saveIndexB = this.readUInt16LE(saveData, saveIndexBOffset);
        let blockOffset = 0;

        if (saveIndexB > saveIndexA && saveIndexB !== 65535) {
            blockOffset = saveBlockBOffset;
        }

        const save = this.sliceData(saveData, blockOffset, blockOffset + 57343);

        let saveIndex = Math.max(saveIndexA, saveIndexB);
        if (saveIndexB === 65535) saveIndex = saveIndexA;
        if (saveIndexA === 65535) saveIndex = saveIndexB;

        let adjustment = 53248;
        if (saveIndexB + saveIndexA >= 65535) {
            adjustment = 0;
        }

        const rotation = saveIndex % 14;
        const totalOffset = (rotation * 4096 + adjustment) % 57344;
        let partyOffset = (totalOffset + 4096 + 0x38) % 57344;
        let partyCount = this.readUInt8(save, partyOffset - 4);

        if (partyCount === 0) {
            adjustment = 0;
            const totalOffset = (rotation * 4096 + adjustment) % 57344;
            partyOffset = (totalOffset + 4096 + 0x38) % 57344;
            partyCount = this.readUInt8(save, partyOffset - 4);
        }

        const boxOffset = (20480 + 4 + totalOffset) % 57344;
        let boxData = this.sliceData(save, partyOffset, partyOffset + 599);

        for (let n = 0; n < 9; n++) {
            const boxStart = ((n * 4096) + boxOffset) % 57344;
            const pcBox = this.sliceData(save, boxStart, boxStart + 4096);
            boxData = new Uint8Array([...boxData, ...pcBox]);
        }

        const magicString = new Uint8Array([0x02, 0x02]);
        let monCount = 0;
        let importData = "";
        const natures = this.getNatures();

        for (let n = 0; n < boxData.length; n += 2) {
            if (!this.compareData(
                this.sliceData(boxData, n, n+2), 
                magicString
            )) continue;

            const isParty = monCount < partyCount ? " |Party|" : "";
            const showdownData = monCount < partyCount 
                ? this.sliceData(boxData, n+14, n+57)
                : this.sliceData(boxData, n+10, n+40);

            const pid = this.readUInt32LE(boxData, n-18);
            const nature = natures[pid % 25];
            let abilitySlot = pid % 2 === 0 ? 0 : 1;

            if (this.readUInt8(showdownData, showdownData.length - 1) === 191) {
                abilitySlot = 2; // Dream ability
            }

            const speciesId = this.readUInt16LE(showdownData, 0);

            if (!allMons[speciesId] || allMons[speciesId] === "-----") {
                continue;
            }

            const ability = (abils[allMons[speciesId]] || [])[abilitySlot] || "Unknown";

            const moves = monCount < partyCount
                ? [0, 1, 2, 3].map(i => 
                    allMoves[this.readUInt16LE(showdownData, 12 + (i * 2))]
                )
                : this.parseMoves(
                    Array.from(this.sliceData(showdownData, -19, -14))
                        .map(b => b.toString(2).padStart(8, '0'))
                        .join(''), 
                    allMoves
                );

            importData += `${allMons[speciesId].trim()}${isParty}\n`;
            importData += `Level: ${staticLevel}\n`;
            importData += `${nature} Nature\n`;
            importData += `Ability: ${ability}\n`;
            moves.forEach(m => importData += `- ${m}\n`);
            importData += "\n";

            monCount++;
            n += 32;
        }

        return {
            importData,
            debugInfo: {
                partyCount,
                saveIndexA,
                saveIndexB
            }
        };
    }
}

// Example usage
function processGameSave(file, movesList, monsList, abilitiesList) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const saveData = new Uint8Array(arrayBuffer);
        
        try {
            const result = Save.read(saveData, {
                game: "inc_em",  // or "rad_red"
                allMoves: movesList,
                allMons: monsList,
                abils: abilitiesList
            });
            
            console.log(result.importData);
        } catch (error) {
            console.error("Error reading save file:", error);
        }
    };
    reader.readAsArrayBuffer(file);
}