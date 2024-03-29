import merge from "lodash/merge";
import omit from "lodash/omit";
import { defaultAppAttributesModel } from "../models/models";

import {
  ADD_HIGHLIGHTED_CELL_IDS,
  ADD_HIGHLIGHTED_TEXT_CELL_IDS,
  ADD_INPUT_TO_CELL_IDS,
  CLEAR_HIGHLIGHTED_CELL_IDS,
  REMOVE_HIGHLIGHTED_TEXT_CELL_IDS,
  REMOVE_INPUT_TO_CELL_IDS,
  SET_ACTIVE_INPUT,
  UPDATE_ATTRIBUTES_MODEL,
  SELECT_CSV_CELL,
  CREATE_NEW_WELL
} from "./actions";

export const initialState = {
  activeInput: null,
  inputToCellIds: {},
  appAttributesModel: defaultAppAttributesModel,
  highlightedCellIdsMap: {},
  textHighlightedCellIdsMap: {},
  csvSelection: {},
  pendingCreateWell: false,
  pendingCreateWellName: null
};

const updateAppModel = (state, { sectionKey, fieldKey, cellAlreadySelected, data, cellIds, extraInformation }) => {
  return {
    ...state,
    appAttributesModel: {
      ...state.appAttributesModel,
      [sectionKey]: {
        ...state.appAttributesModel[sectionKey],
        [fieldKey]: {
          ...state.appAttributesModel[sectionKey][fieldKey],
          value: !cellAlreadySelected ? data : "",
          cellId: !cellAlreadySelected ? cellIds : "",
          extraInformation: !cellAlreadySelected ? extraInformation : {}
        }
      }
    }
  };
};

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

    case CREATE_NEW_WELL:
      return {
        ...initialState,
        pendingCreateWellName: action.wellName,
        pendingCreateWell: true
      };

    case UPDATE_ATTRIBUTES_MODEL:
      const { activeInput, cellAlreadySelected, data, cellIds, extraInformation } = action;

      return updateAppModel(state, { ...activeInput, cellAlreadySelected, data, cellIds, extraInformation });
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

    case SELECT_CSV_CELL:
      if (
        (action.field.type === "cell" && action.row === null) ||
        (action.field.type === "column" && action.row !== null)
      ) {
        return state;
      }
      return {
        ...state,
        csvSelection: {
          ...state.csvSelection,
          [action.field.fieldKey]: {
            selectedColumn: action.column,
            selectedRow: action.row,
            field: action.field
          }
        }
      };
  }

  return state;
};

export default reducer;
