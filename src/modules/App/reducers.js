import { INITIAL_SCALE_BIAS } from "../../constants/structuralGuidance";

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

export function selectedLogReducer(state, action) {
  switch (action.type) {
    case "ADD_LOG":
      return { ...state, ...action.payload };
    case "SAVE_SCALE":
      return {
        ...state,
        [action.settingsView]: { ...state[action.settingsView], prevScale: state[action.settingsView].currScale }
      };
    case "SAVE_COLOR":
      return { ...state, [action.view]: { ...state[action.view], color: action.color } };
    case "RESET_SCALE":
      return {
        ...state,
        [action.settingsView]: { ...state[action.settingsView], currScale: state[action.settingsView].prevScale }
      };
    case "UPDATE_SCALE":
      const scalelo =
        action.payload.scaleLow !== undefined ? action.payload.scaleLow : state[action.settingsView].scalelo;
      const scalehi = action.payloadscaleHigh || state[action.settingsView].scalehi;
      return {
        ...state,
        [action.settingsView]: {
          ...state[action.settingsView],
          currScale: { scale: action.scale, bias: action.bias, scalelo, scalehi }
        }
      };
    default:
      return state;
  }
}
