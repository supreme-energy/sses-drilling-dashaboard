import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { IconButton } from "@material-ui/core";
import { AddCircleOutline, Adjust, RemoveCircleOutline } from "@material-ui/icons";
import classNames from "classnames";

import { useInterval } from "./useInterval";
import { STEP_VALUE } from "./index";
import classes from "./TimeSlider.scss";

function ZoomControls({ className, setZoom, isZooming, setIsZooming }) {
  const handleResetZoom = useCallback(() => {
    setZoom([0, 0]);
  });

  const onZoomInDown = useCallback(() => {
    setZoom(zoom => [zoom[0] + STEP_VALUE, 1]);
    setIsZooming();
  });

  const onZoomOutDown = useCallback(() => {
    setZoom(zoom => [zoom[0] - STEP_VALUE, -1]);
    setIsZooming();
  });

  const onMouseUp = useCallback(() => {
    setIsZooming();
  });

  useInterval(
    () => {
      if (isZooming) {
        setZoom(zoom => [zoom[0] + STEP_VALUE * zoom[1], zoom[1]]);
      }
    },
    isZooming ? 200 : null
  );

  return (
    <div className={classNames(classes.zoomControls, className)}>
      <IconButton onMouseDown={onZoomOutDown} onMouseUp={onMouseUp}>
        <RemoveCircleOutline />
      </IconButton>
      <IconButton onClick={handleResetZoom}>
        <Adjust />
      </IconButton>
      <IconButton onMouseDown={onZoomInDown} onMouseUp={onMouseUp}>
        <AddCircleOutline />
      </IconButton>
    </div>
  );
}

ZoomControls.propTypes = {
  className: PropTypes.string,
  setZoom: PropTypes.func,
  isZooming: PropTypes.bool,
  setIsZooming: PropTypes.func
};

export default ZoomControls;
