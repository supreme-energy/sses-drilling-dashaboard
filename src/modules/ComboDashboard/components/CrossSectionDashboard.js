import Progress from "@material-ui/core/CircularProgress";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { Suspense, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useFormations, useProjections, useSurveys, useWellPath } from "../../../api";
import classes from "./ComboDashboard.scss";
import CrossSection from "./CrossSection/index";

function singleSelectionReducer(list, i) {
  const newList = [];
  newList[i] = !list[i];
  return newList;
}
function PADeltaInit(section) {
  return {
    op: section,
    id: section.id,
    tvd: 0,
    tot: 0,
    bot: 0,
    vs: 0,
    fault: 0,
    dip: 0
  };
}
function PADeltaReducer(state, action) {
  switch (action.type) {
    case "dip_tot":
      console.log("dip_tot fired");
      return { ...state, tvd: state.tvd + action.tvd, vs: state.vs + action.vs };
    case "dip_bot":
      console.log("dip_bot fired");
      return { ...state, tvd: state.tvd + action.tvd, vs: state.vs + action.vs };
    case "fault_tot":
      let totToTvd = state.tot - state.tvd;
      let totToBot = state.tot - state.bot;
      return { ...state, tot: action.tot, tvd: action.tot + totToTvd, bot: action.tot + totToBot };
    case "fault_bot":
      let botToTVD = state.bot - state.tvd;
      let botToTot = state.bot - state.tot;
      return { ...state, bot: action.bot, tvd: action.bot + botToTVD, tot: action.bot + botToTot };
    case "init":
      console.log(`init called and resetting with `, action.section);
      return PADeltaInit(action.section);
    default:
      throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
  }
}
export const CrossSectionDashboard = ({ wellId }) => {
  // TODO: Pull data from store instead. This re-fetches on every tab switch.
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const formations = useFormations(wellId);
  const projections = useProjections(wellId);

  const lastSurveyIdx = surveys.length - 2;
  const [selectedList, setSelectedList] = useReducer(singleSelectionReducer, []);
  const [PADelta, PADeltaDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const calculatedProjections = useMemo(() => {
    let index = projections.findIndex(p => p.id === PADelta.id);
    return projections.map((p, i) => {
      if (i < index || index === -1) {
        return { ...p };
      } else {
        return {
          ...p,
          tvd: p.tvd + PADelta.tvd,
          vs: p.vs + PADelta.vs,
          tot: PADelta.tot,
          bot: PADelta.bot
        };
      }
    });
  }, [projections, PADelta]);

  const sectionList = useMemo(() => surveys.slice(0, lastSurveyIdx + 1).concat(calculatedProjections), [
    surveys,
    lastSurveyIdx,
    calculatedProjections
  ]);

  useEffect(() => {
    let i = selectedList.findIndex(a => a === true);
    if (i !== -1) {
      PADeltaDispatch({ type: "init", section: sectionList[i] });
    }
  }, [selectedList.join(",")]); // array changes size and useEffect doesn't like that, so join instead

  const [view, setView] = useState({
    x: -844,
    y: -16700,
    xScale: 2.14,
    yScale: 2.14
  });
  const mergeView = useCallback(function(value) {
    // Implement merging here so we don't have to everywhere else
    setView(prev => {
      if (typeof value === "function") {
        return {
          ...prev,
          ...value(prev)
        };
      }
      return {
        ...prev,
        ...value
      };
    });
  }, []);

  return (
    <Suspense fallback={<Progress />}>
      <div>
        <h2>Dev debugging data</h2>
        <div>
          <label>
            X value
            <input
              type="number"
              value={view.x}
              onChange={e => {
                const value = e.target.value;
                return mergeView({ x: value });
              }}
            />
          </label>
          <label>
            Y value
            <input
              type="number"
              value={view.y}
              onChange={e => {
                const value = e.target.value;
                return mergeView({ y: value });
              }}
            />
          </label>
          <label>
            xScale
            <input
              type="number"
              step="0.001"
              value={view.xScale}
              onChange={e => {
                const value = e.target.value;
                return mergeView({ xScale: value });
              }}
            />
          </label>
          <label>
            yScale
            <input
              type="number"
              step="0.001"
              value={view.yScale}
              onChange={e => {
                const value = e.target.value;
                return mergeView({ yScale: value });
              }}
            />
          </label>
        </div>
      </div>
      <ParentSize debounceTime={100} className={classes.responsiveWrapper}>
        {({ width, height }) => (
          <CrossSection
            width={width}
            height={height}
            view={view}
            updateView={mergeView}
            wellPlan={wellPlan}
            surveys={surveys}
            formations={formations}
            projections={projections}
            sectionList={sectionList}
            selectedList={selectedList}
            setSelectedList={setSelectedList}
            lastSurveyIdx={lastSurveyIdx}
            calculatedProjections={calculatedProjections}
            interactivePADispatch={PADeltaDispatch}
          />
        )}
      </ParentSize>
    </Suspense>
  );
};
CrossSectionDashboard.propTypes = {
  wellId: PropTypes.string.isRequired
};

export default CrossSectionDashboard;
