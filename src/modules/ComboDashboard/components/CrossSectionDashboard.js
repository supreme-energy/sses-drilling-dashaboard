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
  const [selectedList, setSelectedList] = useReducer(singleSelectionReducer, []);
  const [PADelta, PADeltaDispatch] = useReducer(PADeltaReducer, {}, PADeltaInit);

  const calculatedProjections = useMemo(() => {
    let index = projections.findIndex(p => p.id === PADelta.id);
    return projections.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          tvd: p.tvd + PADelta.tvd,
          vs: p.vs + PADelta.vs,
          tot: p.tot + PADelta.tot + PADelta.fault,
          bot: p.bot + PADelta.bot + PADelta.fault,
          tcl: p.tcl + PADelta.tcl + PADelta.fault,
          fault: PADelta.fault
        };
      } else if (i > index) {
        // TODO: Confirm this results in the right display
        return {
          ...p,
          tvd: p.tvd + PADelta.tot + PADelta.fault,
          vs: p.vs + PADelta.vs
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

  const calculatedFormations = useMemo(() => {
    let index = sectionList.findIndex(p => p.id === PADelta.id);
    // TODO: Determine if the bit projection formation point should be left in
    // Currently formations includes a point for the bit projection and sectionsList doesn't
    // Remove the bit projection from formations until we know how to handle that
    let f = formations.map(f => {
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
              vs: point.vs + PADelta.vs,
              tot: point.tot + PADelta.tot + PADelta.fault,
              fault: PADelta.fault
            };
          } else if (j > index) {
            return {
              ...point,
              vs: point.vs + PADelta.vs,
              tot: point.tot + PADelta.tot + PADelta.fault,
              fault: point.fault
            };
          }
          return { ...point };
        })
      };
    });
  }, [formations, PADelta, sectionList, lastSurveyIdx]);

  useEffect(() => {
    let i = selectedList.findIndex(a => a === true);
    if (i !== -1) {
      PADeltaDispatch({ type: "init", section: sectionList[i], prevSection: sectionList[i - 1] });
    }
    /* eslint react-hooks/exhaustive-deps: 0 */
    /* This should only recalculate if the selected item changes.  Including either sectionList or
     * selectedList themselves will cause this to calculate thousands of times in a few seconds */
  }, [selectedList.join(",")]);

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
