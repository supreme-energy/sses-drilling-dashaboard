import L from "leaflet";

export function getWellZoomBounds(well, getPosition = d => d.surfacePosition) {
  return well
    ? L.latLngBounds(
        L.latLng(getPosition(well)[0] - 0.4, getPosition(well)[1] - 0.4),
        L.latLng(getPosition(well)[0] + 0.4, getPosition(well)[1] + 0.4)
      )
    : null;
}

export function getWellsZoomBounds(wells, mapPosition = d => d.surfacePosition) {
  if (wells.length === 0) {
    return null;
  } else if (wells.length === 1) {
    return getWellZoomBounds(wells[0], mapPosition);
  } else {
    const { minLat, minLng, maxLat, maxLng } = wells.reduce(
      (acc, next) => {
        return {
          minLat: Math.min(mapPosition(next)[0], acc.minLat),
          minLng: Math.min(mapPosition(next)[1], acc.minLng),
          maxLat: Math.max(mapPosition(next)[0], acc.maxLat),
          maxLng: Math.max(mapPosition(next)[1], acc.maxLng)
        };
      },
      {
        minLat: mapPosition(wells[0])[0],
        minLng: mapPosition(wells[0])[1],
        maxLat: mapPosition(wells[0])[0],
        maxLng: mapPosition(wells[0])[1]
      }
    );
    return L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng));
  }
}
