import { useComputedSurveysAndProjections } from "../Interpretation/selectors";
import { useComboContainer } from "../ComboDashboard/containers/store";
import { useProjectionsDataContainer, useSurveysDataContainer } from "./Containers";
import { useCallback, useMemo, useRef } from "react";
import _ from "lodash";

export function useSaveSurveysAndProjections() {
  const [, dispatch] = useComboContainer();
  const [{ pendingSegmentsState }] = useComboContainer();
  const { replaceResult: replaceProjections, saveProjection } = useProjectionsDataContainer();
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
    console.log(pendingRef.current, pendingSurveyState);
    replaceSurveysAndProjections();
    const res = Promise.all(_.map(pendingSurveyState, (fields, surveyId) => updateSurvey({ surveyId, fields })));
    dispatch({ type: "RESET_SEGMENTS_PROPERTIES", propsById: pendingSurveyState });
    return res;
  }, [surveyIds, pendingRef, dispatch, updateSurvey, replaceSurveysAndProjections]);

  return { saveSurveys };
}
