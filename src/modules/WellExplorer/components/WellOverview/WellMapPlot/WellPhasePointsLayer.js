import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { Marker, FeatureGroup } from "react-leaflet";
import { useWellInfo } from "../../../../../api";
import L from "leaflet";
import classes from "./styles.scss";
import classNames from "classnames";
import useRef from "react-powertools/hooks/useRef";

const SurfaceIcon = L.divIcon({ className: classes.phasePointIcon, iconAnchor: [6, 12] });
const LandingIcon = L.divIcon({ className: classNames(classes.phasePointIcon, classes.landing), iconAnchor: [6, 12] });
const PBHLIcon = L.divIcon({ className: classNames(classes.phasePointIcon, classes.pbhl), iconAnchor: [6, 6] });

function WellPhasePointsLayer({ wellId, zIndexOffset }, ref) {
  const [{ wellSurfaceLocation, wellLandingLocation, wellPBHL }] = useWellInfo(wellId);
  const groupRef = useRef(null);
  const { current: group } = groupRef;

  useImperativeHandle(ref, () => ({
    getBounds: () => {
      return group && group.leafletElement.getBounds();
    }
  }));
  return (
    <FeatureGroup ref={groupRef}>
      {wellSurfaceLocation && (
        <Marker
          position={[wellSurfaceLocation.y, wellSurfaceLocation.x]}
          icon={SurfaceIcon}
          zIndexOffset={zIndexOffset}
        />
      )}
      {wellLandingLocation && (
        <Marker
          position={[wellLandingLocation.y, wellLandingLocation.x]}
          icon={LandingIcon}
          zIndexOffset={zIndexOffset + 1}
        />
      )}
      {wellPBHL && <Marker position={[wellPBHL.y, wellPBHL.x]} icon={PBHLIcon} zIndexOffset={zIndexOffset + 2} />}
      {/* {wellPBHL && <Circle center={[wellPBHL.y, wellPBHL.x]} radius={2} zIndexOffset={zIndexOffset + 3} />} */}
    </FeatureGroup>
  );
}

export default forwardRef(WellPhasePointsLayer);
