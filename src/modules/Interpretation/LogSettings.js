import React from "react";
import { Box, IconButton } from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import Refresh from "@material-ui/icons/Refresh";
import { useLogBiasAndScale } from "./selectors";

export default function LogSettings({ resetLogBiasAndScale, changeCurrentEditedLog, currentEditedLog }) {
  const { bias, scale } = useLogBiasAndScale(currentEditedLog);
  const biasAndScaleChanged = bias !== 1 || scale !== 1;
  return (
    <Box display="flex" justifyContent="center">
      <Box display="flex">
        <IconButton onClick={() => resetLogBiasAndScale(currentEditedLog)} disabled={!biasAndScaleChanged}>
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
