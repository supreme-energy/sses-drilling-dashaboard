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
  const logId = action.payload.logId;
  const view = action.payload.settingsView || action.payload.view;
  const name = action.payload.name;
  const color = action.payload.color;

  switch (action.type) {
    case "ADD_LOG":
      return { ...state, [logId]: { ...state[logId], [name]: action.payload[name] } };
    case "SAVE_SCALE":
      return {
        ...state,
        [logId]: {
          ...state[logId],
          [view]: {
            ...state[logId][view],
            prevScale: state[logId][view].currScale
          }
        }
      };
    case "SAVE_COLOR":
      return {
        ...state,
        [logId]: {
          ...state[logId],
          [view]: { ...state[logId][view], color }
        }
      };
    case "RESET_SCALE":
      return {
        ...state,
        [logId]: {
          ...state[logId],
          [view]: {
            ...state[logId][view],
            currScale: state[logId][view].prevScale
          }
        }
      };
    case "UPDATE_SCALE":
      const scalelo =
        action.payload.scaleLow !== undefined ? action.payload.scaleLow : state[logId][view].currScale.scalelo;
      const scalehi = action.payload.scaleHigh || state[logId][view].currScale.scalehi;
      return {
        ...state,
        [logId]: {
          ...state[logId],
          [view]: {
            ...state[logId][view],
            currScale: { scale: action.payload.scale, bias: action.payload.bias, scalelo, scalehi }
          }
        }
      };
    default:
      return state;
  }
}
