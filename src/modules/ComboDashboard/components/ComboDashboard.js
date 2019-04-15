import React, { Suspense, useState, useCallback } from "react";
import Progress from "@material-ui/core/CircularProgress";
import surveyData from "../../../data/survey.json";
import wellPlanData from "../../../data/wellplan";
import formationData from "../../../data/formationList";
import CrossSection from "./CrossSection/index";

export const ComboDashboard = () => {
  // Replace with useFetch
  const surveys = surveyData;
  const wellPlan = wellPlanData;
  const formations = formationData;
  const [x, setX] = useState(400);
  const [y, setY] = useState(500);

  const [view, setView] = useState({
    x: 200,
    y: -2200,
    xScale: 0.2,
    yScale: 0.2
  });
  // Implement merging here so we don't have to everywhere
  const mergeView = useCallback(function(value) {
    setView(prev => {
      return {
        ...prev,
        ...value
      };
    });
  }, []);

  return (
    <Suspense fallback={<Progress />}>
      <div style={{ margin: "0 auto" }}>
        <h2>Dev debugging data</h2>
        <div style={{ display: "none" }}>
          <label>
            X value
            <input type="number" value={x} onChange={e => setX(e.target.value)} />
          </label>
          <label>
            Y value
            <input type="number" value={y} onChange={e => setY(e.target.value)} />
          </label>
        </div>
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
      <CrossSection
        message={"Cross-section"}
        x={x}
        y={y}
        updateX={setX}
        updateY={setY}
        view={view}
        updateView={mergeView}
        wellPlan={wellPlan}
        surveys={surveys}
        formations={formations}
      />
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
