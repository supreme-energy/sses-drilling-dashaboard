import React, { Component, Suspense, useState } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import CrossSection from "./CrossSection/index";

export const ComboDashboard = () => {
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
      <CrossSection message={"Cross-section"} x={x} y={y} setX={setX} setY={setY} view={view} setView={setView} />
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
