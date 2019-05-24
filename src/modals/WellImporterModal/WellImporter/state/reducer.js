import merge from "lodash/merge";
import omit from "lodash/omit";

import {
  ADD_HIGHLIGHTED_CELL_IDS,
  ADD_HIGHLIGHTED_TEXT_CELL_IDS,
  ADD_INPUT_TO_CELL_IDS,
  CLEAR_HIGHLIGHTED_CELL_IDS,
  REMOVE_HIGHLIGHTED_TEXT_CELL_IDS,
  REMOVE_INPUT_TO_CELL_IDS,
  SET_ACTIVE_INPUT,
  UPDATE_ATTRIBUTES_MODEL
} from "./actions";

const reducer = (state, action) => {
  switch (action.type) {
    case SET_ACTIVE_INPUT:
      return {
        ...state,
        activeInput: action.activeInput
      };
    case ADD_INPUT_TO_CELL_IDS:
      return {
        ...state,
        inputToCellIds: {
          ...state.inputToCellIds,
          [action.inputId]: action.cellIds
        }
      };

    case REMOVE_INPUT_TO_CELL_IDS:
      return {
        ...state,
        inputToCellIds: omit(state.inputToCellIds, [action.inputId])
      };

    case UPDATE_ATTRIBUTES_MODEL:
      const { activeInput, cellAlreadySelected, data, cellIds, extraInformation } = action;
      return {
        ...state,
        appAttributesModel: {
          ...state.appAttributesModel,
          [activeInput.sectionKey]: {
            ...state.appAttributesModel[activeInput.sectionKey],
            [activeInput.fieldKey]: {
              ...state.appAttributesModel[activeInput.sectionKey][activeInput.fieldKey],
              value: !cellAlreadySelected ? data : "",
              cellId: !cellAlreadySelected ? cellIds : "",
              extraInformation: !cellAlreadySelected ? extraInformation : {}
            }
          }
        }
      };

    case CLEAR_HIGHLIGHTED_CELL_IDS:
      return {
        ...state,
        highlightedCellIdsMap: {}
      };
    case ADD_HIGHLIGHTED_CELL_IDS:
      return {
        ...state,
        highlightedCellIdsMap: action.cellIds.reduce((map, cellId) => {
          map[cellId] = true;
          return map;
        }, {})
      };
    case REMOVE_HIGHLIGHTED_TEXT_CELL_IDS:
      return {
        ...state,
        highlightedTextCellIdsMap: omit(state.highlightedTextCellIdsMap, action.cellIds)
      };
    case ADD_HIGHLIGHTED_TEXT_CELL_IDS:
      return {
        ...state,
        highlightedTextCellIdsMap: merge(
          state.highlightedTextCellIdsMap,
          action.cellIds.reduce((map, cellId) => {
            map[cellId] = true;
            return map;
          }, {})
        )
      };
  }

  return state;
};

export default reducer;
