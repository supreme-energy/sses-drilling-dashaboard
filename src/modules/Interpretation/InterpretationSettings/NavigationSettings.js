import React, { useCallback, useMemo } from "react";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { VerticalAlignTop as TopEnd, VerticalAlignBottom as BottomEnd, ArrowRightAlt } from "@material-ui/icons";
import css from "./styles.scss";

import { Box, IconButton, Typography } from "@material-ui/core";
import { useSelectedWellLog } from "../selectors";
import { useWellIdContainer } from "../../App/Containers";
import { useWellLogList } from "../../ComboDashboard/containers/wellLogs";
import { useSelectionActions } from "../actions";

export default function NavigationSettings(props) {
  const [{ selectedMd }] = useComboContainer();
  const { toggleMdSelection } = useSelectionActions();
  const { selectedWellLog } = useSelectedWellLog();
  const { wellId } = useWellIdContainer();
  const [logs] = useWellLogList(wellId);
  const selectedWellIndex = useMemo(() => selectedWellLog && logs.findIndex(l => l.id === selectedWellLog.id), [
    selectedWellLog,
    logs
  ]);

  const selectNext = useCallback(() => {
    const next = logs[selectedWellIndex + 1];

    if (next) {
      toggleMdSelection(next.endmd);
    }
  }, [logs, selectedWellIndex, toggleMdSelection]);

  const selectPrev = useCallback(() => {
    const prev = logs[selectedWellIndex - 1];

    if (prev) {
      toggleMdSelection(prev.endmd);
    }
  }, [logs, selectedWellIndex, toggleMdSelection]);

  const selectFirst = useCallback(() => {
    const first = logs[0];
    if (first && first.endmd !== selectedMd) {
      toggleMdSelection(first.endmd);
    }
  }, [logs, toggleMdSelection, selectedMd]);

  const selectLast = useCallback(() => {
    const last = logs[logs.length - 1];
    if (last && last.endmd !== selectedMd) {
      toggleMdSelection(last.endmd);
    }
  }, [logs, toggleMdSelection, selectedMd]);

  return (
    <Box display="flex" flexDirection="column" {...props}>
      <Typography className={css.title} variant="subtitle1">
        Survey Navigation
      </Typography>
      <Box display="flex" flexDirection="row">
        <IconButton disableRipple onClick={selectFirst}>
          <TopEnd />
        </IconButton>
        <IconButton disableRipple onClick={selectPrev}>
          <ArrowRightAlt className={css.arrowTop} />
        </IconButton>
        <IconButton disableRipple onClick={selectLast}>
          <BottomEnd />
        </IconButton>
        <IconButton disableRipple onClick={selectNext}>
          <ArrowRightAlt className={css.arrowBottom} />
        </IconButton>
      </Box>
    </Box>
  );
}
