import React, { useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { AddCircleOutline, Adjust, RemoveCircleOutline } from "@material-ui/icons";

import { useInterval } from "./useInterval";
import { STEP_SIZE } from "../../../../../constants/timeSlider";

function ZoomControls({ className, setZoom, isZooming, setIsZooming, zoom, zoomInDisabled, zoomOutDisabled }) {
  let zoomTimeout = useRef(null);

  const handleResetZoom = useCallback(() => {
    setZoom([0, 0]);
  }, [setZoom]);

  const onZoomInDown = useCallback(() => {
    setZoom(zoom => [zoom[0] + STEP_SIZE, 1]);
    zoomTimeout.current = setTimeout(() => setIsZooming(true), 600);
  }, [setZoom, setIsZooming]);

  const onZoomOutDown = useCallback(() => {
    setZoom(zoom => [zoom[0] - STEP_SIZE, -1]);
    zoomTimeout.current = setTimeout(() => setIsZooming(true), 600);
  }, [setZoom, setIsZooming]);

  const onMouseUp = useCallback(() => {
    clearTimeout(zoomTimeout.current);
    setIsZooming(false);
  }, [setIsZooming]);

  // Determine if zooming in a particular direction is enabled
  const isZoomingEnabled = (zoom[1] > 0 && !zoomInDisabled) || (zoom[1] < 0 && !zoomOutDisabled);
  useInterval(
    () => setZoom(zoom => [zoom[0] + STEP_SIZE * zoom[1], zoom[1]]),
    isZooming && isZoomingEnabled ? 50 : null
  );

  useEffect(() => {
    // Stop zoom if mouseup happens outside component
    window.addEventListener("mouseup", onMouseUp, false);
    return () => {
      window.removeEventListener("mouseup", onMouseUp, false);
    };
  }, [onMouseUp])

  return (
    <div className={className}>
      <IconButton onMouseDown={onZoomOutDown} onMouseUp={onMouseUp} disabled={zoomOutDisabled}>
        <RemoveCircleOutline />
      </IconButton>
      <IconButton onClick={handleResetZoom}>
        <Adjust />
      </IconButton>
      <IconButton onMouseDown={onZoomInDown} onMouseUp={onMouseUp} disabled={zoomInDisabled}>
        <AddCircleOutline />
      </IconButton>
    </div>
  );
}

ZoomControls.propTypes = {
  className: PropTypes.string,
  setZoom: PropTypes.func,
  isZooming: PropTypes.bool,
  setIsZooming: PropTypes.func,
  zoom: PropTypes.arrayOf(PropTypes.number),
  zoomInDisabled: PropTypes.bool,
  zoomOutDisabled: PropTypes.bool
};

export default ZoomControls;
