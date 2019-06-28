import { createContainer } from "unstated-next";
import { useReducer } from "react";

const initialState = {
  selectedMd: null
};

function comboStoreReducer(state, action) {
  switch (action.type) {
    case "SELECT_MD": {
      return {
        ...state,
        selectedMd: action.md
      };
    }
  }
}

function useUseComboStore() {
  return useReducer(comboStoreReducer, initialState);
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
