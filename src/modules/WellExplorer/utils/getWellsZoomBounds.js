import L from "leaflet";

export function getWellZoomBounds(well) {
  return well
    ? L.latLngBounds(
        L.latLng(well.surfacePosition[0] - 0.4, well.surfacePosition[1] - 0.4),
        L.latLng(well.surfacePosition[0] + 0.4, well.surfacePosition[1] + 0.4)
      )
    : null;
}

export function getWellsZoomBounds(wells) {
  if (wells.length === 0) {
    return null;
  } else if (wells.length === 1) {
    return getWellZoomBounds(wells[0]);
  } else {
    const { minLat, minLng, maxLat, maxLng } = wells.reduce(
      (acc, next) => {
        return {
          minLat: Math.min(next.surfacePosition[0], acc.minLat),
          minLng: Math.min(next.surfacePosition[1], acc.minLng),
          maxLat: Math.max(next.surfacePosition[0], acc.maxLat),
          maxLng: Math.max(next.surfacePosition[1], acc.maxLng)
        };
      },
      {
        minLat: wells[0].surfacePosition[0],
        minLng: wells[0].surfacePosition[1],
        maxLat: wells[0].surfacePosition[0],
        maxLng: wells[0].surfacePosition[1]
      }
    );
    return L.latLngBounds(L.latLng(minLat - 1, minLng - 1), L.latLng(maxLat + 1, maxLng + 1));
  }
}
