import React, { useCallback } from "react";
import { Box, Button } from "@material-ui/core";
import css from "./styles.scss";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import VisibilitySettings from "./VisibilitySettings";
import classNames from "classnames";
import NavigationSettings from "./NavigationSettings";
import ModelSurveySettings from "./ModelSurveySettings";
import DraftSurveys from "./DraftSurveys";
import ApplyDraftButtons from "./ApplyDraftButtons";
import { usePendingSegments } from "../selectors";
import { useUpdateSegmentsByMd } from "../actions";
import AutoDip from "./AutoDip";

export default function InterpretationSettings({ className }) {
  const [{ draftMode }] = useComboContainer();
  const updateSegments = useUpdateSegmentsByMd();
  const pendingSegments = usePendingSegments();
  const resetPendingState = useCallback(() => {
    const resetArgs = pendingSegments.reduce((acc, ps) => {
      acc[ps.endmd] = { dip: undefined, fault: undefined };
      return acc;
    }, {});

    updateSegments(resetArgs);
  }, [pendingSegments, updateSegments]);

  return (
    <Box display="flex" flexDirection="column" className={classNames(className, css.root)}>
      <Box display="flex" flexDirection="row">
        {draftMode ? <DraftSurveys mr={3} className="flex-none" /> : <VisibilitySettings mr={3} />}
        <NavigationSettings />
      </Box>
      <ModelSurveySettings mt={2} />
      {draftMode && (
        <React.Fragment>
          <ApplyDraftButtons />
          <Box display="flex" flexDirection="row" mb={1} mt={1} justifyContent="center">
            <Button color="primary" onClick={resetPendingState}>
              RESET FAULT/DIP
            </Button>
          </Box>
        </React.Fragment>
      )}
      {!draftMode && <AutoDip />}
    </Box>
  );
}
