import { Typography, CircularProgress } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useReducer, Suspense, lazy } from "react";
import { useFilteredWellData } from "../../App/Containers";

import WidgetCard from "../../WidgetCard";
import classes from "./ComboDashboard.scss";
import { calculateDip, getChangeInY } from "./CrossSection/formulas";
import { DIP_FAULT_POS_VS, TOT_POS_VS, TVD_VS } from "../../../constants/CalcMethods";

const CrossSection = lazy(() => import(/* webpackChunkName: 'CrossSection' */ "./CrossSection/index"));

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
    prevFault: 0,
    tcl: 0,
    tot: 0,
    tvd: 0,
    vs: 0,
    dip: 0
  };
}

function makePAReducer(saveProjection) {
  return function PADeltaReducer(state, action) {
    const op = state.op;
    const prevOp = state.prevOp;
    let depthDelta = 0;
    const pos = op.tcl + state.tcl - (op.tvd + state.tvd);
    switch (action.type) {
      case "dip_tot":
        depthDelta = action.tot - op.tot - state.prevFault + op.fault;
        return {
          ...state,
          tot: depthDelta,
          vs: action.vs - op.vs,
          bot: depthDelta,
          tcl: depthDelta,
          dip: op.dip - calculateDip(action.tot - state.prevFault, prevOp.tot, action.vs, prevOp.vs)
        };
      case "dip_bot":
        depthDelta = action.bot - op.bot - state.prevFault + op.fault;
        return {
          ...state,
          tot: depthDelta,
          vs: action.vs - op.vs,
          bot: depthDelta,
          tcl: depthDelta,
          dip: op.dip - calculateDip(action.bot - state.prevFault, prevOp.bot, action.vs, prevOp.vs)
        };
      case "dip_end":
        saveProjection(op.id, TOT_POS_VS, { tot: op.tot + state.tot, pos: pos, vs: op.vs + state.vs });
        return state;
      case "fault_tot":
        return {
          ...state,
          prevFault: action.tot - prevOp.tot
        };
      case "fault_bot":
        return {
          ...state,
          prevFault: action.bot - prevOp.bot
        };
      case "fault_end":
        saveProjection(prevOp.id, DIP_FAULT_POS_VS, { fault: prevOp.fault + state.prevFault, pos: pos });
        return state;
      case "pa":
        return {
          ...state,
          tvd: action.tvd - op.tvd - state.prevFault
        };
      case "pa_end":
        saveProjection(op.id, TVD_VS, { tvd: op.tvd + state.tvd, vs: op.vs + state.vs, pos: pos });
        return state;
      case "tag_move":
        // We don't currently want the surveys or bit proj to be adjustable
        if (op.isSurvey || op.isBitProj) {
          return state;
        }
        const changeInY = getChangeInY(state.dip - op.dip, action.vs, prevOp.vs);
        return {
          ...state,
          vs: action.vs - op.vs,
          tot: prevOp.tot - op.tot + changeInY + op.fault,
          tcl: prevOp.tcl - op.tcl + changeInY + op.fault,
          bot: prevOp.bot - op.bot + changeInY + op.fault
        };
      case "tag_end":
        saveProjection(op.id, DIP_FAULT_POS_VS, { vs: op.vs + state.vs, dip: op.dip + state.dip, pos: pos });
        return state;
      case "init":
        return PADeltaInit(action.section, action.prevSection);
      default:
        throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
    }
  };
}

export const CrossSectionDashboard = ({ wellId }) => {
  const { surveys, wellPlan, formations, projections, saveProjection, refresh } = useFilteredWellData(wellId);

  const firstProjectionIdx = surveys.length;
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const [selectedSections, setSelectedSections] = useReducer(selectionReducer, []);
  const [ghostDiff, ghostDiffDispatch] = useReducer(makePAReducer(saveProjection), {}, PADeltaInit);

  const calcSections = useMemo(() => {
    const index = rawSections.findIndex(p => p.id === ghostDiff.id);
    return rawSections.map((p, i) => {
      if (i === index - 1) {
        return {
          ...p,
          tot: p.tot + ghostDiff.prevFault,
          bot: p.bot + ghostDiff.prevFault,
          tcl: p.tcl + ghostDiff.prevFault,
          fault: p.fault + ghostDiff.prevFault
        };
      } else if (i === index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tvd + ghostDiff.prevFault,
          vs: p.vs + ghostDiff.vs,
          tot: p.tot + ghostDiff.tot + ghostDiff.prevFault,
          bot: p.bot + ghostDiff.bot + ghostDiff.prevFault,
          tcl: p.tcl + ghostDiff.tcl + ghostDiff.prevFault
        };
      } else if (i > index && index !== -1) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tot + ghostDiff.prevFault,
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
              fault: point.fault + ghostDiff.prevFault,
              tot: point.tot + ghostDiff.tot + ghostDiff.prevFault
            };
          } else if (j > index) {
            return {
              ...point,
              vs: point.vs + ghostDiff.vs,
              tot: point.tot + ghostDiff.tot + ghostDiff.prevFault
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
    <WidgetCard className={classes.crossSectionDash}>
      <Typography variant="subtitle1" style={{ display: "inline-block" }}>
        Cross Section
      </Typography>
      <a onClick={refresh}> refresh</a>
      <Suspense fallback={<CircularProgress />}>
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
              firstProjectionIdx={firstProjectionIdx}
              ghostDiffDispatch={ghostDiffDispatch}
              saveProjection={saveProjection}
            />
          )}
        </ParentSize>
      </Suspense>
    </WidgetCard>
  );
};
CrossSectionDashboard.propTypes = {
  wellId: PropTypes.string.isRequired
};

export default CrossSectionDashboard;
