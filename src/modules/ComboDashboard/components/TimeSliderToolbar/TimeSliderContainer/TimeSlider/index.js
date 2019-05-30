import React, { useEffect, useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import Slider from "@material-ui/lab/Slider";
import classNames from "classnames";

import useRef from "react-powertools/hooks/useRef";

import PixiContainer from "../../../../../WellExplorer/components/WellOverview/ROP/PixiContainer";
import PixiRectangle from "../../../../../WellExplorer/components/WellOverview/ROP/PixiRectangle";
import PixiLine from "../../../../../WellExplorer/components/WellOverview/ROP/PixiLine";
import useViewport from "../../../../../WellExplorer/components/WellOverview/ROP/useViewport";
import { useWebGLRenderer } from "../../../../../WellExplorer/components/WellOverview/ROP/useWebGLRenderer";
import { STEP_SIZE, LINE_GRAPHS, COLOR_BY_GRAPH, GRID_GUTTER } from "../../../../../../constants/timeSlider";
import { mapRop, mapSlide } from "./TimeSliderUtil";
import classes from "../TimeSlider.scss";

function Slide({ expanded, step, setSliderStep, selectedGraphs, data, maxStep, view, updateView, width, height }, ref) {
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: ref.current, width, height });

  const viewportContainer = useRef(null);

  // Determine if graph has been moved off screen by drag
  const isGraphWithinBounds = (xScale, newX) => data.length * xScale - Math.abs(newX) > width - GRID_GUTTER;

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: true,
    zoomYScale: false,
    isDragValid: isGraphWithinBounds
  });

  useEffect(() => {
    refresh();
  }, [refresh, stage, data, view, width, height, selectedGraphs]);

  const handleDragSlider = useCallback(
    (_, currentStep) => {
      setSliderStep([currentStep, 1]);
    },
    [setSliderStep]
  );

  return (
    <div className={classes.timeSliderComponent}>
      <div className={classNames(classes.timeSliderGraph, !expanded && classes.timeSliderGraphCollapsed)} ref={ref}>
        <PixiContainer ref={viewportContainer} container={stage} />
        {selectedGraphs.map((graph, index) => {
          if (LINE_GRAPHS.includes(graph)) {
            return (
              <PixiContainer
                key={graph}
                container={viewport}
                child={container => (
                  <PixiLine
                    container={container}
                    data={data}
                    mapData={graph === "ROP" ? mapRop : mapSlide}
                    color={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                  />
                )}
              />
            );
          } else {
            // TODO Implement based on real data
            return (
              <PixiContainer
                key={graph}
                container={viewport}
                child={container =>
                  data.map((data, barIndex) => {
                    if (barIndex % 131 === 0) {
                      return (
                        <PixiRectangle
                          key={barIndex}
                          container={container}
                          x={100 * barIndex + 100}
                          y={0}
                          width={50}
                          height={9000}
                          backgroundColor={parseInt("0x" + COLOR_BY_GRAPH[graph])}
                        />
                      );
                    }
                  })
                }
              />
            );
          }
        })}
      </div>
      <Slider
        className={expanded ? classes.timeSliderExpanded : classes.timeSliderCollapsed}
        value={step}
        max={maxStep}
        onChange={handleDragSlider}
        step={STEP_SIZE}
      />
    </div>
  );
}

const TimeSlider = forwardRef(Slide);

TimeSlider.propTypes = {
  expanded: PropTypes.bool,
  step: PropTypes.number,
  setSliderStep: PropTypes.func,
  selectedGraphs: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(PropTypes.object),
  maxStep: PropTypes.number,
  view: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  }),
  updateView: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number
};

export default TimeSlider;
