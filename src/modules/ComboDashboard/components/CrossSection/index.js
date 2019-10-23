import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixiCrossSection from "./PixiCrossSection";
import classes from "./CrossSection.scss";
import { useCrossSectionContainer } from "../../../App/Containers";
import { NORMAL } from "../../../../constants/crossSectionModes";
import { HORIZONTAL } from "../../../../constants/crossSectionViewDirection";

import { useUpdateSegmentsById } from "../../../Interpretation/actions";
import { useSaveSurveysAndProjections } from "../../../App/actions";
import TCLLine from "./TCLLine";

const pixiApp = new PixiCrossSection();

const CrossSection = React.memo(props => {
  const { width, height, viewDirection, view, updateView, isReadOnly } = props;
  const canvas = useRef(null);
  const [mode, setMode] = useState(NORMAL);
  const dataObj = useCrossSectionContainer();
  const updateSegments = useUpdateSegmentsById();
  const { debouncedSave } = useSaveSurveysAndProjections();

  const {
    wellPlan,
    selectedSections,
    toggleSegmentSelection,
    deselectAll,
    calcSections,
    calculatedFormations,
    addProjection,
    deleteProjection
  } = dataObj;

  const [xField, yField] = useMemo(() => {
    if (viewDirection === HORIZONTAL) {
      return ["ew", "ns"];
    } else {
      return ["vs", "tvd"];
    }
  }, [viewDirection]);

  const yAxisDirection = useMemo(() => {
    return viewDirection ? -1 : 1;
  }, [viewDirection]);

  useEffect(() => {
    // TODO: Calculate the zoom to fit the new data view
    // Currently initialized the graph at the first Well plan data point
    const minX = Math.min(...wellPlan.map(d => d[xField]));
    const minY = Math.min(...wellPlan.map(d => d[yField]));
    updateView(prev => {
      if ((prev && (prev.xScale !== 1 || prev.yScale !== 1)) || !wellPlan.length) {
        return prev;
      }
      return {
        ...prev,
        x: -minX,
        y: -minY
      };
    });
  }, [xField, yField, updateView, wellPlan]);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0
  });

  const scale = useCallback((xVal, yVal) => [xVal * view.xScale + view.x, yVal * view.yScale + view.y], [view]);

  useEffect(() => {
    const currentCanvas = canvas.current;

    pixiApp.init(
      {
        ...dataObj,
        ...props,
        view,
        updateView,
        scale,
        mode,
        setMode,
        mouse,
        setMouse,
        xField,
        yField,
        yAxisDirection,
        updateSegments,
        debouncedSave,
        isReadOnly
      },
      view,
      updateView
    );
    currentCanvas.appendChild(pixiApp.renderer.view);
    return () => {
      pixiApp.cleanUp();
      currentCanvas.removeChild(pixiApp.renderer.view);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pixiApp.resize(width, height);
  }, [width, height]);

  useEffect(() => {
    pixiApp.update({
      width,
      height,
      wellPlan,
      selectedSections,
      toggleSegmentSelection,
      deselectAll,
      calcSections,
      calculatedFormations,
      scale,
      view,
      updateView,
      mode,
      setMode,
      mouse,
      setMouse,
      xField,
      yField,
      viewDirection,
      yAxisDirection,
      addProjection,
      deleteProjection,
      updateSegments,
      debouncedSave,
      isReadOnly
    });
  }, [
    view.x,
    view.y,
    view.xScale,
    view.yScale,
    view,
    width,
    height,
    wellPlan,
    selectedSections,
    toggleSegmentSelection,
    deselectAll,
    calcSections,
    calculatedFormations,
    scale,
    mode,
    setMode,
    mouse,
    setMouse,
    xField,
    yField,
    viewDirection,
    yAxisDirection,
    addProjection,
    updateView,
    deleteProjection,
    updateSegments,
    debouncedSave,
    isReadOnly
  ]);

  return (
    <React.Fragment>
      <div className={classes.crossSection} ref={canvas} />
      <TCLLine container={pixiApp.tclLineLayer} view={view} />
    </React.Fragment>
  );
});

CrossSection.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  viewDirection: PropTypes.number,
  isReadOnly: PropTypes.bool,
  view: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  }),
  updateView: PropTypes.func
};

export default CrossSection;
