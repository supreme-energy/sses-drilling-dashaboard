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

  const pendingRef = useRef({});
  pendingRef.current = pendingSegmentsState;
  const surveyIds = useMemo(() => _.keyBy(computedSurveys, s => s.id), [computedSurveys]);
  const projectionIds = useMemo(() => _.keyBy(computedProjections, p => p.id), [computedProjections]);

  const replaceSurveysAndProjections = useCallback(() => {
    replaceProjections(computedProjections);
    replaceSurveys(computedSurveys);
  }, [replaceProjections, replaceSurveys, computedSurveys, computedProjections]);

  const saveSurveys = useCallback(() => {
    const pendingSurveyState = _.pickBy(pendingRef.current, (val, key) => !!surveyIds[key]);
    const pendingProjectionsState = _.pickBy(pendingRef.current, (val, key) => !!projectionIds[key]);

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
  }, [surveyIds, pendingRef, dispatch, updateSurvey, replaceSurveysAndProjections, updateProjection, projectionIds]);

  return { saveSurveys };
}
