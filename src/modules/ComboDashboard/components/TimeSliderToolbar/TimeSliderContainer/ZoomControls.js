import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { AddCircleOutline, Adjust, RemoveCircleOutline } from "@material-ui/icons";
import classNames from "classnames";

import { useInterval } from "./useInterval";
import { STEP_VALUE } from "../../../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

let zoomTimeout;

function ZoomControls({ className, setZoom, isZooming, setIsZooming, zoom, zoomInDisabled, zoomOutDisabled }) {
  const handleResetZoom = useCallback(() => {
    setZoom([0, 0]);
  }, [setZoom]);

  const onZoomInDown = useCallback(() => {
    setZoom(zoom => [zoom[0] + STEP_VALUE, 1]);
    zoomTimeout = setTimeout(() => setIsZooming(true), 600);
  }, [setZoom, setIsZooming]);

  const onZoomOutDown = useCallback(() => {
    setZoom(zoom => [zoom[0] - STEP_VALUE, -1]);
    zoomTimeout = setTimeout(() => setIsZooming(true), 600);
  }, [setZoom, setIsZooming]);

  const onMouseUp = useCallback(() => {
    clearTimeout(zoomTimeout);
    setIsZooming(false);
  }, [setIsZooming]);

  // Stop zoom if mouseup happens outside component
  window.addEventListener("mouseup", onMouseUp, false);

  const isZoomingEnabled = (zoom[1] > 0 && !zoomInDisabled) || (zoom[1] < 0 && !zoomOutDisabled);
  useInterval(
    () => setZoom(zoom => [zoom[0] + STEP_VALUE * zoom[1], zoom[1]]),
    isZooming && isZoomingEnabled ? 50 : null
  );

  // Too few data points on screen will make slider useless
  return (
    <div className={classNames(classes.zoomControls, className)}>
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
