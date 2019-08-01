export function graphReducer(state, action) {
  switch (action.type) {
    case "ADD":
      if (state.length >= 6) {
        return state;
      }
      return [...state, action.payload];
    case "REMOVE":
      return state.filter(item => item !== action.payload);
    default:
      return state;
  }
}
