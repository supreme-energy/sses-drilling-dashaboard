import React, { useCallback, useMemo } from "react";
import { VerticalAlignTop as TopEnd, VerticalAlignBottom as BottomEnd, ArrowRightAlt } from "@material-ui/icons";
import css from "./styles.scss";
import { Box, IconButton, Typography } from "@material-ui/core";
import { useSelectedWellLog } from "../selectors";
import { useSelectionActions } from "../actions";
import { useWellLogsContainer } from "../../ComboDashboard/containers/wellLogs";

export default function NavigationSettings(props) {
  const { changeWellLogSelection } = useSelectionActions();
  const { selectedWellLog } = useSelectedWellLog();

  const [logs] = useWellLogsContainer();
  const selectedWellIndex = useMemo(() => selectedWellLog && logs.findIndex(l => l.id === selectedWellLog.id), [
    selectedWellLog,
    logs
  ]);

  const selectNext = useCallback(() => {
    const next = logs[selectedWellIndex + 1];

    if (next) {
      changeWellLogSelection(next);
    }
  }, [logs, selectedWellIndex, changeWellLogSelection]);

  const selectPrev = useCallback(() => {
    const prev = logs[selectedWellIndex - 1];

    if (prev) {
      changeWellLogSelection(prev);
    }
  }, [logs, selectedWellIndex, changeWellLogSelection]);

  const selectFirst = useCallback(() => {
    const first = logs[0];
    if (first) {
      changeWellLogSelection(first);
    }
  }, [logs, changeWellLogSelection]);

  const selectLast = useCallback(() => {
    const last = logs[logs.length - 1];
    if (last) {
      changeWellLogSelection(last);
    }
  }, [logs, changeWellLogSelection]);

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
