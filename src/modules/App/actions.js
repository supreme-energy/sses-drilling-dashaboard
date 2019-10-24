import { useComputedSurveysAndProjections, useComputedSegments } from "../Interpretation/selectors";
import { useComboContainer } from "../ComboDashboard/containers/store";
import { useProjectionsDataContainer, useSurveysDataContainer } from "./Containers";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { useWellLogsContainer } from "../ComboDashboard/containers/wellLogs";

export function useSaveSurveysAndProjections() {
  const [, dispatch] = useComboContainer();
  const [{ pendingSegmentsState }] = useComboContainer();
  const { replaceResult: replaceProjections, updateProjection } = useProjectionsDataContainer();
  const { replaceResult: replaceSurveys, updateSurvey } = useSurveysDataContainer();
  const [, , , { replaceResult: replaceWellLogs }] = useWellLogsContainer();
  const [, computedSurveys, computedProjections] = useComputedSurveysAndProjections();
  const { segments: computedSegments } = useComputedSegments();

  const [saveId, setSaveId] = useState(0);
  const internalState = useRef({ lastPerfomedSave: null });

  const save = useCallback(() => {
    setSaveId(Date.now());
  }, []);

  useEffect(() => {
    const lastPerfomedSave = internalState.current.lastPerfomedSave;
    if (saveId !== lastPerfomedSave) {
      internalState.current.lastPerfomedSave = saveId;

      const surveyIds = _.keyBy(computedSurveys, s => s.id);
      const projectionIds = _.keyBy(computedProjections, p => p.id);
      const pendingSurveyState = _.pickBy(pendingSegmentsState, (val, key) => !!surveyIds[key]);
      const pendingProjectionsState = _.pickBy(pendingSegmentsState, (val, key) => !!projectionIds[key]);

      replaceProjections(computedProjections);
      replaceSurveys(computedSurveys);
      replaceWellLogs(computedSegments);
      dispatch({
        type: "RESET_SEGMENTS_PROPERTIES",
        propsById: { ...pendingSurveyState, ...pendingProjectionsState }
      });

      Promise.all(
        _.map(pendingProjectionsState, (fields, projectionId) =>
          updateProjection({ projectionId: Number(projectionId), fields })
        ).concat(_.map(pendingSurveyState, (fields, surveyId) => updateSurvey({ surveyId: Number(surveyId), fields })))
      );
    }
  }, [
    saveId,
    dispatch,
    updateSurvey,
    updateProjection,
    replaceWellLogs,
    pendingSegmentsState,
    computedSurveys,
    computedProjections,
    computedSegments,
    replaceSurveys,
    replaceProjections
  ]);
  const debouncedSave = useMemo(() => _.debounce(save, 500), [save]);
  return { save, debouncedSave };
}
