import React, { useCallback, useMemo } from "react";
import { VerticalAlignTop as TopEnd, VerticalAlignBottom as BottomEnd, ArrowRightAlt } from "@material-ui/icons";
import css from "./styles.scss";
import { Box, IconButton, Typography } from "@material-ui/core";
import { useSelectedWellLog, useSelectedMd } from "../selectors";
import { useSelectionActions } from "../actions";
import { useWellLogsContainer } from "../../ComboDashboard/containers/wellLogs";

export default function NavigationSettings(props) {
  const selectedMd = useSelectedMd();
  const { toggleMdSelection } = useSelectionActions();
  const { selectedWellLog } = useSelectedWellLog();

  const [logs] = useWellLogsContainer();
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
        <IconButton disableRipple onClick={selectFirst} className={css.arrowButton}>
          <TopEnd />
        </IconButton>
        <IconButton disableRipple onClick={selectPrev} className={css.arrowButton}>
          <ArrowRightAlt className={css.arrowTop} />
        </IconButton>
        <IconButton disableRipple onClick={selectNext} className={css.arrowButton}>
          <ArrowRightAlt className={css.arrowBottom} />
        </IconButton>
        <IconButton disableRipple onClick={selectLast} className={css.arrowButton}>
          <BottomEnd />
        </IconButton>
      </Box>
    </Box>
  );
}