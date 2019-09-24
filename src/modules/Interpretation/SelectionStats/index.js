import React from "react";
import { Box } from "@material-ui/core";
import SelectionStats from "./SelectionStats";
import {
  useComputedSegments,
  useSelectedWellLog,
  useComputedDraftSegmentsOnly,
  useLogExtent,
  useSelectedSegmentState,
  useSelectedSurvey,
  getPendingSegmentsExtent,
  usePendingSegments
} from "../selectors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import CondensedText from "../../../components/ContensedText.js";
import css from "./styles.scss";
import { useWellIdContainer } from "../../App/Containers";
import WellColorPicker from "./WellColorPicker";
import { EMPTY_FIELD } from "../../../constants/format";
import { withWellLogsData, EMPTY_ARRAY } from "../../../api";

function SelectionStatsContainer({ data: { result } }) {
  const [{ draftMode }] = useComboContainer();
  const computedSegments = useComputedDraftSegmentsOnly();
  const { byId: computedSegmentsById } = useComputedSegments();
  const { selectedWellLog } = useSelectedWellLog();
  const computedSelectedLog = useSelectedSegmentState();
  const selectedSurvey = useSelectedSurvey();
  const { wellId } = useWellIdContainer();
  const selectedWellLogGammaRange = useLogExtent(selectedWellLog, wellId) || [];
  const computedSelectedWellLog = selectedWellLog && computedSegmentsById[selectedWellLog.id];
  const [, , , extentsByTableName] = (result && result.logsGammaExtent) || EMPTY_ARRAY;
  const pendingSegments = usePendingSegments();
  const { extent: selectionExtent } = getPendingSegmentsExtent(pendingSegments, extentsByTableName);

  return (
    <Box display="flex" flexDirection="column" className={css.root}>
      <Box display="flex" flexDirection="row" mb={1}>
        <CondensedText className={css.label}>Source</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <Box flexDirection="column" mr={1}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            className={css.header}
            justifyContent="center"
            pb={0.5}
            mb={0.5}
          >
            <CondensedText className={css.label}>Curr Survey</CondensedText>
            <WellColorPicker field="selectedsurveycolor" />
            <CondensedText>{selectedSurvey ? `#${selectedSurvey.id}` : EMPTY_FIELD}</CondensedText>
          </Box>
          <SelectionStats
            selection={[computedSelectedWellLog]}
            selectedWellLog={draftMode ? selectedWellLog : computedSelectedWellLog}
            mr={2}
            gammaRange={selectedWellLogGammaRange}
          />
        </Box>
        <Box flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            className={css.header}
            justifyContent="center"
            pb={0.5}
            mb={0.5}
          >
            <CondensedText className={css.label}>Draft Survey</CondensedText>
            <WellColorPicker field="draftcolor" boxProps={{ style: { opacity: draftMode ? 1 : 0.4 } }} />
            <CondensedText>{draftMode ? "On" : "Off"}</CondensedText>
          </Box>
          {draftMode ? (
            <SelectionStats
              selection={computedSegments}
              selectedWellLog={computedSelectedLog}
              gammaRange={selectionExtent}
            />
          ) : (
            <div className={css.draftHelpText}>
              <CondensedText>
                Instead of working on single model segments, switch to Draft Mode to draft dips and faults of one or
                more segments before applying them to your model.
              </CondensedText>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default withWellLogsData(SelectionStatsContainer);
