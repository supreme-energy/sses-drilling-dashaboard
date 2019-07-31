export function crossSectionMenuReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];
    case "REMOVE":
      return state.filter(item => item !== action.payload);
    default:
      return state;
  }
}
