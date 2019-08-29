import { useState, useReducer, useCallback } from "react";

import { autoImportReducer } from "./reducers";
import { PULL, PULL_INTERVAL, INITIAL_AUTO_IMPORT_STATE } from "../../../../constants/interpretation";

export default function useCloudServerModal() {
  const [view, setView] = useState("");
  const [isVisible, setVisibility] = useState(false);
  const [autoImportSettings, setAutoImport] = useReducer(autoImportReducer, INITIAL_AUTO_IMPORT_STATE);
  const [countdown, setCountdown] = useState(0);
  const { [PULL]: isAutoImportEnabled, [PULL_INTERVAL]: interval } = autoImportSettings;

  // Handlers
  const handleOpen = useCallback(() => setVisibility(true), []);
  const handleClose = useCallback(() => setVisibility(false), []);

  return {
    view,
    setView,
    isVisible,
    isAutoImportEnabled,
    setAutoImport,
    handleOpen,
    handleClose,
    interval,
    autoImportSettings,
    countdown,
    setCountdown
  };
}
