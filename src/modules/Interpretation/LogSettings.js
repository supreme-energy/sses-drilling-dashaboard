import React, { useRef, useEffect } from "react";
import { Box, IconButton } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import Close from "@material-ui/icons/Close";
import Refresh from "@material-ui/icons/Refresh";

export default function LogSettings({
  resetLogBiasAndScale,
  changeCurrentEditedLog,
  currentEditedLog,
  logsBiasAndScale
}) {
  const pendingState = logsBiasAndScale[currentEditedLog];

  return (
    <Box display="flex" justifyContent="center">
      <Box display="flex">
        <IconButton onClick={() => resetLogBiasAndScale(currentEditedLog)} disabled={!pendingState}>
          <Refresh />
        </IconButton>
        {/* <IconButton onClick={handleSave} disabled={!pendingState}>
          <Check />
        </IconButton> */}
        <IconButton onClick={() => changeCurrentEditedLog(null)}>
          <Close />
        </IconButton>
      </Box>
    </Box>
  );
}
