import * as wellSections from "./wellSections";

export const colorBySection = {
  [wellSections.SURFACE]: 0x5c87d5,
  [wellSections.INTERMEDIATE]: 0x639142,
  [wellSections.CURVE]: 0x959595,
  [wellSections.LATERAL]: 0xceaa39
};

export const hexColor = hString => Number(`0x${hString}`);
