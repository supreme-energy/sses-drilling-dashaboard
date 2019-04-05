import React, { lazy, Suspense } from "react";

import Progress from "@material-ui/core/CircularProgress";

const WellMap = lazy(() => import(/* webpackChunkName: 'WellMap' */ "./WellMap"));

const markers = [[26.005, -96], [27.505, -97], [29.05, -97.5], [28.05, -97.3], [30.505, -95], [29.505, -96.0]];

const mapCenter = {
  lat: 30.0902,
  lng: -95.7129
};

export const WellExplorer = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: "0 auto" }}>
      <WellMap
        markers={markers}
        mapCenter={mapCenter}
        handleClickWell={() => {}}
        zoomControl={false}
        scrollWheelZoom={false}
      />
    </div>
  </Suspense>
);
WellExplorer.propTypes = {};

export default WellExplorer;
