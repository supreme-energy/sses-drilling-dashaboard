import { CircularProgress, Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useReducer } from "react";
import { useFilteredWellData } from "../../App/Containers";

import WidgetCard from "../../WidgetCard";
import classes from "./ComboDashboard.scss";
import { calculateDip, getChangeInY } from "./CrossSection/formulas";
import { DIP_FAULT_POS_VS, TOT_POS_VS, TVD_VS } from "../../../constants/CalcMethods";
import usePrevious from "react-use/lib/usePrevious";
import {
  DIP_BOT_MOVE,
  DIP_TOT_MOVE,
  FAULT_BOT_MOVE,
  FAULT_TOT_MOVE,
  FAULT_END,
  PA_MOVE,
  PA_END,
  TAG_MOVE,
  TAG_END,
  INIT,
  DIP_END
} from "../../../constants/interactivePAStatus";

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
function PADeltaInit(options = {}) {
  const section = options.section || {};
  return {
    prevOp: options.prevSection,
    nextOp: options.nextSection,
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

function PADeltaReducer(state, action) {
  const { prevOp, op, nextOp } = state;
  let depthDelta = 0;
  switch (action.type) {
    case DIP_TOT_MOVE:
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      depthDelta = action.tot - op.tot - state.prevFault + op.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        tvd: depthDelta,
        dip: op.dip - calculateDip(action.tot - state.prevFault, prevOp.tot, action.vs, prevOp.vs),
        method: TOT_POS_VS,
        status: action.type
      };
    case DIP_BOT_MOVE:
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      depthDelta = action.bot - op.bot - state.prevFault + op.fault;
      return {
        ...state,
        tot: depthDelta,
        vs: action.vs - op.vs,
        bot: depthDelta,
        tcl: depthDelta,
        tvd: depthDelta,
        dip: op.dip - calculateDip(action.bot - state.prevFault, prevOp.bot, action.vs, prevOp.vs),
        method: TOT_POS_VS,
        status: action.type
      };
    case FAULT_TOT_MOVE:
      return {
        ...state,
        prevFault: action.tot - prevOp.tot,
        prevMethod: DIP_FAULT_POS_VS,
        status: action.type
      };
    case FAULT_BOT_MOVE:
      return {
        ...state,
        prevFault: action.bot - prevOp.bot,
        prevMethod: DIP_FAULT_POS_VS,
        status: action.type
      };
    case PA_MOVE:
      return {
        ...state,
        tvd: action.tvd - op.tvd - state.prevFault,
        method: TVD_VS,
        status: action.type
      };
    case TAG_MOVE:
      // We don't currently want the surveys or bit proj to be adjustable
      if (op.isSurvey || op.isBitProj) return state;
      // Keep the PA station within its segment
      if (prevOp && action.vs <= prevOp.vs) return state;
      if (nextOp && action.vs >= nextOp.vs) return state;

      const changeInY = getChangeInY(state.dip - op.dip, action.vs, prevOp.vs);
      return {
        ...state,
        vs: action.vs - op.vs,
        tot: prevOp.tot - op.tot + changeInY + op.fault,
        tcl: prevOp.tcl - op.tcl + changeInY + op.fault,
        bot: prevOp.bot - op.bot + changeInY + op.fault,
        method: DIP_FAULT_POS_VS,
        status: action.type
      };
    case INIT:
      return PADeltaInit(action);
    case DIP_END:
      return { ...state, status: DIP_END };
    case FAULT_END:
      return { ...state, status: FAULT_END };
    case PA_END:
      return { ...state, status: PA_END };
    case TAG_END:
      return { ...state, status: TAG_END };
    default:
      throw new Error(`Unknown PA Delta reducer action type ${action.type}`);
  }
}

export const CrossSectionDashboard = ({ wellId }) => {
  const { surveys, wellPlan, formations, projections, saveProjection } = useFilteredWellData(wellId);

  const firstProjectionIdx = surveys.length;
  const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const [selectedSections, setSelectedSections] = useReducer(selectionReducer, []);
  const [ghostDiff, ghostDiffDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const prevStatus = usePrevious(ghostDiff.status);
  useEffect(() => {
    const { status, op, prevOp } = ghostDiff;
    const pos = op.tcl + ghostDiff.tcl - (op.tvd + ghostDiff.tvd);
    if (prevStatus !== status) {
      switch (status) {
        case DIP_END:
          saveProjection(op.id, TOT_POS_VS, { tot: op.tot + ghostDiff.tot, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
        case FAULT_END:
          saveProjection(prevOp.id, DIP_FAULT_POS_VS, { fault: prevOp.fault + ghostDiff.prevFault });
          break;
        case PA_END:
          saveProjection(op.id, TVD_VS, { tvd: op.tvd + ghostDiff.tvd, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
        case TAG_END:
          saveProjection(op.id, DIP_FAULT_POS_VS, { dip: op.dip + ghostDiff.dip, vs: op.vs + ghostDiff.vs, pos: pos });
          break;
      }
    }
  }, [ghostDiff, prevStatus, saveProjection]);

  const calcSections = useMemo(() => {
    const index = rawSections.findIndex(p => p.id === ghostDiff.id);
    if (index === -1) {
      return rawSections;
    }
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
      } else if (i > index) {
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tot + ghostDiff.prevFault
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
      ghostDiffDispatch({
        type: INIT,
        prevSection: rawSections[index - 1],
        section: rawSections[index],
        nextSection: rawSections[index + 1]
      });
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
      <Typography variant="subtitle1">Cross Section</Typography>
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
              ghostDiff={ghostDiff}
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
