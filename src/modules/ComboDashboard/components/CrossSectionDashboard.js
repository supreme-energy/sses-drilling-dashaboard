import Progress from "@material-ui/core/CircularProgress";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { Suspense, useCallback, useEffect, useMemo, useReducer } from "react";
import { useFilteredWellData } from "../../App/Containers";

import classes from "./ComboDashboard.scss";
import { calculateDip, getChangeInY } from "./CrossSection/formulas";
import CrossSection from "./CrossSection/index";

function selectionReducer(state, action) {
  switch (action.type) {
    // A planned feature is multiple selection, but only single is supported now
    case "toggle":
      return {
        [action.id]: !state[action.id]
      };
    case "clear":
      return {};
    default:
      throw new Error(`Unknown selected section reducer action type ${action.type}`);
  }
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
    vs: 0,
    dip: 0
  };
}

function PADeltaReducer(state, action) {
  const op = state.op;
  const prevOp = state.prevOp;
  let depthDelta = 0;
  switch (action.type) {
    case "dip_tot":
      depthDelta = action.tot - op.tot - state.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        dip: op.dip - calculateDip(action.tot - state.fault, prevOp.tot, action.vs, prevOp.vs)
      };
    case "dip_bot":
      depthDelta = action.bot - op.bot - state.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        dip: op.dip - calculateDip(action.bot - state.fault, prevOp.bot, action.vs, prevOp.vs)
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
        tvd: action.tvd - op.tvd
      };
    case "tag_move":
      // We don't currently want the surveys or bit proj to be adjustable
      if (op.isSurvey || op.isBitProj) {
        return state;
      }
      const changeInY = getChangeInY(state.dip - op.dip, action.vs, prevOp.vs);
      return {
        ...state,
        vs: action.vs - op.vs,
        tot: prevOp.tot - op.tot + changeInY,
        tcl: prevOp.tcl - op.tcl + changeInY,
        bot: prevOp.bot - op.bot + changeInY
      };
    case "init":
      return PADeltaInit(action.section, action.prevSection);
    default:
      throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
  }
}

export const CrossSectionDashboard = ({ wellId }) => {
  const { surveys, wellPlan, formations, projections, bitProjId, lastSurveyId } = useFilteredWellData(wellId);

  const lastSurveyIdx = surveys.findIndex(s => s.id === lastSurveyId);
  const firstProjectionIdx = surveys.length;
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const [selectedSections, setSelectedSections] = useReducer(selectionReducer, []);
  const [ghostDiff, ghostDiffDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const calcSections = useMemo(() => {
    const index = rawSections.findIndex(p => p.id === ghostDiff.id);
    return rawSections.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tvd + ghostDiff.fault,
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
    const id = Object.keys(selectedSections)[0];
    const index = rawSections.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      ghostDiffDispatch({ type: "init", section: rawSections[index], prevSection: rawSections[index - 1] });
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
            firstProjectionIdx={firstProjectionIdx}
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
