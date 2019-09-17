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
    case "CHANGE_SELECTION": {
      return {
        ...state,
        selectedFormation: action.formationId
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
    case "DELETE_FORMATION": {
      return {
        ...state,
        selectedFormation: state.selectedFormation === action.id ? action.nextId : state.selectedFormation
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
