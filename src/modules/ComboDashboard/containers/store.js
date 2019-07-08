import { createContainer } from "unstated-next";
import { useReducer, useCallback } from "react";

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
  const [state, dispatch] = useReducer(comboStoreReducer, initialState);

  const selectMd = useCallback(md => dispatch({ type: "SELECT_MD", md }), [dispatch]);
  return [state, dispatch, { selectMd }];
}

export const { Provider: ComboContainerProvider, useContainer: useComboContainer } = createContainer(useUseComboStore);
