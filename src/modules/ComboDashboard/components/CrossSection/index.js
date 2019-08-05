import PropTypes from "prop-types";
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import PixiCrossSection from "./PixiCrossSection";
import classes from "./CrossSection.scss";
import { useCrossSectionContainer } from "../../../App/Containers";
import { NORMAL } from "../../../../constants/crossSectionModes";

const pixiApp = new PixiCrossSection();

const CrossSection = props => {
  const { width, height, viewDirection } = props;
  console.log(viewDirection);
  const canvas = useRef(null);
  const [mode, setMode] = useState(NORMAL);
  const dataObj = useCrossSectionContainer();
  const {
    wellPlan,
    selectedSections,
    setSelectedMd,
    deselectMd,
    selectedMd,
    ghostDiff,
    ghostDiffDispatch,
    calcSections,
    calculatedFormations
  } = dataObj;

  const [view, updateView] = useReducer(
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    // TODO: calculate these based on some 'default zoom' estimate from data (will need width/height)
    {
      x: -844,
      y: -16700,
      xScale: 2.14,
      yScale: 2.14
    }
  );

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0
  });

  const scale = useCallback((xVal, yVal) => [xVal * view.xScale + view.x, yVal * view.yScale + view.y], [view]);

  useEffect(() => {
    const currentCanvas = canvas.current;

    pixiApp.init({ ...dataObj, ...props, view, updateView, scale, mode, setMode, mouse, setMouse }, view, updateView);
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
      setSelectedMd,
      deselectMd,
      selectedMd,
      ghostDiffDispatch,
      ghostDiff,
      calcSections,
      calculatedFormations,
      scale,
      view,
      updateView,
      mode,
      setMode,
      mouse,
      setMouse,
      viewDirection
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
    setSelectedMd,
    deselectMd,
    selectedMd,
    ghostDiffDispatch,
    ghostDiff,
    calcSections,
    calculatedFormations,
    scale,
    mode,
    setMode,
    mouse,
    setMouse,
    viewDirection
  ]);

  return <div className={classes.crossSection} ref={canvas} />;
};

CrossSection.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number
};

export default CrossSection;
