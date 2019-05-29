import React, { useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { AddCircleOutline, Adjust, RemoveCircleOutline } from "@material-ui/icons";

import { useInterval } from "./useInterval";
import { GRID_GUTTER } from "../../../../../constants/timeSlider";

function ZoomControls({
  className,
  zoomType,
  setZoomType,
  zoomInDisabled,
  zoomOutDisabled,
  updateView,
  width,
  maxSliderStep,
  step,
  dataSize,
  getInitialViewXScaleValue,
  onReset
}) {
  let zoomTimeout = useRef(null);
  const graphTotalLength = dataSize;

  // Update view based on zoom direction
  const onZoom = useCallback(
    type => {
      if (type) {
        updateView(prev => {
          const stepFactor = ((step * (width + GRID_GUTTER)) / maxSliderStep).toFixed(2);
          const factor = type === "IN" ? 1.03 : 0.97;
          const graphHiddenLength = Math.abs(prev.x) / prev.xScale;
          const graphVisibleLength = (graphTotalLength - graphHiddenLength) * prev.xScale;

          // Graph should either take up entire view, or be larger than view
          const isVisibleOverflow = graphVisibleLength >= width - GRID_GUTTER;

          let newX = stepFactor - (stepFactor - prev.x) * factor;
          const newScale = prev.xScale * factor;

          // Adjust graph if zoom moves it out of view
          if (!isVisibleOverflow) {
            newX = newX + (width - graphVisibleLength + GRID_GUTTER) * factor;
          }

          return {
            ...prev,
            x: newX <= 0 ? newX : 0,
            xScale: newX <= 0 ? newScale : getInitialViewXScaleValue(width - GRID_GUTTER)
          };
        });
      }
    },
    [getInitialViewXScaleValue, graphTotalLength, updateView, width, maxSliderStep, step]
  );

  const handleResetZoom = useCallback(() => {
    onReset();
  }, [onReset]);

  const onZoomInDown = useCallback(() => {
    onZoom("IN");
    zoomTimeout.current = setTimeout(() => setZoomType("IN"), 600);
  }, [onZoom, setZoomType]);

  const onZoomOutDown = useCallback(() => {
    onZoom("OUT");
    zoomTimeout.current = setTimeout(() => setZoomType("OUT"), 600);
  }, [onZoom, setZoomType]);

  const onMouseUp = useCallback(() => {
    clearTimeout(zoomTimeout.current);
    setZoomType("");
  }, [setZoomType]);

  // Determine if zooming in a particular direction is enabled
  const isZoomingEnabled = (zoomType === "IN" && !zoomInDisabled) || (zoomType === "OUT" && !zoomOutDisabled);
  useInterval(() => onZoom(zoomType), zoomType && isZoomingEnabled ? 50 : null);

  // Stop zoom if mouseup happens outside component
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseUp]);

  return (
    <div className={className}>
      <IconButton onMouseDown={onZoomOutDown} disabled={zoomOutDisabled}>
        <RemoveCircleOutline />
      </IconButton>
      <IconButton onClick={handleResetZoom}>
        <Adjust />
      </IconButton>
      <IconButton onMouseDown={onZoomInDown} disabled={zoomInDisabled}>
        <AddCircleOutline />
      </IconButton>
    </div>
  );
}

ZoomControls.propTypes = {
  className: PropTypes.string,
  zoomType: PropTypes.string,
  setZoomType: PropTypes.func,
  zoomInDisabled: PropTypes.bool,
  zoomOutDisabled: PropTypes.bool,
  updateView: PropTypes.func,
  width: PropTypes.number,
  maxSliderStep: PropTypes.number,
  step: PropTypes.number,
  dataSize: PropTypes.number,
  getInitialViewXScaleValue: PropTypes.func,
  onReset: PropTypes.func
};

export default ZoomControls;
