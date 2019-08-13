export function stateReducer(state, newState) {
  return { ...state, ...newState };
}
