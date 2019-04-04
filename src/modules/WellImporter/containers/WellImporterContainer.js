import { lazy } from "react";

const WellImporter = lazy(() => import(/* webpackChunkName: 'WellImporter' */ "../components/WellImporter"));

export default WellImporter;
