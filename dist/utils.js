"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODDS_LADDER_STEP_SIZE = void 0;
exports.checkOddsLadderValid = checkOddsLadderValid;
exports.roundDownOddsToNearestStep = roundDownOddsToNearestStep;
const ethers_1 = require("ethers");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.ODDS_LADDER_STEP_SIZE = 25; // (0.1% = 1, 0.5% = 5, etc)
function checkOddsLadderValid(odds, stepSizeOverride) {
    // Logic:
    // 100% = 10^20
    // 10% = 10^19
    // 1% = 10^18
    // 0.1% = 10^17
    return odds
        .mod(ethers_1.BigNumber.from(10).pow(16).mul(exports.ODDS_LADDER_STEP_SIZE))
        .eq(0);
}
/**
 * Rounds odds to the nearest step.
 * @param odds Odds to round.
 */
function roundDownOddsToNearestStep(odds, stepSizeOverride) {
    const step = ethers_1.BigNumber.from(10).pow(16).mul(exports.ODDS_LADDER_STEP_SIZE);
    const bnStep = new bignumber_js_1.default(step.toString());
    const bnOdds = new bignumber_js_1.default(odds.toString());
    const firstPassDivision = bnOdds.dividedBy(bnStep).toFixed(0, 3);
    return ethers_1.BigNumber.from(firstPassDivision).mul(step);
}
