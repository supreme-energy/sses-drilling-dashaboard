import { createContainer } from "unstated-next";
import { useReducer } from "react";

const initialState = {
  editMode: false,
  selectedFormation: null,
  pendingAddTop: false
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
    case "CREATE_TOP": {
      return {
        ...state,
        pendingAddTop: true
      };
    }
    case "PENDING_TOP_CREATED": {
      return {
        ...state,
        pendingAddTop: false,
        selectedFormation: action.pendingId
      };
    }
    case "TOP_CREATED": {
      return {
        ...state,
        selectedFormation: state.selectedFormation === action.pendingId ? action.id : state.selectedFormation
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
