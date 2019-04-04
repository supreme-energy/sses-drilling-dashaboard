import React, { Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";

export const DirectionalGuidance = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: "0 auto" }}>
      <h2>DirectionalGuidance</h2>
    </div>
  </Suspense>
);
DirectionalGuidance.propTypes = {};

export default DirectionalGuidance;
