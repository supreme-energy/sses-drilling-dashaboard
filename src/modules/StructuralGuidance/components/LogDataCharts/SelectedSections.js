import React, { useRef, useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import _ from "lodash";

import { useAdditionalDataLog, useAdditionalDataLogsList } from "../../../../api";

import classes from "./styles.scss";
import PixiContainer from "../../../../components/PixiContainer";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiRectangle from "../../../../components/PixiRectangle";

const SCALE_FACTOR = 1;

// TODO: Build Selected Sections Component
function SelectedSections({ wellId }) {
  const { dataBySection: additionalDataLogKeys = {} } = useAdditionalDataLogsList(wellId);
  const getFieldId = field => _.get(additionalDataLogKeys, `${field}.id`);
  const { data: gamma = [] } = useAdditionalDataLog(wellId, getFieldId("GR"));

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const scaleInitialized = useRef(false);

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: true,
    zoomYScale: true,
    isXScalingValid: () => 1
  });

  const onScale = useCallback(() => {
    const minDepth = Math.min(...gamma.map(d => d.md));
    const minValue = Math.min(...gamma.map(d => d.value));

    updateView(view => {
      return {
        ...view,
        x: (-minDepth + 20) * view.xScale,
        y: (-minValue + 40) * view.yScale,
        yScale: SCALE_FACTOR,
        xScale: SCALE_FACTOR
      };
    });
  }, [gamma]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (gamma && gamma.length && width && height && !scaleInitialized.current) {
        onScale();
        scaleInitialized.current = true;
      }
    },
    [width, gamma, height, onScale]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, gamma]
  );

  return (
    <div className={classes.plot} ref={canvasRef}>
      <PixiContainer ref={viewportContainer} container={stage} />
      <PixiRectangle container={viewport} y={-50} radius={3} zIndex={100} />
    </div>
  );
}

SelectedSections.propTypes = {
  wellId: PropTypes.string
};

export default SelectedSections;
