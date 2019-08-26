import React from "react";
import { Box } from "@material-ui/core";
import SelectionStats from "./SelectionStats";
import {
  useComputedSegments,
  useSelectedWellLog,
  useComputedDraftSegmentsOnly,
  useLogExtent,
  useSelectedSegmentState
} from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import CondensedText from "../../../components/ContensedText.js";
import css from "./styles.scss";
import { useLogExtentContainer } from "../containers/logExtentContainer";
import { useWellIdContainer } from "../../App/Containers";

export default function SelectionStatsContainer() {
  const [{ draftMode }] = useComboContainer();
  const computedSegments = useComputedDraftSegmentsOnly();
  const { byId: computedSegmentsById } = useComputedSegments();
  const { selectedWellLog } = useSelectedWellLog();
  const computedSelectedLog = useSelectedSegmentState();
  const { wellId } = useWellIdContainer();
  const selectedWellLogGammaRange = useLogExtent(selectedWellLog, wellId) || [];
  const computedSelectedWellLog = selectedWellLog && computedSegmentsById[selectedWellLog.id];
  const [{ selectionExtent }] = useLogExtentContainer();
  return (
    <Box display="flex" flexDirection="column" className={css.root}>
      <Box display="flex" flexDirection="row">
        test
      </Box>
      <Box display="flex" flexDirection="row">
        <SelectionStats
          selection={[computedSelectedWellLog]}
          selectedWellLog={draftMode ? selectedWellLog : computedSelectedWellLog}
          mr={2}
          gammaRange={selectedWellLogGammaRange}
        />
        {draftMode ? (
          <SelectionStats
            selection={computedSegments}
            selectedWellLog={computedSelectedLog}
            gammaRange={selectionExtent}
          />
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
