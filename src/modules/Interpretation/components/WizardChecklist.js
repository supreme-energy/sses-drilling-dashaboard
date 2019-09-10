import React from "react";
import { Box } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

export default function WizardChecklist() {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" pl={3}>
        <Typography variant="subtitle2">Set Up Structural Guidance</Typography>
      </Box>
      <Box display="flex" flexDirection="row">
        <Box flexDirection="column">
          <Typography variant="body2">
            <ol>
              <li>Import the Well Plan</li>
              <li>Import a Control Log with Gamma</li>
              <li>Set Proposed Direction &amp; Projection Dip</li>
              <li>Specify Tie-In data (including TCL)</li>
              <li>Specify the Formation Tops</li>
              <li>Import first Hang-off Survey data</li>
            </ol>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
