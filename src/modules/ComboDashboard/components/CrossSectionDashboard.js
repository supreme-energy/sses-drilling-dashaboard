import { CircularProgress, Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import { useFilteredWellData } from "../../App/Containers";

import WidgetCard from "../../WidgetCard";
import classes from "./ComboDashboard.scss";
import { DIP_FAULT_POS_VS, TOT_POS_VS, TVD_VS } from "../../../constants/calcMethods";
import usePrevious from "react-use/lib/usePrevious";
import { FAULT_END, PA_END, TAG_END, INIT, DIP_END } from "../../../constants/interactivePAStatus";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";
import { PADeltaInit, PADeltaReducer } from "../../App/reducers";

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

  const [expanded, setExpanded] = useState(false);
  return (
    <WidgetCard className={classes.crossSectionDash} hideMenu>
      <div className={classNames(classes.responsiveWrapper, classes.column)}>
        <Typography variant="subtitle1">Cross Section</Typography>
        <div className={classNames(classes.column, classes.grow)}>
          <Suspense fallback={<CircularProgress />}>
            <ParentSize debounceTime={100}>
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
                />
              )}
            </ParentSize>
          </Suspense>
        </div>
        <div className={classes.cardLine} />
        <div className={classNames(classes.column, classes.shrink)}>
          <div className={classes.row}>
            <IconButton
              size="small"
              className={classNames(classes.expand, {
                [classes.expandOpen]: expanded
              })}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="Show more"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography variant="subtitle1">Details</Typography>
          </div>
          <Collapse in={expanded} unmountOnExit>
            <DetailsTable ghostDiff={ghostDiff} />
          </Collapse>
        </div>
      </div>
    </WidgetCard>
  );
};
CrossSectionDashboard.propTypes = {
  wellId: PropTypes.string.isRequired
};

export default CrossSectionDashboard;
