import { createContainer } from "unstated-next";
import { useReducer } from "react";
import pickBy from "lodash/pickBy";

const initialState = {
  editMode: false,
  selectedFormation: null,
  pendingAddTop: false,
  addTopLoading: false,
  formationVisibilityByWellAndTop: {}
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
    case "CREATE_TOP_CANCELED": {
      return {
        ...state,
        pendingAddTop: false
      };
    }
    case "PENDING_TOP_CREATED": {
      return {
        ...state,
        pendingAddTop: false,
        addTopLoading: true,
        selectedFormation: action.pendingId
      };
    }
    case "CREATE_TOP_SUCCESS": {
      return {
        ...state,
        addTopLoading: false,
        selectedFormation: state.selectedFormation === action.pendingId ? action.id : state.selectedFormation
      };
    }
    case "CREATE_TOP_ERROR": {
      return {
        ...state,
        addTopLoading: false,
        selectedFormation: action.nextId
      };
    }
    case "DELETE_FORMATION": {
      return {
        ...state,
        selectedFormation: state.selectedFormation === action.id ? action.nextId : state.selectedFormation
      };
    }
    case "CHANGE_FORMATION_VISIBILITY": {
      const { wellId, topId, interpretationLine, interpretationFill, vsLine, vsFill } = action;
      const wellState = state.formationVisibilityByWellAndTop[wellId] || {};
      const topState = wellState[topId] || {};

      const changes = pickBy({ interpretationLine, interpretationFill, vsLine, vsFill }, d => d !== undefined);

      return {
        ...state,
        formationVisibilityByWellAndTop: {
          ...state.formationVisibilityByWellAndTop,
          [wellId]: {
            ...wellState,
            [topId]: {
              ...topState,
              ...changes
            }
          }
        }
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
