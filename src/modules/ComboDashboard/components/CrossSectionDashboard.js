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
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const formations = useFormations(wellId);
  const projections = useProjections(wellId);

  const lastSurveyIdx = surveys.length - 2;
  const rawSections = useMemo(() => surveys.slice(0, lastSurveyIdx + 1).concat(projections), [
    surveys,
    lastSurveyIdx,
    projections
  ]);
  const [selectedSections, setSelectedSections] = useReducer(singleSelectionReducer, []);
  const [ghostDiff, ghostDiffDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const calculatedProjections = useMemo(() => {
    const index = projections.findIndex(p => p.id === ghostDiff.id);
    return projections.map((p, i) => {
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
        // TODO: Confirm this results in the right display
        return {
          ...p,
          tvd: p.tvd + ghostDiff.tot + ghostDiff.fault,
          vs: p.vs + ghostDiff.vs
        };
      } else {
        return { ...p };
      }
    });
  }, [projections, ghostDiff]);

  const calcSections = useMemo(() => surveys.slice(0, lastSurveyIdx + 1).concat(calculatedProjections), [
    surveys,
    lastSurveyIdx,
    calculatedProjections
  ]);

  const calculatedFormations = useMemo(() => {
    const index = calcSections.findIndex(p => p.id === ghostDiff.id);
    // TODO: Rewrite so the bit projection forms it's own section
    // Currently formations includes a point for the bit projection and sectionsList doesn't
    // Remove the bit projection from formations until we know how to handle that
    const f = formations.map(f => {
      return {
        ...f,
        data: f.data.filter((p, i) => i !== lastSurveyIdx + 1)
      };
    });

    return f.map(layer => {
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
          return { ...point };
        })
      };
    });
  }, [formations, ghostDiff, calcSections, lastSurveyIdx]);

  useEffect(() => {
    const i = selectedSections.findIndex(a => a === true);
    if (i !== -1) {
      ghostDiffDispatch({ type: "init", section: rawSections[i], prevSection: rawSections[i - 1] });
    }
  }, [selectedSections, rawSections]);

  // TODO: calculate these based on some 'default zoom' estimate from data (will need width/height)
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
      <h2>Cross-section</h2>
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
            calculatedFormations={calculatedFormations}
            projections={projections}
            calcSections={calcSections}
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
            lastSurveyIdx={lastSurveyIdx}
            calculatedProjections={calculatedProjections}
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
