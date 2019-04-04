import React, { Suspense } from "react";
import PropTypes from "prop-types";
import Progress from "@material-ui/core/CircularProgress";

export const WellExplorer = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: "0 auto" }}>
      <h2>WellExplorer</h2>
    </div>
  </Suspense>
);
WellExplorer.propTypes = {};

export default WellExplorer;
