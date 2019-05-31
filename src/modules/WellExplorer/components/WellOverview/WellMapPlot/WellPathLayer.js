import React from "react";
import { Polyline } from "react-leaflet";
export function WellPathLayer({ data, mapData }) {
  return <Polyline positions={data.map(mapData)} />;
}
