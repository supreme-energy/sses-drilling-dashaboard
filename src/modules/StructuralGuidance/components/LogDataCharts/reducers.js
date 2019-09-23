export function selectedLogReducer(state, action) {
  switch (action.type) {
    case "ADD_LOG":
      const name = action.payload.name;
      return { logs: { ...state.logs, [name]: action.payload[name] } };
    case "TOGGLE_LOG":
      const checked = (state.logs[action.payload] && state.logs[action.payload].checked) || true;
      return { logs: { ...state.logs, [action.payload]: { ...state.logs[action.payload], checked } } };
    case "REMOVE_LOG":
      return { logs: { ...state.logs, [action.payload]: { ...state.logs[action.payload], checked: false } } };
    default:
      return state;
  }
}
