"use strict";
exports.__esModule = true;

var field_1 = require("./field");
var gen12_1 = require("./mechanics/gen12");
var gen3_1 = require("./mechanics/gen3");
var gen4_1 = require("./mechanics/gen4");
var gen56_1 = require("./mechanics/gen56");
var gen78_1 = require("./mechanics/gen56");
var genRR_1 = require("./mechanics/gen78");
var MECHANICS = [
    function () { },
    gen12_1.calculateRBYGSC,
    gen12_1.calculateRBYGSC,
    gen3_1.calculateADV,
    gen4_1.calculateDPP,
    gen56_1.calculateBWXY,
    gen56_1.calculateBWXY,
    gen78_1.calculateBWXY,
    genRR_1.calculateSMSS
];
function calculate(gen, attacker, defender, move, field) {
    // if (gen.num > 5) {
    //     gen.num = 5
    // }

    if (damageGen == 12) {
        return MECHANICS[3](gen, attacker.clone(), defender.clone(), move.clone(), field ? field.clone() : new field_1.Field());
    }
    return MECHANICS[gen.num](gen, attacker.clone(), defender.clone(), move.clone(), field ? field.clone() : new field_1.Field());
}
exports.calculate = calculate;
//# sourceMappingURL=calc.js.map

