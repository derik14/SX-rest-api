import { BigNumber } from "ethers";
import BigNumber2 from "bignumber.js";
export const ODDS_LADDER_STEP_SIZE = 25; // (0.1% = 1, 0.5% = 5, etc)

export function checkOddsLadderValid(
  odds: BigNumber,
  stepSizeOverride?: number
) {
  // Logic:
  // 100% = 10^20
  // 10% = 10^19
  // 1% = 10^18
  // 0.1% = 10^17
  return odds
    .mod(BigNumber.from(10).pow(16).mul(ODDS_LADDER_STEP_SIZE))
    .eq(0);
}

/**
 * Rounds odds to the nearest step.
 * @param odds Odds to round.
 */
export function roundDownOddsToNearestStep(
  odds: BigNumber,
  stepSizeOverride?: number
) {
  const step = BigNumber.from(10).pow(16).mul(ODDS_LADDER_STEP_SIZE);
  const bnStep = new BigNumber2(step.toString());
  const bnOdds = new BigNumber2(odds.toString());
  const firstPassDivision = bnOdds.dividedBy(bnStep).toFixed(0, 3);
  return BigNumber.from(firstPassDivision).mul(step);
}