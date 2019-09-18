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
        [action.payload.settingsView]: {
          ...state[action.payload.settingsView],
          prevScale: state[action.payload.settingsView].currScale
        }
      };
    case "SAVE_COLOR":
      return { ...state, [action.payload.view]: { ...state[action.payload.view], color: action.payload.color } };
    case "RESET_SCALE":
      return {
        ...state,
        [action.payload.settingsView]: {
          ...state[action.payload.settingsView],
          currScale: state[action.payload.settingsView].prevScale
        }
      };
    case "UPDATE_SCALE":
      const scalelo =
        action.payload.scaleLow !== undefined
          ? action.payload.scaleLow
          : state[action.payload.settingsView].currScale.scalelo;
      const scalehi = action.payload.scaleHigh || state[action.payload.settingsView].currScale.scalehi;
      return {
        ...state,
        [action.payload.settingsView]: {
          ...state[action.payload.settingsView],
          currScale: { scale: action.payload.scale, bias: action.payload.bias, scalelo, scalehi }
        }
      };
    default:
      return state;
  }
}
