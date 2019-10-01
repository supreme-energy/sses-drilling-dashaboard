export const SET_ACTIVE_INPUT = "SET_ACTIVE_INPUT";

export const ADD_INPUT_TO_CELL_IDS = "ADD_INPUT_TO_CELL_IDS";
export const REMOVE_INPUT_TO_CELL_IDS = "REMOVE_INPUT_TO_CELL_IDS";

export const UPDATE_ATTRIBUTES_MODEL = "UPDATE_ATTRIBUTES_MODEL";

export const CLEAR_HIGHLIGHTED_CELL_IDS = "CLEAR_HIGHLIGHTED_CELL_IDS";
export const ADD_HIGHLIGHTED_CELL_IDS = "ADD_HIGHLIGHTED_CELL_IDS";

export const REMOVE_HIGHLIGHTED_TEXT_CELL_IDS = "REMOVE_HIGHLIGHTED_TEXT_CELL_IDS";
export const ADD_HIGHLIGHTED_TEXT_CELL_IDS = "ADD_HIGHLIGHTED_TEXT_CELL_IDS";

export const SELECT_CSV_CELL = "SELECT_CSV_CELL";

export const CREATE_NEW_WELL = "CREATE_NEW_WELL";

export const setActiveInput = activeInput => ({ type: SET_ACTIVE_INPUT, activeInput });

export const addInputToCellIds = (inputId, cellIds) => ({ type: ADD_INPUT_TO_CELL_IDS, inputId, cellIds });
export const removeInputToCellIds = inputId => ({ type: REMOVE_INPUT_TO_CELL_IDS, inputId });

export const updateAttributesModel = (activeInput, cellAlreadySelected, data, cellIds, extraInformation) => ({
  type: UPDATE_ATTRIBUTES_MODEL,
  activeInput,
  cellAlreadySelected,
  data,
  cellIds,
  extraInformation
});

export const clearHighlightedCellIds = () => ({ type: CLEAR_HIGHLIGHTED_CELL_IDS });
export const addHighlightedCellIds = cellIds => ({ type: ADD_HIGHLIGHTED_CELL_IDS, cellIds });

export const removeHighlightedTextCellIds = cellIds => ({ type: REMOVE_HIGHLIGHTED_TEXT_CELL_IDS, cellIds });
export const addHighlightedTextCellIds = cellIds => ({ type: ADD_HIGHLIGHTED_TEXT_CELL_IDS, cellIds });
