import Progress from "@material-ui/core/CircularProgress";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { Suspense, useCallback, useEffect, useMemo, useReducer } from "react";
import { useFilteredWellData } from "../../App/Containers";

import classes from "./ComboDashboard.scss";
import CrossSection from "./CrossSection/index";

function singleSelectionReducer(list, i) {
  const newList = [];
  newList[i] = !list[i];
  return newList;
}
function PADeltaInit(section, prevSection) {
  return {
    prevOp: prevSection,
    op: section,
    id: section.id,
    bot: 0,
    fault: 0,
    tcl: 0,
    tot: 0,
    tvd: 0,
    vs: 0
  };
}
function PADeltaReducer(state, action) {
  const op = state.op;
  let depthDelta = 0;
  switch (action.type) {
    case "dip_tot":
      depthDelta = action.tot - op.tot - state.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta
      };
    case "dip_bot":
      depthDelta = action.bot - op.bot - state.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta
      };
    case "fault_tot":
      return {
        ...state,
        fault: action.tot - state.prevOp.tot
      };
    case "fault_bot":
      return {
        ...state,
        fault: action.bot - state.prevOp.bot
      };
    case "pa":
      return {
        ...state,
        tvd: action.tvd - op.tvd,
        vs: action.vs - op.vs
      };
    case "init":
      return PADeltaInit(action.section, action.prevSection);
    default:
      throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
  }
}

export const CrossSectionDashboard = ({ wellId }) => {
  // TODO: Pull data from store instead. This re-fetches on every tab switch.
  const { surveys, wellPlan, formations, projections } = useFilteredWellData(wellId);

  const lastSurveyIdx = surveys.length - 2;
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const [selectedSections, setSelectedSections] = useReducer(singleSelectionReducer, []);
  const [ghostDiff, ghostDiffDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const calcSections = useMemo(() => {
    const index = rawSections.findIndex(p => p.id === ghostDiff.id);
    return rawSections.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tvd,
          vs: p.vs + ghostDiff.vs,
          tot: p.tot + ghostDiff.tot + ghostDiff.fault,
          bot: p.bot + ghostDiff.bot + ghostDiff.fault,
          tcl: p.tcl + ghostDiff.tcl + ghostDiff.fault,
          fault: p.fault + ghostDiff.fault
        };
      } else if (i > index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tot + ghostDiff.fault,
          vs: p.vs + ghostDiff.vs
        };
      } else {
        return p;
      }
    });
  }, [rawSections, ghostDiff]);

  const calculatedFormations = useMemo(() => {
    const index = calcSections.findIndex(p => p.id === ghostDiff.id);

    return formations.map(layer => {
      return {
        ...layer,
        data: layer.data.map((point, j) => {
          if (j === index) {
            return {
              ...point,
              vs: point.vs + ghostDiff.vs,
              tot: point.tot + ghostDiff.tot + ghostDiff.fault,
              fault: point.fault + ghostDiff.fault
            };
          } else if (j > index) {
            return {
              ...point,
              vs: point.vs + ghostDiff.vs,
              tot: point.tot + ghostDiff.tot + ghostDiff.fault,
              fault: point.fault
            };
          }
          return point;
        })
      };
    });
  }, [formations, ghostDiff, calcSections]);

  useEffect(() => {
    const i = selectedSections.findIndex(a => a === true);
    if (i !== -1) {
      ghostDiffDispatch({ type: "init", section: rawSections[i], prevSection: rawSections[i - 1] });
    }
  }, [selectedSections, rawSections]);

  // TODO: calculate these based on some 'default zoom' estimate from data (will need width/height)
  const [view, setView] = useReducer(
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    {
      x: -844,
      y: -16700,
      xScale: 2.14,
      yScale: 2.14
    }
  );
  const scale = useCallback((xVal, yVal) => [xVal * view.xScale + view.x, yVal * view.yScale + view.y], [view]);

  return (
    <Suspense fallback={<Progress />}>
      <h2>Cross-section</h2>
      <ParentSize debounceTime={100} className={classes.responsiveWrapper}>
        {({ width, height }) => (
          <CrossSection
            width={width}
            height={height}
            view={view}
            updateView={setView}
            scale={scale}
            wellPlan={wellPlan}
            surveys={surveys}
            formations={formations}
            calculatedFormations={calculatedFormations}
            projections={projections}
            calcSections={calcSections}
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
            lastSurveyIdx={lastSurveyIdx}
            ghostDiffDispatch={ghostDiffDispatch}
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
