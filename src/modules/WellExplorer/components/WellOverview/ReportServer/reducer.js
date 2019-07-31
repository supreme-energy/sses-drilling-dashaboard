export function stateReducer(state, newState) {
  return { ...state, ...newState };
}

export function mailingListReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        ...action.payload
      };
    case "DELETE":
      return {};
    default:
      return state;
  }
}
