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
    ...section
  };
}
function PADeltaReducer(state, action) {
  const op = state.op;
  switch (action.type) {
    case "dip_tot":
      return {
        ...state,
        tot: action.tot,
        vs: action.vs,
        bot: action.tot - (op.tot - op.bot),
        tcl: action.tot - (op.tot - op.tcl)
      };
    case "dip_bot":
      return {
        ...state,
        bot: action.bot,
        vs: action.vs,
        tot: action.bot - (op.bot - op.tot),
        tcl: action.bot - (op.bot - op.tcl)
      };
    case "fault_tot":
      return {
        ...state,
        tot: action.tot,
        tvd: action.tot - (op.tot - op.tvd),
        bot: action.tot - (op.tot - op.bot),
        tcl: action.tot - (op.tot - op.tcl)
      };
    case "fault_bot":
      return {
        ...state,
        bot: action.bot,
        tvd: action.bot - (op.bot - op.tvd),
        tot: action.bot - (op.bot - op.tot),
        tcl: action.bot - (op.bot - op.tcl)
      };
    case "pa":
      return {
        ...state,
        tvd: action.tvd,
        vs: action.vs
      };
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
      if (i === index) {
        return {
          ...p,
          tvd: PADelta.tvd,
          vs: PADelta.vs,
          tot: PADelta.tot,
          bot: PADelta.bot,
          tcl: PADelta.tcl
        };
      } else {
        return { ...p };
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
