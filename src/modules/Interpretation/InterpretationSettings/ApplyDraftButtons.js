import React from "react";
import { Box, Button, Typography } from "@material-ui/core";
import css from "./styles.scss";
import { useGetChangedPendingStateFields } from "../selectors";
import { useSaveWellLogActions } from "../actions";

export default function ApplyDraftButtons(props) {
  const { dip, fault } = useGetChangedPendingStateFields();

  const { saveAllPendingLogs } = useSaveWellLogActions();
  return (
    <Box {...props} display="flex" flexDirection="row" alignItems="center">
      <Typography className={css.applyLabel} variant="caption">
        Apply to Model
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        disabled={!fault}
        onClick={() => saveAllPendingLogs({ fault: true })}
        className={css.applyButton}
      >
        Fault
      </Button>
      <Button
        variant="outlined"
        color="primary"
        disabled={!dip}
        className={css.applyButton}
        onClick={() => saveAllPendingLogs({ dip: true })}
      >
        DIP
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => saveAllPendingLogs({ dip: true, fault })}
        disabled={!dip || !fault}
        className={css.applyButton}
      >
        Both
      </Button>
    </Box>
  );
}
