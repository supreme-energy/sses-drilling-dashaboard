import React, { Component, Suspense, useState } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import CrossSection from "./CrossSection/index";

export const ComboDashboard = () => {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);

  const [view, setView] = useState({
    x: 0,
    y: 0,
    w: 600,
    h: 400
  });

  return (
    <Suspense fallback={<Progress />}>
      <div style={{ margin: "0 auto" }}>
        <h2>ComboDashboard</h2>
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
          <label>
            viewport X value
            <input
              type="number"
              value={view.x}
              onChange={e => {
                let newX = e.target.value;
                return setView(prev => {
                  return { ...prev, x: newX };
                });
              }}
            />
          </label>
          <br />
          <label>
            viewport Y value
            <input
              type="number"
              value={view.y}
              onChange={e => {
                let newY = e.target.value;
                return setView(prev => {
                  return { ...prev, y: newY };
                });
              }}
            />
          </label>
        </div>
        <CrossSection message={"Hello from React"} x={x} y={y} setX={setX} setY={setY} view={view} setView={setView} />
      </div>
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
