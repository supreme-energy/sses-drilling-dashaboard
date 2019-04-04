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
        <p>
          x: {x} y: {y}
        </p>
        <CrossSection message={"Hello from React"} x={x} y={y} setX={setX} setY={setY} />
      </div>
    </Suspense>
  );
};
ComboDashboard.propTypes = {};

export default ComboDashboard;
