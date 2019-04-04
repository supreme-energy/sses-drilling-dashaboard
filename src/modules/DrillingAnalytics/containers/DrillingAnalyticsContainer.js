import { lazy } from "react";

const DrillingAnalytics = lazy(() =>
  import(/* webpackChunkName: 'DrillingAnalytics' */ "../components/DrillingAnalytics")
);

export default DrillingAnalytics;
