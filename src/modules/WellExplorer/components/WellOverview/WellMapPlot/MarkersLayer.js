import React, { forwardRef, useImperativeHandle } from "react";
import { Marker, FeatureGroup } from "react-leaflet";

import useRef from "react-powertools/hooks/useRef";

function WellPhasePointsLayer({ zIndexOffset, markers }, ref) {
  const groupRef = useRef(null);
  const { current: group } = groupRef;

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      return group && group.leafletElement.getBounds();
    }
  }));
  return (
    <FeatureGroup ref={groupRef}>
      {markers.map((m, i) => (
        <Marker position={m.position} icon={m.icon} zIndexOffset={zIndexOffset + i} />
      ))}
    </FeatureGroup>
  );
}

WellPhasePointsLayer.defaultProps = {
  zIndexOffset: 0
};

export default forwardRef(WellPhasePointsLayer);
