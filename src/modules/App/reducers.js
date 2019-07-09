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

export function selectedSectionReducer(state, action) {
  switch (action.type) {
    case "SELECT_MD": {
      return {
        ...state,
        selectedMd: action.md
      };
    }
  }
}
