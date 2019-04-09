import React, { Component, Suspense, useState } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import CrossSection from "./CrossSection/index";

export const ComboDashboard = () => {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);

  const [view, _setView] = useState({
    x: 0,
    y: 0,
    w: 1000,
    h: 1000,
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
      <div style={{ margin: "0 auto" }}>
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
                let newX = e.target.value;
                return setView(prev => {
                  return { ...prev, x: newX };
                });
              }}
            />
          </label>
          <label>
            Y value
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
          <br />
          <label>
            xScale
            <input
              type="number"
              step="0.1"
              value={view.xScale}
              onChange={e => {
                let value = e.target.value;
                return setView(prev => {
                  return { ...prev, xScale: value };
                });
              }}
            />
          </label>
          <label>
            yScale
            <input
              type="number"
              step="0.1"
              value={view.yScale}
              onChange={e => {
                let value = e.target.value;
                return setView(prev => {
                  return { ...prev, yScale: value };
                });
              }}
            />
          </label>
          <br />
          <label>
            width
            <input
              type="number"
              value={view.w}
              onChange={e => {
                let value = e.target.value;
                return setView(prev => {
                  return { ...prev, w: value };
                });
              }}
            />
          </label>
          <label>
            height
            <input
              type="number"
              value={view.h}
              onChange={e => {
                let value = e.target.value;
                return setView(prev => {
                  return { ...prev, h: value };
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
