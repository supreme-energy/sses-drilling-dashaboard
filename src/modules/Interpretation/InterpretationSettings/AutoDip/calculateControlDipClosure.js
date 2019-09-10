import { mean } from "d3-array";

export default function calculateAverageDip(startIndex, nrItemsBack, controlLogData) {
  if (!Number.isInteger(startIndex) || !Number.isInteger(nrItemsBack)) {
    return 0;
  }

  return mean(controlLogData.slice(startIndex + 1, startIndex + nrItemsBack + 1), d => d.dip);
}
