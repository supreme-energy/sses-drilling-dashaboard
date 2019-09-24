import React, { useRef, useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";

import { useCrossSectionContainer } from "../../../App/Containers";
import Segments from "./Segments";
import classes from "./styles.scss";
import WebGlContainer from "../../../../components/WebGlContainer";
import PixiContainer from "../../../../components/PixiContainer";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";

const gridGutter = 20;

const SegmentPlot = ({ newView, xAxis }) => {
  const { calcSections, selectedSections } = useCrossSectionContainer();

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });
  const viewportContainer = useRef(null);

  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: false,
    zoomYScale: false
  });

  const onScale = useCallback(newView => {
    updateView(view => {
      return {
        ...view,
        x: newView.x - gridGutter - 20,
        yScale: 1,
        xScale: newView.xScale
      };
    });
  }, []);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (calcSections && calcSections.length && width && height) {
        onScale(newView);
      }
    },
    [width, calcSections, height, onScale, newView]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, calcSections]
  );

  return (
    <React.Fragment>
      <WebGlContainer ref={canvasRef} className={classes.segmentPlot} />
      <PixiContainer ref={viewportContainer} container={stage} />
      <Segments
        container={viewport}
        segmentsData={calcSections}
        view={newView}
        axis={xAxis}
        selectedSections={selectedSections}
      />
    </React.Fragment>
  );
};

SegmentPlot.propTypes = {
  newView: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  }),
  xAxis: PropTypes.string
};

export default SegmentPlot;
