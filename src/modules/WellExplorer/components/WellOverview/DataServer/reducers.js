import { ALARM_ENABLED } from "../../../../../constants/interpretation";

export function audioReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "TOGGLE_IMPORT_ALARM":
      return { ...state, [ALARM_ENABLED]: +!state[ALARM_ENABLED] };
    default:
      throw new Error("action not supported");
  }
}
