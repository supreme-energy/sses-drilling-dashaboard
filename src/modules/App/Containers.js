import { useState, useCallback } from "react";
import { createContainer } from "unstated-next";
import memoize from "react-powertools/memoize";

import { ON_SURFACE } from "../../constants/wellPathStatus";
import { useFormations, useProjections, useSurveys, useWellPath } from "../../api";

const filterDataToInterval = memoize((data, interval) => {
  if (data && data.length && interval[0] && interval[1]) {
    return data.filter(({ md }) => valueIsBetweenInterval(md, interval));
  } else return data;
});

const valueIsBetweenInterval = (value, interval) => {
  if (interval[0] && interval[1]) {
    return interval[0] <= value && value <= interval[1];
  } else return false;
};

// Shared state for current time slider location
function useTimeSliderData() {
  const [sliderInterval, setSliderInterval] = useState([]);
  const [drillPhase, setDrillPhase] = useState(ON_SURFACE);
  return { sliderInterval, setSliderInterval, drillPhase, setDrillPhase };
}

function useAppStateData() {
  const [wellInfoRefreshId, updateWellInfoRefreshId] = useState(0);

  const refreshWellInfoData = useCallback(() => {
    const now = Date.now();
    updateWellInfoRefreshId(now);
  }, []);
  return { wellInfoRefreshId, refreshWellInfoData, updateWellInfoRefreshId };
}

export const { Provider: TimeSliderProvider, useContainer: useTimeSliderContainer } = createContainer(
  useTimeSliderData
);

export const { Provider: AppStateProvider, useContainer: useAppState } = createContainer(useAppStateData);

// Uses current time slider location to filter well Cross-Section
export function useFilteredWellData(wellId) {
  const { sliderInterval } = useTimeSliderContainer();

  const formations = useFormations(wellId);
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const projections = useProjections(wellId);

  // Filter data and memoize
  const surveysFiltered = filterDataToInterval(surveys, sliderInterval);
  const projectionsFiltered = filterDataToInterval(projections, sliderInterval);
  const wellPlanFiltered = filterDataToInterval(wellPlan, sliderInterval);
  const formationsFiltered = formations.map(f => {
    return {
      ...f,
      data: filterDataToInterval(f.data, sliderInterval)
    };
  });

  return {
    surveys: surveysFiltered,
    wellPlan: wellPlanFiltered,
    formations: formationsFiltered,
    projections: projectionsFiltered
  };
}
