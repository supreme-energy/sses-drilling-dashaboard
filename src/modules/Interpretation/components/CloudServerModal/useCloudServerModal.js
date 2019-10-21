import { useState, useCallback, useReducer } from "react";
import {
  IMPORT,
  REVIEW,
  AUTO,
  INITIALIZE,
  SETTINGS,
  MANUAL,
  initialViewState
} from "../../../../constants/interpretation";
import { useSelectLastSurvey } from "../../actions";

export function viewReducer(state, action) {
  switch (action.type) {
    case IMPORT:
      return { ...state, [action.payload]: action.type };
    case REVIEW:
      return { ...state, [action.payload]: action.type };
    case SETTINGS:
      return { ...state, [AUTO]: action.type };
    case INITIALIZE:
      const hasSurvey = action.payload.newSurvey;
      return { ...state, [action.payload.type]: hasSurvey ? IMPORT : SETTINGS };
    default:
      return state;
  }
}

export default function useCloudServerModal() {
  const [view, setView] = useReducer(viewReducer, initialViewState);
  const [isAutoImportVisible, setAutoVisibility] = useState(false);
  const [isManualImportVisible, setManualVisibility] = useState(false);
  const [isAutoImportEnabled, setAutoImport] = useState(false);
  const selectLastSurvey = useSelectLastSurvey();

  // Handlers
  const handleOpenAutoImport = useCallback(() => {
    setAutoVisibility(true);
  }, []);
  const handleOpenManualImport = useCallback(() => {
    selectLastSurvey(true);
    setManualVisibility(true);
    setView({ type: IMPORT, payload: MANUAL });
  }, [selectLastSurvey]);
  const handleCloseManualImport = useCallback(() => setManualVisibility(false), []);
  const handleCloseAutoImport = useCallback(() => setAutoVisibility(false), []);

  return {
    view,
    setView,
    isAutoImportVisible,
    isManualImportVisible,
    isAutoImportEnabled,
    setAutoImport,
    handleOpenAutoImport,
    handleOpenManualImport,
    handleCloseManualImport,
    handleCloseAutoImport,
    selectLastSurvey
  };
}
