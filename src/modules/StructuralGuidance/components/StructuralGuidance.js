import React, { Suspense } from "react";
import Progress from "@material-ui/core/CircularProgress";

export const StructuralGuidance = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: "0 auto" }}>
      <h2>StructuralGuidance</h2>
    </div>
  </Suspense>
);
StructuralGuidance.propTypes = {};

export default StructuralGuidance;
