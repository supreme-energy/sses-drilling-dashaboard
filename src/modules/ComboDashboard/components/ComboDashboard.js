import React, { Component, Suspense, useState } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";
import CrossSection from "./CrossSection";

export const ComboDashboard = () => {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
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
        <CrossSection message={"Hello from React"} x={x} y={y} setX={setX} setY={setY} />
      </div>
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
