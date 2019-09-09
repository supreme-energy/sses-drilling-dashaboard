export function fieldReducer(state, action) {
  switch (action.type) {
    case "SET": {
      return { ...state, ...action.payload };
    }
  }
}

export function pageReducer(state, action) {
  switch (action.type) {
    case "INCREMENT": {
      return state < action.payload - 1 ? state + 1 : state;
    }
    case "DECREMENT": {
      return state > 0 ? state - 1 : state;
    }
    default:
      throw new Error("action not supported");
  }
}
