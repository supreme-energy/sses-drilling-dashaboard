import React, { useCallback } from "react";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { VerticalAlignTop as TopEnd, VerticalAlignBottom as BottomEnd, ArrowRightAlt } from "@material-ui/icons";
import css from "./styles.scss";

import { Box, IconButton, Typography } from "@material-ui/core";
import { useSelectedWellLog } from "../selectors";
import { useWellIdContainer } from "../../App/Containers";
import { useWellLogList } from "../../ComboDashboard/containers/wellLogs";
import findLast from "lodash/findLast";

export default function NavigationSettings(props) {
  const [{ selectedMd }, , { setSelectedMd }] = useComboContainer();
  const { selectedWellLog } = useSelectedWellLog();
  const { wellId } = useWellIdContainer();
  const [logs] = useWellLogList(wellId);

  const selectNext = useCallback(() => {
    const next = logs.find(l => l.endmd > selectedWellLog.endmd);

    if (next) {
      setSelectedMd(next.endmd);
    }
  }, [setSelectedMd, logs, selectedWellLog]);

  const selectPrev = useCallback(() => {
    const next = findLast(logs, l => l.endmd < selectedWellLog.endmd);

    if (next) {
      setSelectedMd(next.endmd);
    }
  }, [setSelectedMd, logs, selectedWellLog]);

  const selectFirst = useCallback(() => {
    const first = logs[0];
    if (first && first.endmd !== selectedMd) {
      setSelectedMd(first.endmd);
    }
  }, [logs, setSelectedMd, selectedMd]);

  const selectLast = useCallback(() => {
    const last = logs[logs.length - 1];
    if (last && last.endmd !== selectedMd) {
      setSelectedMd(last.endmd);
    }
  }, [logs, setSelectedMd, selectedMd]);

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
