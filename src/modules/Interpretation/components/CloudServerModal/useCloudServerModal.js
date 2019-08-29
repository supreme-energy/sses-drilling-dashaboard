import { useState, useCallback } from "react";

export default function useCloudServerModal() {
  const [view, setView] = useState("");
  const [isVisible, setVisibility] = useState(false);
  const [isAutoImportEnabled, setAutoImport] = useState(false);

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
    handleClose
  };
}
