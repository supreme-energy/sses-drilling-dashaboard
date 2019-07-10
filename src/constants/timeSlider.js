import { SURFACE, CURVE, INTERMEDIATE, LATERAL, DRILLOUT } from "./wellSections";
import { GREEN, GRAY } from "./colors";

// Map callbacks for graphs
export const mapRop = (d, index) => [index, Number(d.ROP_A)];
export const mapSliding = (d, index) => [index, Number(d.Sliding)];
export const mapConnections = (d, index) => [index, Number(d.Connections)];
export const mapAngle = (d, index) => [index, Number(d.Angle)];

// Slider constants
export const GRID_GUTTER = 5;
export const INITIAL_SLIDER_STATE = {
  step: 0,
  maxStep: 0,
  direction: 0,
  isDragging: 0,
  isPlaying: 0,
  isSpeeding: 0,
  stepSize: 1
};

// Initial State for Time Slider
export const INITIAL_DRILL_PHASE_STATE = {
  index: 0,
  phase: SURFACE,
  phaseStart: 0,
  phaseEnd: 0,
  inView: true,
  set: false
};
export const INITIAL_TIME_SLIDER_STATE = {
  firstDepth: 0,
  lastDepth: 0,
  isLastIndex: false
};

// Graphs
export const CONNECTION = "Connections";
export const ROP = "ROP";
export const SLIDE = "Slide";
export const PLANNED_ANGLE = "Angle";
export const CHOOSE = "Choose";

// Graph types
export const LINE_CHARTS = [ROP, PLANNED_ANGLE];

// Zoom constants
export const ZOOM_IN = "ZOOM IN";
export const ZOOM_OUT = "ZOOM OUT";

export const COLOR_BY_PHASE_VIEWER = {
  [SURFACE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [CONNECTION, ROP],
    quickFilter: 0x5989d4
  },
  [INTERMEDIATE]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [CONNECTION, ROP],
    quickFilter: 0x6e9852
  },
  [DRILLOUT]: {
    top: GREEN,
    curve: GRAY,
    lateral: GRAY,
    graphs: [CONNECTION, ROP],
    quickFilter: 0x5989d4
  },
  [CURVE]: {
    top: GRAY,
    curve: GREEN,
    lateral: GRAY,
    graphs: [SLIDE, CONNECTION, PLANNED_ANGLE, ROP],
    quickFilter: 0x909090
  },
  [LATERAL]: {
    top: GRAY,
    curve: GRAY,
    lateral: GREEN,
    graphs: [SLIDE, CONNECTION, ROP],
    quickFilter: 0xd2b04a
  },
  [CHOOSE]: {
    top: GRAY,
    curve: GRAY,
    lateral: GRAY,
    graphs: []
  }
};

export const COLOR_BY_GRAPH = {
  [ROP]: "08bb00",
  [SLIDE]: "a9fffb",
  [CONNECTION]: "d9aafe",
  [PLANNED_ANGLE]: "bfbfbf"
};

export const MAP_BY_GRAPH = {
  [ROP]: mapRop,
  [SLIDE]: mapSliding,
  [CONNECTION]: mapConnections,
  [PLANNED_ANGLE]: mapAngle
};
