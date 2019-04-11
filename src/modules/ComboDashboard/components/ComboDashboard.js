import React, { Suspense, useState } from "react";
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

  const [view, _setView] = useState({
    x: 50,
    y: 20,
    xScale: 1,
    yScale: 1
  });
  const setView = function(value) {
    _setView(prev => {
      if (typeof value === "function") {
        return value(prev);
      }
      return {
        ...prev,
        ...value
      };
    });
  };

  return (
    <Suspense fallback={<Progress />}>
      <div style={{ margin: "0 auto", display: "none" }}>
        <h2>Dev debugging data</h2>
        <div>
          <label>
            X value
            <input type="number" value={x} onChange={e => setX(e.target.value)} />
          </label>
          <br />
          <label>
            Y value
            <input type="number" value={y} onChange={e => setY(e.target.value)} />
          </label>
        </div>
        <div>
          <h4>viewport</h4>
          <label>
            X value
            <input
              type="number"
              value={view.x}
              onChange={e => {
                const value = e.target.value;
                return setView({ x: value });
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
                return setView({ y: value });
              }}
            />
          </label>
          <br />
          <label>
            xScale
            <input
              type="number"
              step="0.01"
              value={view.xScale}
              onChange={e => {
                const value = e.target.value;
                return setView({ xScale: value });
              }}
            />
          </label>
          <label>
            yScale
            <input
              type="number"
              step="0.01"
              value={view.yScale}
              onChange={e => {
                const value = e.target.value;
                return setView({ yScale: value });
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
        updateView={setView}
        wellPlan={wellPlan}
        surveys={surveys}
        formations={formations}
      />
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
