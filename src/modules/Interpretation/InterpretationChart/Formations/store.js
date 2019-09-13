import { createContainer } from "unstated-next";
import { useReducer } from "react";

const initialState = {
  editMode: false,
  selectedFormation: null
};

function formationsReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_EDIT_MODE": {
      return {
        ...state,
        editMode: !state.editMode
      };
    }
    case "TOGGLE_SELECTION": {
      const currentSelection = state.selectedFormation;
      return {
        ...state,
        selectedFormation: currentSelection === action.formationId ? null : action.formationId
      };
    }
    default:
      throw new Error("action not found");
  }
}

const useFormationsReducer = () => {
  return useReducer(formationsReducer, initialState);
};

export const { Provider: FormationsStoreProvider, useContainer: useFormationsStore } = createContainer(
  useFormationsReducer
);
