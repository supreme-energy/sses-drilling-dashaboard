import { COLOR_BY_PHASE_VIEWER } from "../../../constants/timeSlider";

export function graphReducer(state, action) {
  switch (action.type) {
    case "CHANGE":
      return COLOR_BY_PHASE_VIEWER[action.payload].graphs;
    case "ADD":
      return [...state, action.payload];
    case "REMOVE":
      return state.filter(item => item !== action.payload);
    default:
      return state;
  }
}
