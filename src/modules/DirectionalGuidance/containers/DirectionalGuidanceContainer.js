import { lazy } from "react";

const DirectionalGuidance = lazy(() =>
  import(/* webpackChunkName: 'DirectionalGuidance' */ "../components/DirectionalGuidance")
);

export default DirectionalGuidance;
