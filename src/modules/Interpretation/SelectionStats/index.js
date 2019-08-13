import React from "react";
import { Box } from "@material-ui/core";
import SelectionStats from "./SelectionStats";
import { useComputedSegments, useSelectedWellLog, useComputedDraftSegmentsOnly } from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import CondensedText from "../../../components/ContensedText.js";
import css from "./styles.scss";

export default function SelectionStatsContainer() {
  const [{ draftMode }] = useComboContainer();
  const computedSegments = useComputedDraftSegmentsOnly();
  const [, computedSegmentsById] = useComputedSegments();
  const { selectedWellLog } = useSelectedWellLog();
  const computedSelectedWellLog = selectedWellLog && computedSegmentsById[selectedWellLog.id];

  return (
    <Box display="flex" flexDirection="column" className={css.root}>
      <Box display="flex" flexDirection="row">
        test
      </Box>
      <Box display="flex" flexDirection="row">
        <SelectionStats selection={[computedSelectedWellLog]} mr={2} />
        {draftMode ? (
          <SelectionStats selection={computedSegments} />
        ) : (
          <CondensedText className={css.draftHelpText}>
            Instead of working on single model segments, switch to Draft Mode to draft dips and faults of one or more
            segments before applying them to your model.
          </CondensedText>
        )}
      </Box>
    </Box>
  );
}
