import React from "react";
import { useComputedSegments } from "../../selectors";
import { RowItem } from "../../SelectionStats/SelectionStats";
import css from "./styles.scss";
import { Box } from "@material-ui/core";

export default function LastSurveyStats(props) {
  const { segments } = useComputedSegments();
  const lastSegment = segments[segments.length - 1];
  return (
    <Box {...props} className={css.root}>
      <RowItem label="Last MD" startValue={lastSegment.startmd} endValue={lastSegment.endmd} labelClass={css.label} />
    </Box>
  );
}
