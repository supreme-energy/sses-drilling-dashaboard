import React, { useCallback, useRef, useEffect, useMemo } from "react";
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
  const stepFactor = useMemo(() => {
    return ((step * (width + GRID_GUTTER)) / maxSliderStep).toFixed(2);
  }, [step, width, maxSliderStep]);

  const onZoom = useCallback(
    type => {
      if (type) {
        updateView(prev => {
          const factor = type === "IN" ? 1.03 : 0.97;
          const graphHiddenLength = Math.abs(prev.x) / prev.xScale;
          const graphVisibleLength = (graphTotalLength - graphHiddenLength) * prev.xScale;
          // Graph should either take up entire view, or be larger than view
          const isTotalOverflow = graphTotalLength * prev.xScale * factor >= Math.floor(width - GRID_GUTTER);
          const isVisibleOverflow = graphVisibleLength >= width - GRID_GUTTER;
          let newX = stepFactor - (stepFactor - prev.x) * factor;
          let newScale = prev.xScale * factor;
          if (!isVisibleOverflow && type === "IN") {
            newX = newX + (width - graphVisibleLength - GRID_GUTTER);
          } else if (!isTotalOverflow && !isVisibleOverflow && type === "OUT") {
            newX = 0;
            newScale = getInitialViewXScaleValue(width - GRID_GUTTER);
          }

          return {
            ...prev,
            x: newX <= 0 ? newX : prev.x,
            xScale: newScale
          };
        });
      }
    },
    [getInitialViewXScaleValue, graphTotalLength, updateView, width, stepFactor]
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

  useEffect(() => {
    // Stop zoom if mouseup happens outside component
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
