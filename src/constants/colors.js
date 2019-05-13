import * as wellSections from "./wellSections";

export const RED = "#ff0000";
export const BLUE = "#0000ff";
export const GRAY = "#757575";
export const GREEN = "#09C501";

export const colorBySection = {
  [wellSections.SURFACE]: 0x5c87d5,
  [wellSections.INTERMEDIATE]: 0x639142,
  [wellSections.CURVE]: 0x959595,
  [wellSections.LATERAL]: 0xceaa39
};
