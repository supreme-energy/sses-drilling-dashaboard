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

function updateFormationVisibility(state, { wellId, topId, interpretationLine, interpretationFill, vsLine, vsFill }) {
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
      const newState = {
        ...state,
        addTopLoading: false,
        selectedFormation: state.selectedFormation === action.pendingId ? action.id : state.selectedFormation
      };
      return updateFormationVisibility(newState, {
        wellId: action.wellId,
        topId: action.id,
        vsFill: false,
        interpretationFill: false
      });
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
      return updateFormationVisibility(state, action);
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
