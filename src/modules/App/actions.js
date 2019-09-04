import { useComputedSurveysAndProjections } from "../Interpretation/selectors";
import { useComboContainer } from "../ComboDashboard/containers/store";
import { useProjectionsDataContainer, useSurveysDataContainer } from "./Containers";
import { useCallback, useMemo, useRef } from "react";
import _ from "lodash";

export function useSaveSurveysAndProjections() {
  const [, dispatch] = useComboContainer();
  const [{ pendingSegmentsState }] = useComboContainer();
  const { replaceResult: replaceProjections, updateProjection } = useProjectionsDataContainer();
  const { replaceResult: replaceSurveys, updateSurvey } = useSurveysDataContainer();
  const [, computedSurveys, computedProjections] = useComputedSurveysAndProjections();

  //  These change with every pending survey/projection value update.
  //  A debounced save with these as dependencies is worthless, since it redefines the callback on every change
  const pendingRef = useRef({});
  pendingRef.current.pendingSegmentsState = pendingSegmentsState;
  pendingRef.current.computedSurveys = computedSurveys;
  pendingRef.current.computedProjections = computedProjections;

  const replaceSurveysAndProjections = useCallback(() => {
    replaceProjections(pendingRef.current.computedProjections);
    replaceSurveys(pendingRef.current.computedSurveys);
  }, [replaceProjections, replaceSurveys, pendingRef]);

  const save = useCallback(() => {
    const { computedSurveys, computedProjections, pendingSegmentsState } = pendingRef.current;
    const surveyIds = _.keyBy(computedSurveys, s => s.id);
    const projectionIds = _.keyBy(computedProjections, p => p.id);
    const pendingSurveyState = _.pickBy(pendingSegmentsState, (val, key) => !!surveyIds[key]);
    const pendingProjectionsState = _.pickBy(pendingSegmentsState, (val, key) => !!projectionIds[key]);

    replaceSurveysAndProjections();
    const surveyRes = Promise.all(
      _.map(pendingSurveyState, (fields, surveyId) => updateSurvey({ surveyId: Number(surveyId), fields }))
    );
    const projectionRes = Promise.all(
      _.map(pendingProjectionsState, (fields, projectionId) =>
        updateProjection({ projectionId: Number(projectionId), fields })
      )
    );
    dispatch({ type: "RESET_SEGMENTS_PROPERTIES", propsById: { ...pendingSurveyState, ...pendingProjectionsState } });
    return [].concat(surveyRes, projectionRes);
  }, [pendingRef, dispatch, updateSurvey, replaceSurveysAndProjections, updateProjection]);

  const debouncedSave = useMemo(() => _.debounce(save, 500), [save]);

  return { save, debouncedSave };
}
