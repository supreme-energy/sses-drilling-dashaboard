import {
  DIP_BOT_MOVE,
  DIP_END,
  DIP_TOT_MOVE,
  FAULT_BOT_MOVE,
  FAULT_END,
  FAULT_TOT_MOVE,
  INIT,
  PA_END,
  PA_MOVE,
  TAG_END,
  TAG_MOVE
} from "../../constants/interactivePAStatus";
import { calculateDip, getChangeInY } from "../ComboDashboard/components/CrossSection/formulas";
import { DIP_FAULT_POS_VS, TOT_POS_VS, TVD_VS } from "../../constants/calcMethods";

export function drillPhaseReducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "UPDATE_VIEW":
      return { ...state, inView: action.payload };
    default:
      return state;
  }
}

export function PADeltaInit(options = {}) {
  const section = options.section || {};
  return {
    prevOp: options.prevSection,
    nextOp: options.nextSection,
    op: section,
    id: section.id,
    bot: 0,
    prevFault: 0,
    tcl: 0,
    tot: 0,
    tvd: 0,
    vs: 0,
    dip: 0
  };
}

export function PADeltaReducer(state, action) {
  const { prevOp, op, nextOp } = state;
  let depthDelta = 0;
  switch (action.type) {
    case DIP_TOT_MOVE:
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      depthDelta = action.tot - op.tot - state.prevFault + op.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        tvd: depthDelta,
        dip: op.dip - calculateDip(action.tot - state.prevFault, prevOp.tot, action.vs, prevOp.vs),
        method: TOT_POS_VS,
        status: action.type
      };
    case DIP_BOT_MOVE:
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      depthDelta = action.bot - op.bot - state.prevFault + op.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        tvd: depthDelta,
        dip: op.dip - calculateDip(action.bot - state.prevFault, prevOp.bot, action.vs, prevOp.vs),
        method: TOT_POS_VS,
        status: action.type
      };
    case FAULT_TOT_MOVE:
      return {
        ...state,
        prevFault: action.tot - prevOp.tot,
        prevMethod: DIP_FAULT_POS_VS,
        status: action.type
      };
    case FAULT_BOT_MOVE:
      return {
        ...state,
        prevFault: action.bot - prevOp.bot,
        prevMethod: DIP_FAULT_POS_VS,
        status: action.type
      };
    case PA_MOVE:
      return {
        ...state,
        tvd: action.tvd - op.tvd - state.prevFault,
        method: TVD_VS,
        status: action.type
      };
    case TAG_MOVE:
      // We don't currently want the surveys or bit proj to be adjustable
      if (op.isSurvey || op.isBitProj) return state;
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      const changeInY = getChangeInY(state.dip - op.dip, action.vs, prevOp.vs);
      return {
        ...state,
        vs: action.vs - op.vs,
        tot: prevOp.tot - op.tot + changeInY + op.fault,
        tcl: prevOp.tcl - op.tcl + changeInY + op.fault,
        bot: prevOp.bot - op.bot + changeInY + op.fault,
        method: DIP_FAULT_POS_VS,
        status: action.type
      };
    case INIT:
      return PADeltaInit(action);
    case DIP_END:
      return { ...state, status: DIP_END };
    case FAULT_END:
      return { ...state, status: FAULT_END };
    case PA_END:
      return { ...state, status: PA_END };
    case TAG_END:
      return { ...state, status: TAG_END };
    default:
      throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
  }
}
