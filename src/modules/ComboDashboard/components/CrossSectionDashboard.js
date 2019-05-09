import React, { Suspense, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import { ParentSize } from "@vx/responsive";
import { useFormations, useProjections, useSurveys, useWellPath } from "../../../api";
import CrossSection from "./CrossSection/index";

export const CrossSectionDashboard = ({ wellId }) => {
  // TODO: Pull data from store instead. This re-fetches on every tab switch.
  const surveys = useSurveys(wellId);
  const wellPlan = useWellPath(wellId);
  const formations = useFormations(wellId);
  const projections = useProjections(wellId);

  const [view, setView] = useState({
    x: -844,
    y: -16700,
    xScale: 2.14,
    yScale: 2.14,
    leftVs: 663.1,
    leftTot: 7930.8,
    leftBot: 7956.8,
    rightVs: 911.4,
    rightTot: 7930,
    rightBot: 7956,
    paVs: 900,
    paTcl: 7950
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
      <ParentSize style={{ height: "100%", flex: 1, position: "relative" }}>
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
          />
        )}
      </ParentSize>
    </Suspense>
  );
};
CrossSectionDashboard.propTypes = {
  wellId: PropTypes.string
};

export default CrossSectionDashboard;
