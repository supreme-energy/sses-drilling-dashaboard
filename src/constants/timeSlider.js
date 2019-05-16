import { ON_CURVE, ON_LATERAL, ON_DRILLOUT, ON_INTERMEDIATE, ON_SURFACE } from "./wellPathStatus";
import { GREEN, GRAY } from "./colors";

const CONNECTION = "CONNECTION";
const ROP = "ROP";
const SLIDE = "SLIDE";
const LENGTH = "LENGTH";
const PLANNED_ANGLE = "PLANNED ANGLE";

export const LINE_GRAPHS = [ROP, LENGTH];
export const BAR_GRAPHS = [SLIDE, CONNECTION];

export const COLOR_BY_PHASE_VIEWER = {
  [ON_SURFACE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [ROP, CONNECTION, LENGTH]
  },
  [ON_INTERMEDIATE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [ROP, CONNECTION, LENGTH]
  },
  [ON_DRILLOUT]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [ROP, CONNECTION, LENGTH]
  },
  [ON_CURVE]: {
    top: GRAY,
    curve: GREEN,
    lateral: GRAY,
    graphs: [SLIDE, ROP, CONNECTION, LENGTH, PLANNED_ANGLE]
  },
  [ON_LATERAL]: {
    top: GRAY,
    curve: GRAY,
    lateral: GREEN,
    graphs: [SLIDE, ROP, CONNECTION, LENGTH, PLANNED_ANGLE]
  }
};

export const COLOR_BY_GRAPH = {
  [ROP]: 0x08bb00,
  [SLIDE]: 0xa9fffb,
  [CONNECTION]: 0xd9aafe,
  [LENGTH]: 0x967f2f,
  [PLANNED_ANGLE]: 0xbfbfbf
};
