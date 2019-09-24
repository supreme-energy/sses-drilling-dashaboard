import { ALARM_ENABLED, PULL } from "../../../../constants/interpretation";

export function audioReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "TOGGLE_IMPORT_ALARM":
      return { ...state, [ALARM_ENABLED]: +!state[ALARM_ENABLED] };
  }
}

export function autoImportReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "TOGGLE_AUTO_IMPORT":
      return { ...state, [PULL]: !state[PULL] };
  }
}
