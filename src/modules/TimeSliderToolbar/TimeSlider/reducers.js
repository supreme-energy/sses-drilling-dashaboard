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

export function sliderReducer(state, action) {
  const { step, maxStep, direction, stepSize, isPlaying } = state;

  switch (action.type) {
    case "REWIND":
      if (step && step - stepSize >= 0) {
        return { ...state, step: step - stepSize, direction: -1 };
      }
      return state;
    case "FAST_FORWARD":
      if (step + stepSize >= 0) {
        return { ...state, step: step + stepSize, direction: 1 };
      }
      return state;
    case "UPDATE":
      return { ...state, ...action.payload };
    case "UPDATE_FROM_PREVIOUS":
      return { ...state, maxStep: action.payload, step: (action.payload * step) / maxStep };
    case "IS_SPEEDING":
      const newStep = step + stepSize * (maxStep / 50) * direction;
      // If slider step is at min or max, don't move anymore
      if (newStep <= 0 && direction < 0) {
        return { ...state, step: 0, direction: 0 };
      } else if (direction && newStep >= maxStep) {
        return { ...state, step: maxStep, direction: 0 };
      }

      // Otherwise return next slider step
      return { ...state, step: newStep, isSpeeding: true };
    case "IS_PLAYING":
      const nextStep = step + stepSize * Math.ceil(maxStep / 100);

      // Stop playing if slider reaches max step
      if (nextStep >= maxStep) {
        return { ...state, step: maxStep, direction: 0, isPlaying: false };
      }

      // Otherwise return next slider step
      return { ...state, step: nextStep, direction, isPlaying: true };
    case "TOGGLE_IS_PLAYING":
      return { ...state, isPlaying: !isPlaying };
    case "SET_TO_MAX":
      return { ...state, step: maxStep, direction: 1 };
    case "RESET":
      return { ...state, step: 0, direction: 1 };
    default:
      return state;
  }
}
