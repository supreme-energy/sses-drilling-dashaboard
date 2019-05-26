import { ON_CURVE, ON_LATERAL, ON_DRILLOUT, ON_INTERMEDIATE, ON_SURFACE } from "./wellPathStatus";
import { GREEN, GRAY } from "./colors";

export const STEP_SIZE = 1;

export const CONNECTION = "CONNECTION";
export const ROP = "ROP";
export const SLIDE = "SLIDE";
export const LENGTH = "LENGTH";
export const PLANNED_ANGLE = "PLANNED ANGLE";

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
    graphs: [SLIDE, ROP, CONNECTION, LENGTH]
  }
};

export const COLOR_BY_GRAPH = {
  [ROP]: "08bb00",
  [SLIDE]: "a9fffb",
  [CONNECTION]: "d9aafe",
  [LENGTH]: "967f2f",
  [PLANNED_ANGLE]: "bfbfbf"
};
